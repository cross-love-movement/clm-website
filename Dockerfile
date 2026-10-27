# syntax=docker/dockerfile:1

# ── Build ────────────────────────────────────────────────────────────────────
# Node 24 is required: `@nuxt/content` uses the built-in `node:sqlite` module,
# which is available without a flag from Node 22.13 / 24 onwards.
FROM node:24-alpine AS build
WORKDIR /app

ENV NUXT_TELEMETRY_DISABLED=1

# Sources first: the root `postinstall` script runs `nuxt prepare`, which needs
# nuxt.config.ts, app/, content/, and server/ to already be present.
COPY . .

RUN npm ci --no-audit --no-fund
RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOST=0.0.0.0

# Nitro's node-server output is self-contained: traced node_modules, the
# generated content database (`server/contents.sqlite`), and the client assets
# all live inside `.output`. Nothing else is copied.
COPY --from=build --chown=node:node /app/.output ./.output

# The app only reads from disk at runtime, so it can run unprivileged.
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
