FROM node:24-alpine AS builder

RUN npm i -g pnpm@11.21.0

WORKDIR /app

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fintech_core?schema=public
ENV DATABASE_URL=${DATABASE_URL}

COPY . .

RUN pnpm install --frozen-lockfile --fetch-timeout=600000 --fetch-retries=5 --network-concurrency=2

RUN pnpm exec prisma generate

RUN pnpm build

FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/render-start.mjs ./render-start.mjs

EXPOSE 3000

CMD ["node", "dist/server.js"]
