FROM node:20-alpine
WORKDIR /app

# Cai dep production (can package-lock.json)
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY sql ./sql

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/index.js"]
