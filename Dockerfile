FROM node:24-alpine

RUN mkdir -p /usr/src/node_boilerplate && chown -R node:node /usr/src/node_boilerplate

WORKDIR /usr/src/node_boilerplate

COPY package.json yarn.lock ./

USER node

ENV HUSKY=0
ENV NODE_ENV=production

RUN yarn install --frozen-lockfile --production

COPY --chown=node:node . .

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

CMD ["node", "src/index.js"]
