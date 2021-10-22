FROM node:16-slim

RUN apt-get update
RUN apt-get install git

RUN mkdir -p /usr/tudebot
WORKDIR /usr/tudebot

RUN apt-get install -y -q --no-install-recommends libfontconfig1
RUN apt-get install --update --no-cache --virtual .gyp \
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
