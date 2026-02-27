FROM node:20-slim AS base

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies - use npm install (not ci) so optional native
# binaries for Linux get resolved even if lockfile was created on macOS
RUN npm install --include=optional

# Verify lightningcss native binary exists
RUN ls -la node_modules/lightningcss/lightningcss.linux-x64-gnu.node 2>/dev/null || \
    ls -la node_modules/lightningcss-linux-x64-gnu/ 2>/dev/null || \
    echo "WARNING: lightningcss linux binary not found!"

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
