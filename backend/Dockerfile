# ==============================================================================
# Multi-Stage Production Dockerfile for KK Group NestJS Backend
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build stage
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests
COPY package*.json ./

# Install all dependencies (clean install)
RUN npm ci

# Copy Prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and build config
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Compile TypeScript to production bundle
RUN npm run build

# Prune devDependencies and strip heavy local dev assets
RUN npm prune --omit=dev && rm -rf node_modules/@prisma/dev

# ------------------------------------------------------------------------------
# Stage 2: Production runtime stage
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies (OpenSSL for Prisma, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Use non-root node user for container security
USER node

# Copy package manifests
COPY --chown=node:node package*.json ./

# Copy production node_modules from builder
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

# Copy Prisma schema, config, and migrations
COPY --chown=node:node --from=builder /usr/src/app/prisma ./prisma
COPY --chown=node:node --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts

# Copy generated Prisma artifacts and compiled application bundle
COPY --chown=node:node --from=builder /usr/src/app/src/generated ./src/generated
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

EXPOSE 5000

# Health check to ensure the NestJS API is operational
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api || exit 1

CMD ["node", "dist/main"]
