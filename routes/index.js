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
  streams: [{
      level: "debug",
      path: __dirname + "/logs/routes.json"
    },
    {
      level: "info",
      stream: process.stdout
    }
  ],
  src: true
});

app.get("/", function (request, response) {
  //Home Page
  log.info({
    "function": "/.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "render.index",
    "studyName": "",
    "PROLIFIC_PID": "",
    "STUDY_ID": "",
    "SESSION_ID": "",
    "data": "(home page)",
    "error": ""
  });
  response.render("index");
});

app.get("*", function (request, response) {
  /*
    Catchall all other routes
    this route is placed last in the code, so it is read last.
    if it is placed before any other routes those routes wont be handled
    */
  //Log these as they may show nefarious behaviour and their attack vectors
  log.info({
    "function": "/.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "render.404",
    "studyName": "",
    "PROLIFIC_ID": "",
    "STUDY_ID": "",
    "SESSION_ID": "",
    "data": "",
    "error": "unhandled page request"
  });

  //keep this it is handy way to track malicious activity, outside the noise of the normal logs
  var sLog = `{"date":"${mDates.getDate()}", "source":" + ${request.ip}", "URL":"${request.originalUrl}"},\r\n`;
  fs.appendFile(__dirname + "/logs/unhandledPageRequests.json", sLog, function (err) {
    if (err) console.log(err);
  });

  response.render("404")
  // var readStudy = fs.readFileSync(__dirname + '/views' + "/404.html", "utf8");
  // response.send(readStudy);
  response.end;
});

module.exports = app;