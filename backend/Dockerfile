FROM node:20-alpine AS builder

WORKDIR /app

RUN mkdir -p my_packages

# Includes dev dependencies
COPY ../prep/my_packages /app/my_packages


COPY tsconfig.json /app/tsconfig.json

RUN npm i /app/my_packages/backend-*.tgz 

COPY package.json /app/package.json
RUN diff package.json ./node_modules/backend/package.json || exit 1

RUN npm dedupe

COPY src/ /app/
RUN npx tsc

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json /app/

RUN npm install --only=production

CMD ["node", "dist/index.js"]
