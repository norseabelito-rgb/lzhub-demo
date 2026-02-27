FROM node:20 AS base

FROM base AS builder
WORKDIR /app

# Copy only package.json (NO lockfile) to force fresh resolution on Linux
COPY package.json ./

# Fresh install resolves platform-specific native binaries for Linux
RUN npm install && \
    echo "=== Checking lightningcss ===" && \
    ls node_modules/lightningcss-linux-x64-gnu/ 2>/dev/null && echo "OK: linux binary package found" || echo "MISSING: linux binary package" && \
    ls node_modules/lightningcss/*.node 2>/dev/null && echo "OK: .node file found" || echo "MISSING: .node file"

# Copy prisma files and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source code and build
COPY . .
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
