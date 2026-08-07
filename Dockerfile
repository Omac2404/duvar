# EasyPanel / Docker deploy — Next.js standalone cikti ile kucuk imaj
# Node 24 (npm 11): package-lock.json npm 11 ile uretildi, npm 10 onu
# "senkron degil" sayip `npm ci` ile hata veriyor
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build sirasinda DB'ye baglanilmaz; semayi ilk istek kurar
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
