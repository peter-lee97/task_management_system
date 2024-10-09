FROM node:20-alpine

WORKDIR /usr/app

COPY . /usr/app/

COPY .env /usr/app/.env

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]