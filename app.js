// server/app.js
"use strict";
process.title 		  = 'Online STM';
const express       = require('express');
const app 		      = express();
const http 		      = require('http');
const bodyParser 	  = require('body-parser');
const sanitizer     = require('express-sanitizer');
const favicon 	    = require('serve-favicon');
const fs			      = require('fs');

const path          = require('path');
global.appRoot      = path.resolve(__dirname);
const routes        = require('./routes');
const mDates        = require('./utils/mDates.js');
const mUtils        = require('./utils/mUtils.js');

app.set('view engine', 'ejs');
app.set('views', [
  __dirname + '/views',
  __dirname + '/routes/lab',
  __dirname + '/routes/manage',
]);

app.use('/', routes);
app.use('/static', express.static('static'));
app.use('/data/studies', express.static('data/studies'));
app.use('/data/decks', express.static('data/decks'));

app.use(favicon(__dirname + '/static/favicon.ico'));
app.use(bodyParser.json()); // for parsing application/json
app.use(sanitizer());
app.use((request, response, next) => {
  //this is used as a sanitizer for sxx attacks
  //needs to be tested again.
  // for (let propName in request.body){
  //    request.body[propName] = request.sanitize(request.body[propName]);
  // }
  // next();
});

const server = app.listen(3000, () => {
  console.log('server is running at %s .', server.address().port);
});

app.get('/', function(request, response) {
  //Home Page
  response.render('index');
});
app.get('*', function(request, response) {
  /*
	Catchall all other routes
	this route is placed last in the code, so it is read last.
	if it is placed before any other routes those routes wont be handled
	*/
//	var readStudy = fs.readFileSync('404.html', 'utf8');
	//response.send(readStudy);

  //Log these as they may show nefarious behaviour and their attack vectors
	var sLog = mDates.getDate() + ", source:" + request.ip + ", URL:" + request.originalUrl
  console.log(sLog);
  // fs.appendFile('/data/logs/UnhandledPageCalls.log', sLog + "\r\n", function (err) {
	//   if (err) console.log(err);
	// });
  response.end;
});

module.exports = app;
