# base image
FROM node:12.2.0-alpine as node-server

# set working directory
WORKDIR /app

# install and cache app dependencies
COPY . .
RUN npm install -g typescript
RUN npm install -g ts-node
RUN yarn

EXPOSE 3000

# start app
CMD ["yarn", "start"]