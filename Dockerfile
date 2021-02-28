FROM node:14

RUN mkdir /app

COPY package.json ./

COPY yarn.lock ./

RUN yarn

ENV NODE_ENV production

ENV PORT 80

COPY . .

RUN yarn build

EXPOSE 80

ENTRYPOINT [ "yarn", "start" ]
