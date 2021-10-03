FROM node:alpine

RUN apk add git

RUN mkdir -p /usr/tudebot
WORKDIR /usr/tudebot

RUN apk add --update --no-cache --virtual .gyp \
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

#RUN npm install --only=production
RUN npm ci

COPY . .
COPY config.docker.js config.js

RUN npm run build

CMD [ "npm", "start" ]
