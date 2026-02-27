FROM node:20 AS builder
WORKDIR /app

# Cache bust: 2026-02-27-v2
# Copy everything (node_modules, .next, src/generated, package-lock.json excluded via .dockerignore)
COPY . .

# Fresh npm install without lockfile - resolves ALL platform-specific
# native binaries correctly for Linux (lightningcss, @tailwindcss/oxide)
RUN npm install

# Generate Prisma client (outputs to node_modules/.prisma/client)
RUN npx prisma generate

# Build Next.js
RUN npx next build

# Production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

CMD ["node", "server.js"]
