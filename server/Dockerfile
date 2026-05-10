FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY server/prisma ./server/prisma

RUN npm ci --workspace server --include-workspace-root

COPY server ./server

WORKDIR /app/server

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate:deploy && npm start"]
