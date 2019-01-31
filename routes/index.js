// routes/index.js

// create new Router instance for api routes
const express = require("express"); //express module
const router = express.Router();
const favicon = require("serve-favicon");
const fs = require("fs");
const mDates = require(appRoot + "/utils/mDates.js");
const ostm = require("./ostm");
const bunyan = require("bunyan");

router.use("/ostm", ostm);
router.use('/static', express.static(__dirname  + '/public/static'));
router.use(favicon(__dirname + '/public/static/favicon.ico'));

const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
      level: "debug",
      path: appRoot + "/data/logs/routes-logs.json"
    },
    {
      level: "info",
      stream: process.stdout
    }
  ],
  src: true
});

router.get("/", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET / ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  //Home Page
  response.render("index");
});

router.get("*", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET * ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  /*
    Catchall all other routes
    this route is placed last in the code, so it is read last.
    if it is placed before any other routes those routes wont be handled
    */

  //Log these as they may show nefarious behaviour and their attack vectors
  var sLog = mDates.getDate() + ", source:" + request.ip + ", URL:" + request.originalUrl;

  log.info("Client IP:" + request.ip + " requested an unhandled page:" + request.originalUrl);
  fs.appendFile(appRoot + "/data/logs/UnhandledPageCalls.log", sLog + "\r\n", function(err) {
    if (err) console.log(err);
  });

  var readStudy = fs.readFileSync(appRoot + "/404.html", "utf8");
  response.send(readStudy);
  response.end;
});

module.exports = router;
