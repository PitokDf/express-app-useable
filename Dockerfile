# -----------------------------
# Builder
# -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app/express-api

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npm run build


# -----------------------------
# Deps (Production deps + Prisma generate)
# -----------------------------
FROM node:20-alpine AS deps
WORKDIR /app/express-api

COPY package*.json ./
COPY prisma ./prisma

# install production dependencies
RUN npm ci --omit=dev

# generate prisma client (DI SINI TEMPAT YANG BENAR)
RUN npx prisma generate


# -----------------------------
# Runner
# -----------------------------
FROM node:20-alpine AS runner
WORKDIR /app/express-api

RUN apk add --no-cache openssl libstdc++ ca-certificates

# -----------------------------
# SAFE ENV DEFAULT DEFINITIONS
# -----------------------------

ENV NODE_ENV=production
ENV PORT=6789

# URL / Info Service
ENV CLIENT_URL=""
ENV BASE_URL=""
ENV SERVICE_NAME="express-service"
ENV COOKIES_DOMAIN=""
ENV JWT_ISSUER=""

# Credentials / Secrets (kosong → wajib diisi runtime)
ENV JWT_SECRET=""
ENV ACCESS_TOKEN_SECRET=""
ENV REFRESH_TOKEN_SECRET=""

# Database
ENV DATABASE_URL=""
ENV REDIS_HOST=""
ENV REDIS_PORT="6379"
ENV REDIS_PASSWORD=""

# Optional custom env
ENV SMTP_HOST=""
ENV SMTP_PORT=""
ENV SMTP_USER=""
ENV SMTP_PASS=""
ENV STORAGE_PATH="/app/storage"

# copy node_modules (sudah ada prisma client)
COPY --from=deps /app/express-api/node_modules ./node_modules

# copy dist & prisma folder
COPY --from=builder /app/express-api/dist ./dist
COPY --from=builder /app/express-api/prisma ./prisma

EXPOSE 6789

CMD ["node", "dist/src/index.js"]
