FROM node:20-alpine as builder
WORKDIR /app/express-api

COPY package.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npm db:generate
RUN npm run build

FROM node:20-alpine as runner
WORKDIR /app/express-api

RUN apk add --no-cache openssl libstdc++ ca-certificates

COPY --from=base /app/express-api/node_modules ./node_modules
COPY --from=builder /app/express-api/dist ./dist
COPY --from=builder /app/express-api/prisma ./prisma

EXPOSE 6789
CMD [ "node", "dist/src/index.js" ]