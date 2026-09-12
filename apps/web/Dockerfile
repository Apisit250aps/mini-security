# ==========================================
# Stage 1: Pruner (Isolate the Web app)
# ==========================================
FROM node:24-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

# ==========================================
# Stage 2: Builder (Install dependencies & build Next.js)
# ==========================================
FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy pruned package files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json* ./package-lock.json

RUN npm ci

# Copy pruned source code
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/security"

RUN NODE_OPTIONS="--max-old-space-size=2048" npx turbo run build --filter=web...

# ==========================================
# Stage 3: Runner (Production Environment)
# ==========================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next.js standalone outputs
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
