// routes/ostm/manage/index.js
"use strict";
const moduleName = "manage";

const express = require("express"); //express module
const manage = express.Router();
const bodyParser = require("body-parser");
const sanitizer = require("express-sanitizer");
const fs = require("fs");
const path = require("path");
const bunyan = require("bunyan");
const util = require("util");

const mUtils = require(appRoot + "/utils/mUtils.js");
const ostmPublic = appRoot + '/routes/ostm/public'

manage.use("/static", express.static(__dirname + '/public/static'));
manage.use("/data/studies", express.static(ostmPublic + '/data/studies'));
manage.use("/data/decks", express.static(ostmPublic + '/data/decks'));
manage.use(bodyParser.json()); // for parsing application/json
manage.use(bodyParser.urlencoded({ extended: false }));
manage.use(sanitizer());

const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
      level: "debug",
      path: appRoot + "/data/logs/ostm-" + moduleName + "-log.json"
    },
    {
      level: "info",
      stream: process.stdout
    }
  ],
  src: true
});

manage.get("/", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /ostm/manage/ ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  response.render('manage');
});
manage.get("/guide", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /ostm/manage/guide ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  response.render('guide');
});
manage.get("/deck/create", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /ostm/manage/deck/create ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  response.render('deckNew');
});
manage.get("/preflight", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /ostm/manage/preflight ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  response.render("preflight");
});

manage.get("/study/list", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /ostm/manage/study/list ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  const getFileList = util.promisify(fs.readdir);
  getFileList(ostmPublic + '/data/studies/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].includes(".json")) {
          let url = path.parse(fileList[i]);
          files.push({ studyName: url.name });
        }
      }
      response.render('studyList', { files: files });
      log.info("GET /study/list rendered", request.ip);
      response.end;
    })
    .catch(error => {
      //handle the error
      response.render("error", { err: error.message });
      response.end;
    });
});
manage.get("/study/new", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /ostm/manage/study/new ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  const getFileList = util.promisify(fs.readdir);
  getFileList(ostmPublic + '/data/decks/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        files.push({
          deckName: fileList[i],
          available: mUtils.getDeckLength(ostmPublic + '/data/decks/' + fileList[i])
        });
      }
      log.info("GET /study/new/, Rendered for IP:" + request.ip);
      response.render('studyNew', { files: files });
    })
    .catch(error => {
      //handle the error
      response.render('error', { err: error.message });
    });
});
manage.get("/study/duplicate", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /ostm/manage/study/duplicate ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  const getFileList = util.promisify(fs.readdir);
  getFileList(ostmPublic + '/data/studies/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].includes(".json")) {
          var thisFile = path.parse(fileList[i]);
          files.push({ studyName: thisFile.name });
        }
      }
      log.info("GET /study/duplicate, Rendered for IP:", request.ip);
      response.render('studyDuplicate', { files: files });
      response.end;
    })
    .catch(error => {
      //handle the error
      response.render('error', { err: error.message });
      response.end;
    });
});

manage.post("/deck/create/:deckName", function(request, response) {
  var errLocation = "IP:" + request.ip + ", POST /ostm/manage/deck/create ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  var result = createDeck(request.params.deckName, request.body)
    .then(resolved => {
      log.info("POST /deck/create, Successful", resolved);
      log.info("POST /deck/created, from IP:", request.ip);
      response.status(201).end();
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        log.info("POST /deck/created, This file already exists!, from IP:", request.ip);
        response.status(409).end();
      } else {
        log.info("POST /deck/create, failed", err.message);
        response.status(500).end();
      }
    });
});
async function createDeck(deckName, deck) {
  log.info("POST /deck/create createDeck: " + deckName, deck);
  //AWAIT --> does file already exist, if so then stop
  let deckNotExists = await fileNotExists(ostmPublic + '/data/decks/' + deckName + ".json");

  //AWAIT --> create Deck
  let writeDeck = await writeJSON(ostmPublic + '/data/decks/' + deckName + ".json", deck);

  return [deckNotExists, writeDeck];
}

manage.post("/study/create", function(request, response) {
  var errLocation = "IP:" + request.ip + ", POST /ostm/manage/study/create ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  //a rudimentary check, if there are exactly 7 query string objects
  let oStudyConfig = request.body;
  log.info(errLocation + ", log: 2", oStudyConfig);
  //sanitize Fields, one-by-one becuase they each need a little tweek
  log.info(errLocation + ", log: 4");
  oStudyConfig["studyName"] = request.sanitize(oStudyConfig["studyName"]);
  oStudyConfig["consentCopy"] = request.sanitize(oStudyConfig["consentCopy"]);
  oStudyConfig["instructionCopy"] = request.sanitize(oStudyConfig["instructionCopy"]);
  oStudyConfig["studybackgroundColor"] = request.sanitize(oStudyConfig["studybackgroundColor"]);
  oStudyConfig["refreshRateMS"] = parseInt(request.sanitize(oStudyConfig["refreshRateMS"]));
  oStudyConfig["shuffleDecks"] = mUtils.isTrue(request.sanitize(oStudyConfig["shuffleDecks"]));
  oStudyConfig["shuffleAll"] = mUtils.isTrue(request.sanitize(oStudyConfig["shuffleAll"]));
  oStudyConfig["completionCode"] = request.sanitize(oStudyConfig["completionCode"]);
  log.info(errLocation + ", log: 5");
  try {
    var result = createStudy(request.body.studyName, request.body.completionCode, oStudyConfig)
      .then(resolved => {
        log.info(errLocation + ", log: 6, Success", resolved);
        response.status(201).end();
      })
      .catch(err => {
        if (err.message == "This file already exists!") {
          log.info(errLocation + ", log: 7, This file already exists!");
          response.status(409).end();
        } else {
          log.info(errLocation + ", log: 8, Server Error (500)");
          response.status(500).send(err);
        }
      });
  } catch (error) {
    response.render("error", { err: error.message });
    response.end;
  }
});
async function createStudy(studyName, completionCode, oStudyConfig) {
  var errLocation = "creatStudy ";
  log.info(errLocation + ", log: 1, called");

  //declare variables
  let sURL = ostmPublic + '/data/studies/';
  let sPrivateURL = appRoot + "/data/codes/";

  //AWAIT --> does file already exist, if so then stop
  let studyNotExists = await fileNotExists(sURL + studyName + ".json");
  log.info(errLocation + ", log: 2");
  //AWAIT --> write codeFile

  let sCompletionFile = '{"completionURL":"https://app.prolific.ac/submissions/complete?cc=' +
    completionCode + '","completionCode":"' +
    completionCode + '"}';
  let jCompletionFile = JSON.parse(sCompletionFile);
  log.info(errLocation + ", log: 3");
  let codeFile = await writeJSON(sPrivateURL + studyName + "_code.json", jCompletionFile);
  delete oStudyConfig["completionCode"];

  //AWAIT --> write consentFile
  log.info(errLocation + ", log: 4");
  let consentFile = await writeFile(sURL + oStudyConfig.studyName + "_consent.html",
    oStudyConfig["consentCopy"]
  );
  delete oStudyConfig["consentCopy"];

  //AWAIT --> write instructionFile
  log.info(errLocation + ", log: 5");
  let instructionFile = await writeFile(sURL + oStudyConfig.studyName + "_instructions.html",
    oStudyConfig["instructionCopy"]
  );
  delete oStudyConfig["instructionCopy"];

  //AWAIT --> write configfile
  log.info(errLocation + ", log: 6");
  let configFile = await writeJSON(sURL + oStudyConfig.studyName + ".json", oStudyConfig);

  log.info(errLocation + ", log: 7");
  return [studyNotExists, codeFile, instructionFile, configFile];
}

manage.post("/study/duplicate", function(request, response) {
  var errLocation = "IP:" + request.ip + ", POST /ostm/manage/study/duplicate ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  // we are going to use await for this.
  let sSource = request.body.currentStudyName;
  let sNew = request.body.new_studyName;
  try {
    //Using Promise with Async\Await
    let result = duplicateStudy(sSource, sNew)
      .then(resolved => {
        log.info("POST /study/duplicate, Successful", resolved);
        log.info("POST /study/duplicate, from IP:", request.ip);
        response.status(201).end();
      })
      .catch(err => {
        if (err.message == "This file already exists!") {
          log.info("POST /deck/created, This file already exists!, from IP:", request.ip);
          response.status(409).end();
        } else {
          log.info("POST /deck/create, failed", err.message);
          response.status(500).end();
        }
      });
  } catch (error) {
    //handle the error
    response.render("error", { err: error.message });
    response.end;
  }
});
async function duplicateStudy(sSource, sNew) {
  try {
    //validate sNewURL
    if (sNew.length < 20 || sNew.length > 25 || !sNew) {
      throw "New studyName must be 24 characters, please use the documented Syntax";
    }

    //does the new file exist then throw an error
    let sURL = ostmPublic + '/data/studies/';
    let configResult = await copyConfig(sURL, sSource, sNew);
    let consentResult = await copyFile(
      sURL + sSource + "_consent.html",
      sURL + sNew + "_consent.html"
    );
    let instructionResult = await copyFile(
      sURL + sSource + "_instructions.html",
      sURL + sNew + "_instructions.html"
    );

    let sPrivateURL = appRoot + "/data/codes/";
    let prolificCode = await copyFile(
      sPrivateURL + sSource + "_code.json",
      sPrivateURL + sNew + "_code.json"
    );

    //I really dont know how to report back from here? this doesnt seem to work
    return [configResult, consentResult, instructionResult, prolificCode];
  } catch (err) {
    log.info(err);
    throw err;
  }
}



function copyFile(sourceURL, newURL) {
  return new Promise((resolve, reject) => {
    // exist already
    try {
      if (sourceURL === newURL) {
        reject(new Error("This file already exists!"));
      }
      if (!fs.existsSync(newURL)) {
        fs.copyFile(sourceURL, newURL, err => {
          if (err) throw err;
        });
        resolve({ created: newURL });
      } else {
        reject(new Error("This file already exists!"));
      }
    } catch (err) {
      reject(new Error("There was an unhandeled error at copyFile: " + err));
    }
  });
}
function copyConfig(URL, sourceStudy, newStudy) {
  return new Promise((resolve, reject) => {
    // copy config file
    try {
      //need something to copy see if the source file exists
      if (!fs.existsSync(URL + sourceStudy + ".json")) {
        let sMsg = "Source File does not Exist:" + err;
        reject(new Error(sMsg));
      }

      if (sourceStudy === newStudy) {
        reject(new Error("This file already exists!"));
      }

      //if new file does not exists then
      if (!fs.existsSync(URL + newStudy + ".json")) {
        // 2-read old file, update studyName
        let configFile = fs.readFileSync(URL + sourceStudy + ".json", "utf8");
        let oStudyConfig = JSON.parse(configFile);
        oStudyConfig.studyName = newStudy;
        let sNewFile = JSON.stringify(oStudyConfig, null, 2);

        // 3-write updated config to file on the new studyName
        let writeResult = fs.writeFileSync(URL + newStudy + ".json", sNewFile, function(err) {
          if (err) {
            throw "fs.writeFileSync failed: " + err;
          }
        });
        //SUCCESS!!
        resolve({ created: URL + newStudy + ".json" });
      } else {
        reject(new Error("This file already exists!"));
      }
    } catch (err) {
      reject(new Error("There was an unhandeled error at copyConfig: " + err));
    }
  });
}
function writeJSON(sURL, data) {
  return new Promise((resolve, reject) => {
    log.info(
      "File: manage.index.js" + ", Function: writeJSON" + ", Location: 1" + ", sURL: " + sURL,
      data
    );
    var sFile = JSON.stringify(data, null, 2);
    fs.writeFile(sURL, sFile, "utf-8", function(err) {
      if (err) {
        //Deal with error
        log.info("File: manage.index.js" + ", Function: writeJSON" + ", Location: 2", err);
        reject(err);
        return;
      } else {
        log.info("File: manage.index.js" + ", Function: writeJSON" + ", Location: 3", data);
        resolve(data);
      }
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
function fileExists(sURL) {
  return new Promise((resolve, reject) => {
    let fileExists = fs.existsSync(sURL);
    if (fileExists) {
      resolve(fileExists);
    } else {
      reject(true);
    }
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

module.exports = manage;