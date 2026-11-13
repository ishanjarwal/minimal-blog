
# ==============================================================================
# Multi-stage Dockerfile
# Services: migrator, app
# ==============================================================================

# Stage 1: Dependencies installation
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


# ==============================================================================
# Stage 2: Prisma Database Migrator
# ==============================================================================

FROM node:20-alpine AS migrator

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install only Prisma CLI and dotenv-cli, using versions from package.json.
# Supports dependencies and devDependencies.

RUN npm i @prisma/adapter-pg@8.1.0-dev.10 @prisma/client@8.1.0-dev.10 prisma@8.1.0-dev.10 dotenv-cli@11.1.0

# # Make the installed CLI tools available
# ENV PATH="/opt/migrator/node_modules/.bin:$PATH"

# Copy only migration-related files
COPY prisma.config.ts ./
COPY prisma ./prisma

# Run migrations and exit
CMD ["sh", "-c", "npx dotenv -e \"$ENV_FILE\" -- npx prisma migrate deploy"]

# ==============================================================================
# Stage 3: Next.js Builder
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Dummy URL for build-time Prisma Client generation
ENV DATABASE_URL="postgresql://postgres:password@localhost:5432/minimal_blog?schema=public"

RUN npx prisma generate

RUN npm run build


# ==============================================================================
# Stage 4: Next.js Production Runner
# ==============================================================================

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy standalone build and static assets
COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs \
    /app/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs \
    /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
