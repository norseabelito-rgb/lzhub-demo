FROM node:20 AS builder
WORKDIR /app

# Copy everything first (node_modules and src/generated excluded via .dockerignore)
COPY . .

# Fresh install without lockfile ensures Linux native binaries
RUN npm install

# Generate Prisma client and verify
RUN npx prisma generate && \
    echo "=== Generated Prisma files ===" && \
    ls src/generated/prisma/

# Build Next.js
RUN npx next build

# Production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
