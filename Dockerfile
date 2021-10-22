FROM node:16-slim

RUN apk add git

RUN mkdir -p /usr/tudebot
WORKDIR /usr/tudebot

RUN apk add --update --no-cache --virtual .gyp \
    libfontconfig \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

COPY package*.json ./

RUN npm install --production

COPY . .
COPY config.docker.js config.js

RUN npm run build

CMD [ "npm", "start" ]
