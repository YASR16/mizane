# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_ASSERT=1
ARG NEXT_PUBLIC_APP_URL=https://mizane.ma
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ARG AUTH_URL=https://mizane.ma
ENV AUTH_URL=$AUTH_URL
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8000
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS=--max-old-space-size=384

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts/start-koyeb.sh ./start-koyeb.sh

USER nextjs
EXPOSE 8000
CMD ["sh", "./start-koyeb.sh"]
