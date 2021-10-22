FROM node:16

RUN apt install git

RUN mkdir -p /usr/tudebot
WORKDIR /usr/tudebot

RUN apt install --update --no-cache --virtual .gyp \
    libc6-compat \
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
