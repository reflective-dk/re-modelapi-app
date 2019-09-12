const express = require('express');
const request = require('request');
var Client = require('re-client');
var path = require('path');
var serve_utils = require('re-common-app');
const cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());
var indexpath = path.join(__dirname + '/static/index.html');
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
  app.get('/app/modelapi/', serve_utils.test_token(client, credentials, indexpath));

  app.use('/', function(req, res) {
    var url = host + req.url;
    req.pipe(request(url)).pipe(res);
  });
} else {
  var staticConf = {maxAge: 360000 * 1000};
  app.use('/app/modelapi/static/', express.static('static', staticConf));
  app.use('/app/modelapi/common/', express.static('node_modules/re-common-app', staticConf));

  app.get('/app/modelapi/', serve_utils.ensure_login(indexpath));
}
app.listen(8080);
