FROM node:22.16.0-alpine

RUN mkdir -p /usr/src/node_boilerplate && chown -R node:node /usr/src/node_boilerplate

WORKDIR /usr/src/node_boilerplate

# Copy package json and yarn lock only to optimise the image building
COPY package.json yarn.lock ./

USER node

ENV HUSKY=0
ENV NODE_ENV=production

RUN yarn install --frozen-lockfile --production

COPY --chown=node:node . .

EXPOSE 8080

CMD ["node", "src/index.js"]