FROM node:20-alpine AS base

# Enable pnpm via corepack (bundled with Node.js). Pin a specific version
# so the build is reproducible and avoids "latest" being incompatible with
# the bundled corepack.
RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies with pnpm, using a BuildKit cache mount for the
# pnpm content-addressable store so subsequent builds reuse downloaded tarballs
# even when the lockfile changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm config set store-dir /root/.local/share/pnpm/store && \
    pnpm install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
# Bring in node_modules first so source-only changes don't re-trigger install.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# -----------------------------------------------------------------------------
# Runtime configuration (override with `-e` / docker-compose / k8s env)
# -----------------------------------------------------------------------------
# REQUIRED — mount a JSON config that describes Minecraft / Forge / Mod info.
#   docker run -v ./mc-info.json:/config/mc-info.json:ro ...
ENV MC_INFO_FILE=/config/mc-info.json

# REQUIRED — `heathcliff26/minecraft-exporter` /metrics endpoint.
# ENV MC_EXPORTER_URL=http://minecraft-exporter:9150/metrics

# REQUIRED — Mod /metrics endpoint exposed by mc-server-enhanced-mod.
# ENV MOD_METRICS_URL=http://minecraft:25585/metrics

# OPTIONAL — Prometheus base URL (enables historical trends).
# ENV PROM_URL=http://prometheus:9090

# server.js is created by `next build` from the `output: 'standalone'` mode
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
