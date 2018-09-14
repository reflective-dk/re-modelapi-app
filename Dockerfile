FROM gcr.io/city-7337/base

ADD package.json package.json
ADD serve.js serve.js
ADD static static

#shut up npm
RUN npm config set loglevel warn
RUN npm i

EXPOSE 8080

CMD ["npm", "start"]