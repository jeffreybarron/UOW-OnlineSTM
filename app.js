// server/app.js
"use strict";
process.title       = 'Online STM';
const express       = require('express');
const app           = express();
const bodyParser    = require('body-parser');
const favicon       = require('serve-favicon');
const path          = require('path');
global.appRoot      = path.resolve(__dirname);
const routes        = require('./routes');
const bunyan        = require('bunyan');

const log = bunyan.createLogger({
  name: "UOW-CogLab",
  streams: [
    {
      level: 'debug',
      path: appRoot + '/data/logs/app-logs.json'
    },
    {
      level: 'info',
      stream: process.stdout
    }
  ],
  src: true,
});

app.set('trust proxy',true); //https://expressjs.com/en/guide/behind-proxies.html
app.set('view engine', 'ejs');
app.set('views', [
  __dirname + '/views',
  __dirname + '/routes/ostm',
  __dirname + '/routes/manage',
]);

app.use('/', routes);
app.use('/static', express.static('public/static'));
app.use('/data/studies', express.static('public/data/studies'));
app.use('/data/decks', express.static('public/data/decks'));
app.use(favicon(appRoot + '/public/static/favicon.ico'));
app.use(bodyParser.json()); // for parsing application/json
// app.use(sanitizer());
// app.use((request, response, next) => {
//   //this is used as a sanitizer for sxx attacks
//   //needs to be tested again.
//   // for (let propName in request.body){
//   //    request.body[propName] = request.sanitize(request.body[propName]);
//   // }
//   // next();
// });

const server = app.listen(3000, () => {
  log.info("UOW-Coglab started listening on " + server.address().port);
  console.log('server is running at %s .', server.address().port);
});



module.exports = app;
