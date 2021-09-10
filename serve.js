const fs = require('fs');
const express = require('express');
const request = require('request');
var path = require('path');
var Client = require('re-client');
var serve_utils = require('re-common-app');
const cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());

var indexpath = path.join(__dirname + '/static/index.html');
var apppath = path.join(__dirname + '/static/app.js');

function redirect (request, response, next) {
  if (request.url.endsWith('/app/modelapi')) {
      response.redirect('/app/modelapi/');
  } else {
    next();
  }
}

if (process.argv.length === 4 && process.argv[2] === 'dev') {
  if (process.argv.length !== 4) {
    throw new Error('you must provide credentials reference ie. "npm run dev hjertekoebing-test"');
  }
  console.log('Running in dev mode');
  var credentials = require('./credentials/' + process.argv[3] + '.json');
  
  app.use('/app/modelapi/static/', express.static('static', {maxAge: 1}));
  app.use('/app/modelapi/common/', express.static('node_modules/re-common-app', {maxAge: 1}));

  var host = credentials.host;
  var client = new Client({ host: host });
  app.get('/app/modelapi', redirect, serve_utils.test_token(client, credentials, indexpath));

  app.use('/', function(req, res) {
    var url = host + req.url;
    req.pipe(request(url)).pipe(res);
  });
} else {
  var staticConf = {maxAge: 360000 * 1000};
  
  app.get('/app/cluster/static/app.js', (request, response) => {
    let appFile = fs.readFileSync(apppath);
    appFile = appFile.toString().replace('$BUILD_NUM$', process.env['BUILD_NUM']);
    response.send(appFile);
  });

  app.use('/app/modelapi/static/', express.static('static', staticConf));
  app.use('/app/modelapi/common/', express.static('node_modules/re-common-app', staticConf));

  app.get('/app/modelapi', redirect, serve_utils.ensure_login(indexpath));
}
app.listen(8080);
