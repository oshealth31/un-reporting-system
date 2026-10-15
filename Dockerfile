FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY scripts ./scripts
COPY src ./src
COPY data ./data
COPY server ./server
RUN node scripts/build.js && mkdir -p /app/var && chown -R node:node /app/var
ENV HOST=0.0.0.0 PORT=3000 RL_DATA_DIR=/app/var
USER node
VOLUME /app/var
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "server/server.js"]
