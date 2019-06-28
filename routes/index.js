// routes/index.js

// create new Router instance for api routes
const express = require("express"); //express module
const favicon = require("serve-favicon");
const fs = require("fs");
const bunyan = require("bunyan");
const ostm = require("./ostm");
const app = express();

//console.log('routes/index.js - appRoot: ' + appRoot);
const mDates = require(appRoot + "/backend/js/mDates.js");

//OSTM subroute
app.use("/ostm", ostm);
// const ostm2 = require("./ostm2");
// app.use("/ostm2", ostm2);


app.use('/public', express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));


app.set("view engine", "ejs");
app.set("views", [__dirname + '/views']);


const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
      level: "debug",
      path: __dirname + "/logs/routes-log.json"
    },
    {
      level: "info",
      stream: process.stdout
    }
  ],
  src: true
});

app.get("/", function (request, response) {
  var errLocation = "IP:" + request.ip + ", GET / ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  //Home Page
  response.render("index");
});

app.get("*", function (request, response) {
  var errLocation = "IP:" + request.ip + ", GET * ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  /*
    Catchall all other routes
    this route is placed last in the code, so it is read last.
    if it is placed before any other routes those routes wont be handled
    */

  //Log these as they may show nefarious behaviour and their attack vectors
  log.info(errLocation + ", requested an unhandled page:" + request.originalUrl);

  //keep this it is handy way to track malicious activity, outside the noise of the normal logs
  var sLog = mDates.getDate() + ", source:" + request.ip + ", URL:" + request.originalUrl;
  fs.appendFile(__dirname + "/logs/unhandledPageCalls.log", sLog + "\r\n", function (err) {
    if (err) console.log(err);
  });

  response.render("404")
  // var readStudy = fs.readFileSync(__dirname + '/views' + "/404.html", "utf8");
  // response.send(readStudy);
  response.end;
});

module.exports = app;
