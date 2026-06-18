// Tiny parser for the Prometheus text exposition format.
// Sufficient for what mc-exporter and the mod expose (no histograms with buckets,
// no exemplars). Lines we care about look like:
//
//   # HELP minecraft_player_online ...
//   # TYPE minecraft_player_online gauge
//   minecraft_player_online{server="creative", world="overworld"} 3 1718705000000
//   minecraft_player_online 5
//
// Returns a flat list of samples grouped by metric name.

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary' | 'untyped'

export interface Sample {
    name: string
    labels: Record<string, string>
    value: number
}

export interface MetricFamily {
    name: string
    help?: string
    type: MetricType
    samples: Sample[]
}

const METRIC_LINE = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{[^}]*\})?\s+([^\s]+)(?:\s+(\d+))?$/
const LABEL_PAIR = /([a-zA-Z_][a-zA-Z0-9_]*)="((?:[^"\\]|\\.)*)"/g

const parseLabels = (raw: string | undefined): Record<string, string> => {
    if (!raw) return {}
    const inner = raw.slice(1, -1) // strip {}
    const out: Record<string, string> = {}
    let m: RegExpExecArray | null
    LABEL_PAIR.lastIndex = 0
    while ((m = LABEL_PAIR.exec(inner)) != null) {
        out[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n')
    }
    return out
}

const parseValue = (raw: string): number => {
    if (raw === 'NaN') return NaN
    if (raw === '+Inf') return Number.POSITIVE_INFINITY
    if (raw === '-Inf') return Number.NEGATIVE_INFINITY
    return Number(raw)
}

export const parsePrometheusText = (text: string): MetricFamily[] => {
    const families = new Map<string, MetricFamily>()

    for (const rawLine of text.split('\n')) {
        const line = rawLine.trim()
        if (!line) continue

        if (line.startsWith('#')) {
            // # HELP <name> <help>   |   # TYPE <name> <type>
            const m = line.match(/^#\s+(HELP|TYPE)\s+([a-zA-Z_:][a-zA-Z0-9_:]*)\s+(.*)$/)
            if (!m) continue
            const [, kind, name, rest] = m
            let fam = families.get(name)
            if (!fam) {
                fam = { name, type: 'untyped', samples: [] }
                families.set(name, fam)
            }
            if (kind === 'HELP') fam.help = rest
            else fam.type = (rest as MetricType) || 'untyped'
            continue
        }

        const m = line.match(METRIC_LINE)
        if (!m) continue
        const [, name, labels, value] = m
        let fam = families.get(name)
        if (!fam) {
            fam = { name, type: 'untyped', samples: [] }
            families.set(name, fam)
        }
        fam.samples.push({
            name,
            labels: parseLabels(labels),
            value: parseValue(value),
        })
    }

    return Array.from(families.values())
}
