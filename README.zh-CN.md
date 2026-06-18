# mc-monitor

[English](./README.md) · [中文](./README.zh-CN.md)

> ⚠️ **仅供内部使用。** 本项目是为我们自己的 Minecraft 服务器搭建的内部监控面板，不面向外部用户分发。

一个基于 Next.js 的小型仪表盘，从 Minecraft 服务器拉取实时数据并以单页方式展示。支持浅色 / 深色主题、响应式布局，以及 3 种语言（中文 / English / 日本語），可在导航栏中实时切换。

## 展示的内容

| 面板 | 数据来源 |
|---|---|
| **服务器状态** — 在线 / 离线 + 当前玩家列表 | `heathcliff26/minecraft-exporter`（`MC_EXPORTER_URL`） |
| **版本信息** — Minecraft 版本、Forge、Mod 整合包下载 | JSON 配置文件（`MC_INFO_FILE`） |
| **服务器指标（mc-exporter）** — TPS、内存、维度等 | `MC_EXPORTER_URL` |
| **Mod 指标** — `mc-server-enhanced-mod` 的 `PrometheusMetricsServer` 暴露的所有指标 | `MOD_METRICS_URL` |
| **物流网络库存** — 可搜索物品表 + Top 20 柱状图 | `MOD_METRICS_URL` |
| **历史趋势** — `query_range` 折线图 | `PROM_URL`（可选） |

## 架构

```
浏览器 ──► /api/metrics/exporter ──► MC_EXPORTER_URL  (Prometheus 文本)
       ──► /api/metrics/mod      ──► MOD_METRICS_URL  (Prometheus 文本)
       ──► /api/metrics/range    ──► PROM_URL/api/v1/query_range (JSON)
       ──► getMinecraftInfo()    ──► 读取 MC_INFO_FILE (JSON)
                                 └─► 调用 MC_EXPORTER_URL 取在线列表
```

所有后端接口均为无状态代理，mc-monitor 自身不持久化任何数据。

## 快速开始

### 1. 准备静态信息 JSON

创建一份文件（例如 `mc-info.json`），结构参考 [`mc-info.example.json`](./mc-info.example.json)：

```json
{
  "version": "1.20.1",
  "forge":   { "version": "47.2.0", "downloadUrl": "https://..." },
  "mod":     { "version": "1.0.0", "updateTime": "2026-01-01",
               "downloadUrl": "https://...", "downloadTip": "..." }
}
```

### 2. 使用 Docker 运行

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

`docker-compose` 示例：

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

### 3. 本地开发

```bash
pnpm install
cp .env.example .env.local      # 然后按需修改
pnpm dev                        # http://localhost:3000
```

## 环境变量

| 名称 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `MC_INFO_FILE` | 是 | `/config/mc-info.json` | 描述版本 / Forge / Mod 整合包的 JSON 文件路径。文件 mtime 改变时自动重新加载，无需重启容器。 |
| `MC_EXPORTER_URL` | 是 | — | `heathcliff26/minecraft-exporter` 的 `/metrics` 端点完整 URL。 |
| `MOD_METRICS_URL` | 是 | — | Mod 自身暴露的 `/metrics` 端点完整 URL。 |
| `PROM_URL` | 否 | — | Prometheus 实例的 base URL。未设置时历史面板显示「未配置」。 |

## 技术栈

- Next.js 14（`output: 'standalone'`）
- NextUI v2 + Tailwind CSS（响应式 + `class` 策略的暗黑模式）
- 仓库内置轻量 i18n（zh / en / ja，零运行时依赖）
- 自实现的 Prometheus 文本格式解析器 + 原生 SVG 图表（不引入 `recharts`）
- 严格的 ESLint 风格：单引号、无分号、必须 `const fn = () => {}`，详见 [`.eslintrc.cjs`](./.eslintrc.cjs)

## 项目结构

```
app/
  api/metrics/{exporter,mod,range}/route.ts   # 后端代理
  i18n/                                       # 文案表 + Provider
  lib/                                        # prom-parser + hooks
  action.tsx                                  # 服务端数据聚合
  main-client-page.tsx                        # 仪表盘组合
components/
  charts/                                     # bar-list, line-chart
  dashboard/                                  # status / info / metrics / storage / history
  navbar.tsx, theme-switch.tsx, language-switch.tsx
```
