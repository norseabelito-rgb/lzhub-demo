FROM node:20 AS builder
WORKDIR /app

# Copy everything (node_modules, .next, src/generated, package-lock.json excluded via .dockerignore)
COPY . .

# Fresh npm install without lockfile - resolves ALL platform-specific
# native binaries correctly for Linux (lightningcss, @tailwindcss/oxide)
# Also runs postinstall which generates Prisma client
RUN npm install

# Build Next.js
RUN npx next build

# Production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
