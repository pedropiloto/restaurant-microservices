FROM node:10.15.0-alpine

WORKDIR /usr/app

COPY package.json .

RUN yarn install

RUN npm install -g nodemon

COPY . .
