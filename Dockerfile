FROM node:20 AS builder
WORKDIR /app

# Copy everything first (node_modules and src/generated excluded via .dockerignore)
COPY . .

# Install dependencies, then force-install the Linux native binary for lightningcss
RUN npm install --ignore-scripts && \
    npm install lightningcss-linux-x64-gnu@1.30.2 --no-save && \
    echo "=== Verify lightningcss binary ===" && \
    node -e "require('lightningcss')" && echo "lightningcss OK"

# Generate Prisma client
RUN npx prisma generate && \
    echo "=== Verify Prisma client ===" && \
    ls src/generated/prisma/index.js 2>/dev/null || ls src/generated/prisma/

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
