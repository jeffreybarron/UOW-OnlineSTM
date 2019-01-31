// routes/ostm/index.js
"use strict";


const express = require("express"); //express module
const ostm = express.Router();
const bodyParser = require("body-parser");
const sanitizer = require("express-sanitizer");
const fs = require("fs");
const bunyan = require("bunyan");

const manage = require("./manage");
ostm.use("/manage", manage);


ostm.use("/static", express.static(__dirname + "/public/static"));
ostm.use("/data/studies", express.static(__dirname + "/public/data/studies"));
ostm.use("/data/decks", express.static(__dirname + "/public/data/decks"));
ostm.use(bodyParser.json()); // for parsing application/json

ostm.use(sanitizer());

const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
      level: "debug",
      path: appRoot + "/data/logs/ostm-log.json"
    },
    {
      level: "info",
      stream: process.stdout
    }
  ],
  src: true
});

ostm.get("/", function(request, response) {
  //Home Page
  response.render('ostm');
  log.info("GET / (HOME) rendered", request.ip);
});

ostm.get("/participant/:studyName", function(request, response, next) {
  log.info("GET /participant/:" + request.params.studyName + ", requested", request.ip);
  let sURL = appRoot + "/public/data/studies/" + request.params.studyName + ".json";
  //Using Promise with Async\Await
  let result = fileExistsAsync(sURL)
    .then(resolved => {
      log.info("GET /participant/:" + request.params.studyName + ", Successful", request.ip);
      response.render("participant", { studyName: request.params.studyName, qs: request.query });
      response.end;
    })
    .catch(error => {
      let txt = error.message;
      log.info("GET /participant/:" + request.params.studyName + ", failed", error.message);
      var fTemplate = fs.readFileSync("404.html", "utf8");
      response.send(fTemplate);
      response.end;
    });
});

ostm.get("/consent/:studyName", function(request, response, next) {
  log.info("GET /consent/:" + request.params.studyName + ", requested", request.ip);
  let sURL = appRoot + "/public/data/studies/" + request.params.studyName + ".json";
  //Using Promise with Async\Await
  let result = fileExistsAsync(sURL)
    .then(resolved => {
      log.info("GET /consent/:" + request.params.studyName + ", Successful", request.ip);
      response.render("consent", { studyName: request.params.studyName, qs: request.query });
      response.end;
    })
    .catch(error => {
      let txt = error.message;
      log.info("GET /consent/:" + request.params.studyName + ", failed", error.message);
      var fTemplate = fs.readFileSync("404.html", "utf8");
      response.send(fTemplate);
      response.end;
    });
});

ostm.get("/instructions/:studyName", function(request, response, next) {
  log.info("GET /instructions/:" + request.params.studyName + ", requested", request.ip);
  let sURL = appRoot + "/public/data/studies/" + request.params.studyName + ".json";
  //Using Promise with Async\Await
  let result = fileExistsAsync(sURL)
    .then(resolved => {
      log.info("GET /instructions/:" + request.params.studyName + ", Successful", request.ip);
      if (request.query.checkConsent === "on") {
        response.render("instructions", { studyName: request.params.studyName, qs: request.query });
      } else {
        //if consent tickbox is off then redirect back to consent
        response.render("consent", { studyName: request.params.studyName, qs: request.query });
      }
      response.end;
    })
    .catch(error => {
      let txt = error.message;
      log.info("GET /instructions/:" + request.params.studyName + ", failed", error.message);
      var fTemplate = fs.readFileSync("404.html", "utf8");
      response.send(fTemplate);
      response.end;
    });
});

ostm.get("/study/:studyName", function(request, response, next) {
  log.info("GET /study/:" + request.params.studyName + ", requested", request.ip);
  let sURL = appRoot + "/public/data/studies/" + request.params.studyName + ".json";
  //Using Promise with Async\Await
  let result = fileExistsAsync(sURL)
    .then(resolved => {
      if (!request.query.checkConsent === "on") {
        response.render("consent", { studyName: request.params.studyName, qs: request.query });
        response.end;
      }
      if (!request.query.checkInstructions === "on") {
        response.render("instructions", { studyName: request.params.studyName, qs: request.query });
        response.end;
      }

      //checks are ok render the test
      let oInstance = {
        studyName: request.params.studyName,
        PROLIFIC_PID: request.query.PROLIFIC_PID,
        STUDY_ID: request.query.STUDY_ID,
        SESSION_ID: request.query.SESSION_ID
      };
      response.render("study", { studyName: request.params.studyName, qs: request.query });
      log.info({ instance: oInstance }, ": study .rendered");
      response.end;
    })
    .catch(error => {
      let txt = error.message;
      log.info("GET /study/:" + request.params.studyName + ", failed", error.message);
      var fTemplate = fs.readFileSync("404.html", "utf8");
      response.send(fTemplate);
      response.end;
    });
});

ostm.post("/results", function(request, response, next) {
  log.info(
    "POST /ostm/results, requested for IP:" +
      request.ip +
      " using: " +
      request.headers["user-agent"]
  );
  try {
    let studyName = request.body.studyName;
    let participantID = request.body.PROLIFIC_PID;
    let studyID = request.body.STUDY_ID;
    let sessionID = request.body.SESSION_ID;
    let jsonFileName =
      appRoot + "/data/results/" +
      studyName + "_" +
      participantID + "_" +
      studyID + "_" +
      sessionID + ".json";
    let jsonResult = request.body;

    var result = postResult(jsonFileName, jsonResult)
      .then(resolved => {
        log.info("POST /ostm/results, Successful", resolved);
        log.info("POST /ostm/results, from IP:", request.ip);
        response.status(202).end();
      })
      .catch(err => {
        if (err.message == "This file already exists!") {
          log.info("POST /ostm/results, This file already exists!, from IP:", request.ip);
          response.status(409).end();
        } else {
          log.info("POST /ostm/results, failed", err.message);
          response.status(500).send(err);
        }
      });
  } catch (error) {
    response.render("error", { err: error.message });
    response.end;
  }
});

async function postResult(jsonFileName, jsonResult) {
  log.trace("POST /deck/create PostResult: " + jsonFileName, jsonResult);

  //AWAIT --> does file already exist, if so then stop
  // let fileNotExists = await fileNotExists(jsonFileName);

  //AWAIT --> create Deck
  let writeDeck = await writeJSON(jsonFileName, jsonResult);

  // return [fileNotExists, writeDeck];
  return [fileNotExists, writeDeck];
}

ostm.get("/sendCode/:studyName", function(request, response) {
  // 	//the purpose of the this route\page is to pass the prolific code to the participant if they have completed

  //declare file URL's
  var resultFileName =
    appRoot + "/data/results/" +
    request.params.studyName + "_" +
    request.query.PROLIFIC_PID + "_" +
    request.query.STUDY_ID + "_" +
    request.query.SESSION_ID + ".json";
  var codeFileName = appRoot + "/data/codes/" + request.params.studyName + "_code.json";

  try {
    var prolificCode = getProlificCode(resultFileName, codeFileName)
      .then(jsonGetCode => {
        // the study has been saved and the prolific code retrieved
        response.render("studycomplete", { qs: jsonGetCode });
        log.info(
          "GET /sendCode/:" + request.params.studyName + ", passe code to client: " + prolificCode
        );
        response.end;
      })
      .catch(error => {
        if (error.code === "ENOENT") {
          // code file is missing, did you delete it?
          log.info(
            "GET /sendCode/:" + request.params.studyName + "_code.json does not exist",
            request.ip
          );
          response.render("error", {
            err: request.params.studyName + "_code does not exist, contact Researcher."
          });
          response.end;
        } else {
          // there is a missing file
          log.info("POST /study/duplicate, failed", error.message);
          response.render("error", { err: error.message });
          response.end;
        }
      });
  } catch (err) {
    //unhandled exception.
    response.render("error", { err: error.message });
    response.end;
  }
});

//used with get('/sendCode/:studyName'
async function getProlificCode(sResultURL, sCodeURL) {
  // 		//check if the study has been saved first
  try {
    let resultExists = await fileExists(sResultURL);
    var prolificCodeFile = await readFile(sCodeURL);
    if (resultExists) {
      return JSON.parse(prolificCodeFile);
    } else {
      return "Result not Recieved, cannot issue Prolific Code!";
    }
  } catch {
    return "There was a problem with your code";
  }
}
//These functions are used by getProlificCode.
function fileExists(sURL) {
  return new Promise((resolve, reject) => {
    let fileExists = fs.existsSync(sURL);
    if (fileExists) {
      resolve(fileExists);
    } else {
      reject("File does not exist.");
    }
  });
}
function fileNotExists(sURL) {
  return new Promise((resolve, reject) => {
    let fileExists = fs.existsSync(sURL);
    if (fileExists) {
      reject(new Error("This file already exists!"));
      //return;
    } else {
      resolve(true);
      return;
    }
  });
}
function readFile(sURL) {
  return new Promise((resolve, reject) => {
    fs.readFile(sURL, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}
function writeFile(sURL, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(sURL, data, "utf-8", function(err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(data);
      }
    });
  });
}
function writeJSON(sURL, data) {
  return new Promise((resolve, reject) => {
    var sFile = JSON.stringify(data, null, 2);
    fs.writeFile(sURL, sFile, "utf-8", function(err) {
      if (err) {
        //Deal with error
        reject(err);
        return;
      } else {
        resolve(data);
      }
    });
  });
}
//This Function is used on its own for asyncronous file checks on various routes.. no its not great.
async function fileExistsAsync(sURL) {
  let fileExists = await fs.existsSync(sURL);
  if (fileExists) {
    return fileExists;
  } else {
    throw "File does not exist.";
  }
}

module.exports = ostm;
