FROM node:14-slim

WORKDIR /usr/local/nodeapps

COPY ["./package*", "/usr/local/nodeapps/"]

RUN npm install
RUN npm install pm2 -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:rotateInterval '0 0 */1 * *'
RUN pm2 set pm2-logrotate:dateFormat 'YYYY-MM-DD'

COPY [".", "/usr/local/nodeapps/"]

EXPOSE 3349
EXPOSE 3000