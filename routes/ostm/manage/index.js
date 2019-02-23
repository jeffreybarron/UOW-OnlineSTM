// routes/ostm/manage/index.js
"use strict";
const moduleRoot = 'ostm'
const moduleName = "manage";
const sPath = moduleRoot + '/manage'

const express = require("express"); //express module
const app = express();
const bodyParser = require("body-parser");
const sanitizer = require("express-sanitizer");
const fs = require("fs");
const path = require("path");
const bunyan = require("bunyan");
const util = require("util");

const mUtils = require(appRoot + "/utils/mUtils.js");
const ostmPublic = appRoot + '/routes/' + moduleRoot + '/public'

app.use("/static", express.static(__dirname + '/public/static'));
app.use("/resources/studies", express.static(ostmPublic + '/resources/studies'));
app.use("/resources/decks", express.static(ostmPublic + '/resources/decks'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(sanitizer());
app.set("view engine", "ejs");
app.set("views", [
  __dirname
]);

const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
      level: "debug",
      path: __dirname + "/logs/" + moduleName + "-log.json"
    },
    {
      level: "info",
      stream: process.stdout
    }
  ],
  src: true
});



/* 
*
* / Home Page Routes 
*
*/
app.get("/", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /" + sPath;
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  response.render('index', { rPath: sPath});
});



/* 
*
* /guide/ Routes 
*
*/
app.get("/guide", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /" + sPath + "/guide ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  response.render('guide', { rPath: sPath});
});



/* 
*
* /deck/ Routes 
*
*/
app.get("/deck/create", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /" + sPath + "/deck/create ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  response.render('deckNew', { rPath: sPath});
});
app.post("/deck/create/:deckName", function(request, response) {
  var errLocation = "IP:" + request.ip + ", POST /" + sPath + "/deck/create ";
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
  let deckNotExists = await fileNotExists(ostmPublic + '/resources/decks/' + deckName + ".json");

  //AWAIT --> create Deck
  let writeDeck = await writeJSON(ostmPublic + '/resources/decks/' + deckName + ".json", deck);

  return [deckNotExists, writeDeck];
}



/* 
*
* /preflight/ Routes 
*
*/
// app.get("/preflight", function(request, response) {
//   var errLocation = "IP:" + request.ip + ", GET /" + sPath + "/preflight ";
//   log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
//   response.render("preflight", { rPath: sPath});
// });



/* 
*
* /pages/ Routes 
*
*/
app.get("/page/create", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /" + sPath + "/pageafterblock/create ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  const getFileList = util.promisify(fs.readdir);
  getFileList(ostmPublic + '/resources/studies/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].includes(".json")) {
          var thisFile = path.parse(fileList[i]);
          files.push({ studyName: thisFile.name });
        }
      }
      log.info("GET /pageafterblock/create, Rendered for IP:", request.ip);
      response.render('page', { rPath: sPath, files: files });
      response.end;
    })
    .catch(error => {
      //handle the error
      response.render('error', { rPath: sPath, err: error.message });
      response.end;
    });
});
app.post("/page/create", function(request, response) {
  var errLocation = "IP:" + request.ip + ", POST /" + sPath + "/page/create ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  let pageJSON = request.body;
  // console.dir(pageJSON);
  let data = JSON.parse(pageJSON.pageContent);
  var result = pageCreate(pageJSON.studyName, pageJSON.pageName.toLowerCase(), data)
    .then(resolved => {
      log.info("POST page/create Successful", resolved);
      log.info("POST page/create, from IP:", request.ip);
      response.status(201).end();
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        log.info("POST page/create, This file already exists!, from IP:", request.ip);
        response.status(409).end();
      } else if (err.code = "EXXIT") {
        log.info("POST page/create, This file already exists!, from IP:", request.ip);
        response.status(409).end();
      } else {
        log.info("POST page/create, failed", err.message);
        response.status(500).end();
      }
    });
});
async function pageCreate(studyName, pageName, data) {
  log.info("POST createPage: " + studyName + "_" + pageName);

  let result = await writeFile(ostmPublic + "/resources/studies/" +  studyName + "_" + pageName + '.html',data);
  
  return [result];
}



/* 
*
* /Study/ Routes 
*
*/
app.get("/study/list", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /" + sPath + "/study/list ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  const getFileList = util.promisify(fs.readdir);
  getFileList(ostmPublic + '/resources/studies/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].includes(".json")) {
          let url = path.parse(fileList[i]);
          files.push({ studyName: url.name });
        }
      }
      response.render('studyList', { rPath: sPath, files: files });
      log.info("GET /study/list rendered", request.ip);
      response.end;
    })
    .catch(error => {
      //handle the error
      response.render("error", { rPath: sPath, err: error.message });
      response.end;
    });
});
app.get("/study/create", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /" + sPath + "/study/new ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  const getFileList = util.promisify(fs.readdir);
  getFileList(ostmPublic + '/resources/decks/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        files.push({
          deckName: fileList[i],
          available: mUtils.getDeckLength(ostmPublic + '/resources/decks/' + fileList[i])
        });
      }
      log.info("GET /study/new/, Rendered for IP:" + request.ip);
      response.render('studyCreate', { rPath: sPath, files: files });
    })
    .catch(error => {
      //handle the error
      response.render('error', { rPath: sPath, err: error.message });
    });
});
app.post("/study/create", function(request, response) {
    
  var errLocation = "IP:" + request.ip + ", POST /" + sPath + "/study/create ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  //a rudimentary check, if there are exactly 7 query string objects
  let oStudyConfig = request.body;
  log.info(errLocation + ", log: 2", oStudyConfig);
  //sanitize Fields, one-by-one becuase they each need a little tweek
  oStudyConfig["studyName"] = request.sanitize(oStudyConfig["studyName"]);
  oStudyConfig["studybackgroundColor"] = request.sanitize(oStudyConfig["studybackgroundColor"]);
  oStudyConfig["studyTextColor"] = request.sanitize(oStudyConfig["studyTextColor"]);
  oStudyConfig["shuffleBlocks"] = mUtils.isTrue(request.sanitize(oStudyConfig["shuffleBlocks"]));
  oStudyConfig["consentCopy"] = request.sanitize(oStudyConfig["consentCopy"]);
  oStudyConfig["instructionCopy"] = request.sanitize(oStudyConfig["instructionCopy"]);
  oStudyConfig["completionCode"] = request.sanitize(oStudyConfig["completionCode"]);
  log.info(errLocation + ", log: 5, Sanitized");
  
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
  /*======================================================================================================
  * For inside shuffle to work the cards need to picked into their sets at study creation it will not
  * work in done at runtime per participant. This means redesigning POST and how the data is saved.
  * i.e. The sampled cards are stored now (at design-time) not later (at run-time).
  */
  var errLocation = "creatStudy ";
  log.info(errLocation + ", log: 1, called");

  //declare variables
  let sURL = ostmPublic 
  let sPrivateURL = appRoot + "/routes/" + moduleRoot + "/data/codes/";

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
  let consentFile = await writeFile(ostmPublic + "/resources/studies/" + oStudyConfig.studyName + "_consent.html",
    oStudyConfig["consentCopy"]
  );
  delete oStudyConfig["consentCopy"];

  //AWAIT --> write instructionFile
  log.info(errLocation + ", log: 5");
  let instructionFile = await writeFile(ostmPublic + "/resources/studies/" +  oStudyConfig.studyName + "_instructions.html",
    oStudyConfig["instructionCopy"]
  );
  delete oStudyConfig["instructionCopy"];

  //AWAIT --> loadsets according to deckConfiguration Rules
  log.info(errLocation + ", log: 5");
  for (let i = 0; i < oStudyConfig.blocks.length; i++) {
    /*--------------------------------------------------------------
    * load the block stimulus file, create and fill the sets of each block
    */
    let block = oStudyConfig.blocks[i];
    let fileURL = ostmPublic + "/resources/decks/" + block.stimulusFile;
    let stimulusFile = await getFile(fileURL);
    stimulusFile = JSON.parse(stimulusFile);
    block["sets"] = [];
    for (let iSetNumber = 0; iSetNumber < block.setSizes.length; iSetNumber++) {
      block.sets.push(JSON.parse('{"set":"' + iSetNumber + '"}'))
      let setSize = block.setSizes[iSetNumber];
      block.sets[iSetNumber].stimuli = [];
      // block.sets.push(JSON.parse('{"set":[]}'));
      //dish out the number of cards required from the front of the deck
      for (let i = 0; i < setSize; i++) {
        /*--------------------------------------------------------------
        * push first element of dealersDeck onto the end of config file sets.set
        * console.log("iSetNumber:" + iSetNumber + ", setSize:" + setSize + ", i:" + i);
        */
        // block.sets[iSetNumber].set.push(stimulusFile[0]); //because zero is always the front
        block.sets[iSetNumber].stimuli.push(stimulusFile[0]); //because zero is always the front
        stimulusFile.shift(); //remove first element of dealersDeck
      };
    };
  };

  // //AWAIT --> write configfile
  log.info(errLocation + ", log: 6");
  let configFile = await writeJSON(ostmPublic + "/resources/studies/" + oStudyConfig.studyName + ".json", oStudyConfig);

  log.info(errLocation + ", log: 7");
  return [studyNotExists, codeFile, instructionFile, configFile];

};

app.get("/study/duplicate", function(request, response) {
  var errLocation = "IP:" + request.ip + ", GET /" + sPath + "/study/duplicate ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");

  const getFileList = util.promisify(fs.readdir);
  getFileList(ostmPublic + '/resources/studies/')
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
      response.render('studyDuplicate', { rPath: sPath, files: files });
      response.end;
    })
    .catch(error => {
      //handle the error
      response.render('error', { rPath: sPath, err: error.message });
      response.end;
    });
});
app.post("/study/duplicate", function(request, response) {
  var errLocation = "IP:" + request.ip + ", POST /" + sPath + "/study/duplicate ";
  log.info(errLocation + ", user-agent:" + request.headers["user-agent"] + ", log: 1");
  // we are going to use await for this.
  let sSource = request.body.currentStudyName;
  let sNew = request.body.new_studyName;
  try {

    //validate sNewURL
    if (sNew.length < 20 || sNew.length > 25 || !sNew) {
      log.info("POST /study/duplicate, No Study Name or Malformed studyName was provided, try a new studyName:", request.ip);
        return response.status(412).send("No studyName or studyName is malformed, try a new studyName");
    }
    //Using Promise with Async\Await
    let result = duplicateStudy(sSource, sNew)
      .then(resolved => {
        log.info("POST /study/duplicate, Successful", resolved);
        log.info("POST /study/duplicate, from IP:", request.ip);
        return response.status(201).send('The study was duplicated successfully');
      })
      .catch(err => {
        if (err.message == "This file already exists!") {
          log.info("POST /deck/created, This file already exists!, from IP:", request.ip);
          return response.status(409).send('This file already exists!');
        } else {
          log.info("POST /deck/create, failed", err.message);
          return response.status(500).send(err.message);
        }
      });
  } catch (error) {
    //handle the error
    response.render("error", { err: error.message });
    response.end;
  }
});
async function duplicateStudy(sSource, sNew) {
    //does the new file exist then throw an error
    let sURL = ostmPublic + '/resources/studies/';
    let configResult = await copyConfig(sURL, sSource, sNew);
    
    let consentResult = await copyFile(
      sURL + sSource + "_consent.html",
      sURL + sNew + "_consent.html"
    );
    let instructionResult = await copyFile(
      sURL + sSource + "_instructions.html",
      sURL + sNew + "_instructions.html"
    );

    let sPrivateURL = appRoot + "/routes/ostm/data/codes/";
    let prolificCode = await copyFile(
      sPrivateURL + sSource + "_code.json",
      sPrivateURL + sNew + "_code.json"
    );

    return [configResult, consentResult, instructionResult, prolificCode];
}




/* 
*
* Utility Functions
*
*/
function getFile(URL) {
  return new Promise((resolve, reject) => {
    // copy config file
    try {

      fs.readFile(URL,'utf8', (err, data) => {
        if (err) {
          return reject(new Error("Error Reading File: " + url + " Error:" + err));
        }
        return resolve(data);
      });

    } catch (err) {
      return reject(new Error("There was an unhandeled error at copyConfig: " + err));
    }
  });
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
          if (err === null ) {
            resolve({ created: newURL });
            return;
          } else {
            log.info('Problem writing File:' + newURL);
            reject(new Error("Server Error, URL malformed on server, advise research supervisor"));
            return;
          }
        });
      } else {
        reject(new Error("This file already exists!"));
        return;
      }
    } catch (err) {
      reject(new Error("There was an unhandeled error at copyFile: " + err));
      return;
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
    log.info("File: manage.index.js" + ", Function: writeJSON" + ", Location: 1" + ", sURL: " + sURL, data);
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
function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    let options = 
    { 
      encoding: 'utf-8',
      flag: 'wx' 
    } 
    /* flag wx throws error if file exists 
    /* https://nodejs.org/api/fs.html#fs_file_system_flags
    * https://stackoverflow.com/questions/12899061/creating-a-file-only-if-it-doesnt-exist-in-node-js
    */
    fs.writeFile(path, data, options , function(err) {
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

module.exports = app;