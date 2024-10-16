FROM node:20-alpine AS builder

WORKDIR /app

RUN mkdir -p my_packages

# Includes dev dependencies
COPY ../prep/my_packages /app/my_packages

RUN npm i --save-exact=true /app/my_packages/backend-*.tgz 
RUN npm i -D /app/my_packages/typescript-*.tgz
RUN npm i -D /app/my_packages/ts-node-*.tgz
RUN npm i -D /app/my_packages/types-bcryptjs-*.tgz
RUN npm i -D /app/my_packages/types-cookie-parser-*.tgz
RUN npm i -D /app/my_packages/types-cors-*.tgz
RUN npm i -D /app/my_packages/types-express-*.tgz
RUN npm i -D /app/my_packages/types-jsonwebtoken-*.tgz
RUN npm i -D /app/my_packages/types-mysql-*.tgz
RUN npm i -D /app/my_packages/types-node-*.tgz
RUN npm i -D /app/my_packages/types-nodemailer-*.tgz

RUN ls -a


COPY package.json /app/package.json
RUN diff package.json ./node_modules/backend/package.json || exit 1

RUN mv /app/node_modules/backend/node_modules/* /app/node_modules/

COPY src/ /app/src/
COPY tsconfig.json /app/tsconfig.json

RUN npx tsc --build --verbose

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/

COPY --from=builder /app/my_packages/backend-*.tgz /app/my_packages/backend-*.tgz

RUN npm i ./my_packages/backend-*.tgz --omit=dev --save-exact=true
RUN rm -rf my_packages

# Create a new user `appuser`
RUN adduser --disabled-password --no-create-home appuser

# Switch to the new user `appuser`
USER appuser

CMD ["node", "dist/index.js"]
