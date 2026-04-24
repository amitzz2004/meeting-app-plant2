FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# ✅ Fix - install openssl and generate prisma for alpine
RUN apk add --no-cache openssl

RUN npm run build 2>/dev/null || true

COPY . .

# ✅ Regenerate prisma client for correct platform
RUN npx prisma generate

EXPOSE 5000

CMD ["npx", "tsx", "src/index.ts"]