# Stage 1 - Build

FROM node:20-bookworm AS builder

WORKDIR /app

COPY package*.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci

COPY . .

RUN cd server && npx prisma generate

RUN npm run build


# Stage 2 - Runtime

FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app .

EXPOSE 8080

CMD ["sh", "-c", "cd server && npx prisma db push && node dist/index.js"]