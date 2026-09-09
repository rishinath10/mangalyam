# syntax=docker/dockerfile:1

# Multi-stage so the runtime image carries no toolchain and no source.
# Coolify builds this directly from the repo; nothing here is Coolify-specific.

FROM node:22-alpine AS deps
WORKDIR /app
# libc6-compat: Prisma's engines and sharp are glibc binaries on musl.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
# The schema must land before npm ci: the postinstall hook runs
# `prisma generate`, which reads it.
COPY prisma ./prisma
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next inlines NEXT_PUBLIC_* at build time, so anything the browser reads has
# to be present here — not only at runtime. Coolify passes build args from the
# same environment variables it later injects.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CONTACT_WHATSAPP
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_CONTACT_WHATSAPP=$NEXT_PUBLIC_CONTACT_WHATSAPP
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user. The image holds no secrets — every credential
# arrives as an environment variable at run time.
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
# The full node_modules, dev dependencies included. That is deliberate: the
# `prisma` CLI is a devDependency and the entrypoint runs `migrate deploy` on
# every boot, so pruning it would break startup. The cost is image size, not
# attack surface — nothing here is reachable from a request.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Migrations and the schema ship with the image so the container can migrate
# itself on boot rather than depending on someone remembering to run it.
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
