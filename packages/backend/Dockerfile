# Этап сборки (Builder)
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/backend/package*.json ./packages/backend/
COPY packages/frontend/package*.json ./packages/frontend/
RUN npm ci

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend

RUN npm run build:shared
RUN npm run build --workspace=@url-checker/backend

# Финальный образ (Production Runner)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/backend/package*.json ./packages/backend/
RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

EXPOSE 4000
CMD ["node", "packages/backend/dist/main.js"]