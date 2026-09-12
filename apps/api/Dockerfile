# ==========================================
# Stage 1: Pruner (Isolate the API app)
# ==========================================
FROM node:24-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker

# ==========================================
# Stage 2: Builder (Install dependencies & build)
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

RUN npx turbo run build --filter=api...

# ==========================================
# Stage 3: Runner (Production Environment)
# ==========================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy workspace source and built artifacts
COPY --from=builder --chown=apiuser:nodejs /app ./

USER apiuser

EXPOSE 8000

CMD ["npm", "run", "start", "--workspace=api"]
