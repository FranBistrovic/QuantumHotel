FROM node:20

WORKDIR /app

COPY package*.json ./
#RUN npm install
RUN npm install baseline-browser-mapping@latest -D
COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
