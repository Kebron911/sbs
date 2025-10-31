FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false && \
    npm config set registry http://registry.npmjs.org/ && \
    npm install
COPY . .
CMD ["node", "listener.js"]