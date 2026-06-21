# Stage 1 - Build

FROM node:20-slim AS builder

WORKDIR /app

# Copy workspace manifests
COPY package*.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN cd server && npx prisma generate

# Build application
RUN npm run build

# Stage 2 - Production

FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app .

EXPOSE 8080

CMD ["npm", "run", "start"]