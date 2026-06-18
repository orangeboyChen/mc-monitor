'use server'

import { readFileSync, statSync } from 'fs'
import { isAbsolute, resolve } from 'path'
import { parsePrometheusText } from '@/app/lib/prom-parser'

export interface MinecraftInfoResponse {
    online: Array<string>
    state?: string
    info: MinecraftInfo
}

export interface MinecraftInfo {
    version: string
    forge: {
        version: string
        downloadUrl: string
    }
    mod: {
        version: string
        updateTime: string
        downloadUrl: string
        downloadTip?: string
    }
}

interface RealtimeStatus {
    online: Array<string>
    state?: string
}

const REFRESH_INTERVAL_MS = 10 * 1000

let lastRequestTimestamp = 0
let cacheResponse: MinecraftInfoResponse | undefined

const DEFAULT_INFO_FILE = '/config/mc-info.json'

let cachedInfo: MinecraftInfo | undefined
let cachedInfoMtimeMs = 0
let cachedInfoPath: string | undefined

/**
 * Read the static Minecraft info (version / forge / mod) from a JSON file.
 *
 * Path is taken from `MC_INFO_FILE`, defaulting to `/config/mc-info.json`
 * (the standard mount point inside the container).
 *
 * Re-reads on file mtime change, so editing the mounted JSON takes effect
 * without restarting the container.
 */
const FALLBACK_INFO: MinecraftInfo = {
    version: 'unknown',
    forge: { version: 'unknown', downloadUrl: '' },
    mod: { version: 'unknown', updateTime: '', downloadUrl: '' },
}

const resolveInfoPath = (raw: string): string =>
    isAbsolute(raw) ? raw : resolve(process.cwd(), raw)

const getStaticInfo = (): MinecraftInfo => {
    const rawPath = process.env.MC_INFO_FILE ?? DEFAULT_INFO_FILE
    const path = resolveInfoPath(rawPath)

    let mtimeMs: number
    try {
        mtimeMs = statSync(path).mtimeMs
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
            `[mc-monitor] Cannot stat MC_INFO_FILE at '${path}': ${(e as Error).message}. ` +
            'Falling back to placeholder info. Mount the JSON config or set MC_INFO_FILE.'
        )
        return FALLBACK_INFO
    }

    if (cachedInfo && cachedInfoPath === path && cachedInfoMtimeMs === mtimeMs) {
        return cachedInfo
    }

    let raw: string
    try {
        raw = readFileSync(path, 'utf8')
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
            `[mc-monitor] Cannot read MC_INFO_FILE at '${path}': ${(e as Error).message}`
        )
        return FALLBACK_INFO
    }

    try {
        const parsed = JSON.parse(raw) as MinecraftInfo
        cachedInfo = parsed
        cachedInfoPath = path
        cachedInfoMtimeMs = mtimeMs
        return parsed
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
            `[mc-monitor] MC_INFO_FILE at '${path}' is not valid JSON: ${(e as Error).message}`
        )
        return FALLBACK_INFO
    }
}

/**
 * Pull realtime player status from `heathcliff26/minecraft-exporter`.
 *
 * The exporter exposes `minecraft_player_online{name="<player>"} 1` for
 * every player currently online (and 0 when they leave). We treat the
 * presence of any `minecraft_player_online >= 1` as "server reachable".
 */
const fetchRealtimeStatus = async (): Promise<RealtimeStatus> => {
    const url = process.env.MC_EXPORTER_URL
    if (!url) {
        return { online: [], state: 'unavailable' }
    }

    let text: string
    const controller = new AbortController()
    // Hard cap so a slow exporter never blocks SSR. The UI degrades to
    // 'unavailable' and the client can refresh later.
    const timer = setTimeout(() => controller.abort(), 200)
    try {
        const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
        if (!res.ok) {
            return { online: [], state: 'unavailable' }
        }
        text = await res.text()
    } catch {
        return { online: [], state: 'unavailable' }
    } finally {
        clearTimeout(timer)
    }

    const families = parsePrometheusText(text)

    const onlineFamily = families.find((f) => f.name === 'minecraft_player_online')
    const online: Array<string> = []
    if (onlineFamily) {
        for (const s of onlineFamily.samples) {
            const name = s.labels.name ?? s.labels.player ?? s.labels.username
            if (name && s.value >= 1) {
                online.push(name)
            }
        }
    }

    // Some exporter versions only expose a count gauge. Synthesize anonymous
    // entries so the UI can still show "N players online".
    if (online.length === 0) {
        const countFamily = families.find(
            (f) => f.name === 'minecraft_player_online_total' || f.name === 'minecraft_players_online'
        )
        if (countFamily && countFamily.samples[0]) {
            const n = Math.max(0, Math.floor(countFamily.samples[0].value))
            for (let i = 0; i < n; i += 1) online.push(`player_${i + 1}`)
        }
    }

    return {
        online,
        state: 'available',
    }
}

const getMinecraftInfo = async (): Promise<MinecraftInfoResponse> => {
    const now = Date.now()
    if (now - lastRequestTimestamp <= REFRESH_INTERVAL_MS && cacheResponse != null) {
        return cacheResponse
    }

    const [status, info] = await Promise.all([
        fetchRealtimeStatus(),
        Promise.resolve().then(getStaticInfo),
    ])

    const merged: MinecraftInfoResponse = {
        online: status.online,
        state: status.state,
        info,
    }
    cacheResponse = merged
    lastRequestTimestamp = now
    return merged
}

export default getMinecraftInfo
