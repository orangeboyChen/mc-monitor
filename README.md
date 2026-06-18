# mc-monitor

[English](./README.md) · [中文](./README.zh-CN.md)

> ⚠️ **Internal use only.** This project is built for our private Minecraft
> server and is not intended to be installed by external users.

A small Next.js dashboard that pulls live data from a Minecraft server and
renders it as a single-page status board. It supports light/dark themes,
responsive layouts and three locales (中文 / English / 日本語) — switchable
at runtime from the navbar.

## What it shows

| Panel | Source |
|---|---|
| **Server status** — online / offline + current player list | `heathcliff26/minecraft-exporter` (`MC_EXPORTER_URL`) |
| **Build info** — Minecraft version + Forge build + Mod pack download | JSON config file (`MC_INFO_FILE`) |
| **Server metrics (mc-exporter)** — TPS, memory, dimensions, etc. | `MC_EXPORTER_URL` |
| **Mod metrics** — anything exposed by our `mc-server-enhanced-mod`'s `PrometheusMetricsServer` | `MOD_METRICS_URL` |
| **Logistics network storage** — searchable item table + Top-20 bar chart | `MOD_METRICS_URL` |
| **Historical trends** — line chart of `query_range` results | `PROM_URL` (optional) |

## Architecture

```
Browser ──► /api/metrics/exporter ──► MC_EXPORTER_URL  (Prometheus text)
        ──► /api/metrics/mod      ──► MOD_METRICS_URL  (Prometheus text)
        ──► /api/metrics/range    ──► PROM_URL/api/v1/query_range (JSON)
        ──► getMinecraftInfo()    ──► reads MC_INFO_FILE (JSON)
                                  └─► fetches MC_EXPORTER_URL for online list
```

All three back-end endpoints are stateless; mc-monitor never persists data of
its own.

## Quick start

### 1. Provide the static info JSON

Create a file (e.g. `mc-info.json`) following the shape in
[`mc-info.example.json`](./mc-info.example.json):

```json
{
  "version": "1.20.1",
  "forge":   { "version": "47.2.0", "downloadUrl": "https://..." },
  "mod":     { "version": "1.0.0", "updateTime": "2026-01-01",
               "downloadUrl": "https://...", "downloadTip": "..." }
}
```

### 2. Run with Docker

```bash
docker run -d \
  --name mc-monitor \
  -p 3000:3000 \
  -v $(pwd)/mc-info.json:/config/mc-info.json:ro \
  -e MC_EXPORTER_URL=http://minecraft-exporter:9150/metrics \
  -e MOD_METRICS_URL=http://minecraft:25585/metrics \
  -e PROM_URL=http://prometheus:9090 \
  ghcr.io/<your-org>/mc-monitor:latest
```

`docker-compose` example:

```yaml
services:
  mc-monitor:
    image: ghcr.io/<your-org>/mc-monitor:latest
    ports: ['3000:3000']
    volumes:
      - ./mc-info.json:/config/mc-info.json:ro
    environment:
      MC_EXPORTER_URL: http://minecraft-exporter:9150/metrics
      MOD_METRICS_URL: http://minecraft:25585/metrics
      PROM_URL: http://prometheus:9090
```

### 3. Local development

```bash
pnpm install
cp .env.example .env.local      # then edit
pnpm dev                        # http://localhost:3000
```

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `MC_INFO_FILE` | yes | `/config/mc-info.json` | Path to the JSON file with version / Forge / Mod info. Re-read on file mtime change — no restart needed. |
| `MC_EXPORTER_URL` | yes | — | Full URL to `heathcliff26/minecraft-exporter`'s `/metrics` endpoint. |
| `MOD_METRICS_URL` | yes | — | Full URL to the mod's `/metrics` endpoint. |
| `PROM_URL` | no | — | Base URL of a Prometheus instance. When unset, the History panel shows a "not configured" message. |

## Tech stack

- Next.js 14 (`output: 'standalone'`)
- NextUI v2 + Tailwind CSS (responsive, dark-mode via `class` strategy)
- Lightweight in-repo i18n (zh / en / ja, no extra runtime dependencies)
- Custom Prometheus text-format parser + raw-SVG charts (no `recharts`)
- ESLint with strict house style: single quotes, no semicolons,
  `const fn = () => {}` only — see [`.eslintrc.cjs`](./.eslintrc.cjs).

## Project layout

```
app/
  api/metrics/{exporter,mod,range}/route.ts   # back-end proxies
  i18n/                                       # message catalog + provider
  lib/                                        # prom-parser + hooks
  action.tsx                                  # server-side data aggregation
  main-client-page.tsx                        # dashboard composition
components/
  charts/                                     # bar-list, line-chart
  dashboard/                                  # status / info / metrics / storage / history
  navbar.tsx, theme-switch.tsx, language-switch.tsx
```
