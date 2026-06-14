FROM node:22.16.0-alpine

RUN mkdir -p /usr/src/freeapi && chown -R node:node /usr/src/freeapi

WORKDIR /usr/src/freeapi

# Copy package json and yarn lock only to optimise the image building
COPY package.json yarn.lock ./

USER node

ENV HUSKY=0
ENV NODE_ENV=production

RUN yarn install --frozen-lockfile --production

COPY --chown=node:node . .

EXPOSE 8080

CMD ["node", "src/index.js"]