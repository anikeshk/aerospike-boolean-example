FROM node:12.22
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "index.js"]