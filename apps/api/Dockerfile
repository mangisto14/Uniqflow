# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json turbo.json tsconfig.base.json ./

# Copy package manifests for all workspaces
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all deps (needed for workspace linking)
RUN npm ci --ignore-scripts

# ── Stage 2: builder ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/turbo.json ./turbo.json
COPY --from=deps /app/tsconfig.base.json ./tsconfig.base.json

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build shared first, then api
RUN cd packages/shared && npm run build
RUN cd apps/api && npm run build

# Verify build output exists
RUN find /app -name 'main.js' 2>/dev/null && ls -laR /app/apps/api/dist/

# ── Stage 3: runner ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm ci --omit=dev --ignore-scripts

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy Prisma schema and generate client in runner
COPY apps/api/prisma ./apps/api/prisma
RUN cd apps/api && npx prisma generate

WORKDIR /app/apps/api

EXPOSE 3001

# Start server
CMD ["node", "/app/apps/api/dist/main"]
