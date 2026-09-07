# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Smart Move — production image
#
# Multi-stage so the runtime image carries only the standalone server output,
# with no source, build tooling or development dependencies.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
# `packageManager` in package.json pins the exact pnpm version, so the image
# and a developer's machine resolve dependencies identically.
RUN corepack enable
WORKDIR /app


# --- Dependencies ----------------------------------------------------------
FROM base AS deps
# libc6-compat is needed by sharp's prebuilt binaries on Alpine.
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile


# --- Build -----------------------------------------------------------------
FROM base AS builder
# fontconfig and a font let sharp render the text on the seed script's
# placeholder images. Build stage only; the runtime image does not need them.
RUN apk add --no-cache libc6-compat fontconfig ttf-dejavu
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next inlines NEXT_PUBLIC_* variables at build time, so they have to be
# present here as well as at runtime.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ANALYTICS_PROVIDER
ARG NEXT_PUBLIC_ANALYTICS_ID
ARG NEXT_PUBLIC_PLAUSIBLE_HOST
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ANALYTICS_PROVIDER=$NEXT_PUBLIC_ANALYTICS_PROVIDER \
    NEXT_PUBLIC_ANALYTICS_ID=$NEXT_PUBLIC_ANALYTICS_ID \
    NEXT_PUBLIC_PLAUSIBLE_HOST=$NEXT_PUBLIC_PLAUSIBLE_HOST \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Placeholders only. The build must not touch the real database, and the
# runtime values come from the environment.
ENV DATABASE_URL=postgres://build:build@127.0.0.1:5432/build \
    PAYLOAD_SECRET=build-time-placeholder

# The Turbopack cache is hundreds of megabytes and is not needed at runtime.
RUN pnpm build && rm -rf .next/cache


# --- Runtime ---------------------------------------------------------------
FROM base AS runner
RUN apk add --no-cache libc6-compat curl

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    MEDIA_DIR=/app/media \
    SEED_ASSET_DIR=/app/seed-assets

# Never run the application as root.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Brand marks and demo photographs, read by the seed that runs on first boot
# from src/instrumentation.ts. Migrations need nothing here: `prodMigrations`
# applies them on the first database connection. Between the two, a production
# host needs no source checkout and no separate setup step.
COPY --chown=nextjs:nodejs src/scripts/demo-assets ./seed-assets

# Mount points. Declared before dropping privileges so the volumes are owned
# by the application user.
RUN mkdir -p /app/media /app/.next/cache && \
    chown -R nextjs:nodejs /app/media /app/.next/cache

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3000/healthz || exit 1

CMD ["node", "server.js"]
