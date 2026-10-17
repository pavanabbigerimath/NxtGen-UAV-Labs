# ───────────────────────────── deps ─────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# ───────────────────────────── build ────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL is only needed at runtime; a throwaway value satisfies prisma generate.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate && npm run build

# ───────────────────────────── runtime ──────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl && addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "run", "start"]
