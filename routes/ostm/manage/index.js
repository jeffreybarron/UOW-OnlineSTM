// routes/ostm/manage/index.js
console.log('Load: routes/ostm/manage/index.js')
"use strict";
const moduleRoot = 'ostm/'
const moduleName = "manage";
const modulePath = moduleRoot + moduleName

const express = require("express"); //express module
const bodyParser = require("body-parser");
const sanitizer = require("express-sanitizer");
const app = express();
const fs = require("fs");
const path = require("path");
const bunyan = require("bunyan");
const util = require("util");

const mUtils = require(appRoot + "/backend/js/mUtils.js");
const studyResources = appRoot + '/' + moduleRoot + 'data/resources/'

app.use("/public", express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(sanitizer());
app.set("view engine", "ejs");
app.set("views", [__dirname + '/views']);

const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [{
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
app.get("/", function (request, response) {
  log.info({
    "function": "/ostm/manage/.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "render.index",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });
  response.render('index', {
    rPath: moduleRoot
  });
});



/* 
 *
 * /guide/ Routes 
 *
 */
app.get("/guide", function (request, response) {
  log.info({
    "function": "/ostm/manage/guide.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "render.guide",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });
  response.render('guide', {
    rPath: moduleRoot
  });
});



/* 
 *
 * /deck/ Routes 
 *
 */
app.get("/deck/create", function (request, response) {
  log.info({
    "function": "/ostm/manage/deck/create.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "render.deckNew",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });
  response.render('deckNew', {
    rPath: moduleRoot
  });
});
app.post("/deck/create/:deckName", function (request, response) {
  log.info({
    "function": "/ostm/manage/deck/create/:deckName.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });
  var result = createDeck(request.params.deckName, request.body)
    .then(resolved => {
      log.info({
        "function": "/ostm/manage/deck/create/:deckName.2",
        "ipAddress": request.ip,
        "request": request,
        "response": "201",
        "data": resolved,
        "error": {
          "err.object": "",
          "msg": ""
        }
      });
      response.status(201).end();
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        log.info({
          "function": "/ostm/manage/deck/create/:deckName.3",
          "ipAddress": request.ip,
          "request": request,
          "response": "409",
          "data": "",
          "error": {
            "err.object": err,
            "msg": "This file already exists!"
          }
        });
        response.status(409).end();
      } else {
        log.info({
          "function": "/ostm/manage/deck/create/:deckName.3",
          "ipAddress": request.ip,
          "request": request,
          "response": "500",
          "data": "",
          "error": {
            "err.object": err,
            "msg": "General Server Error"
          }
        });
        response.status(500).end();
      }
    });
});
async function createDeck(deckName, deck) {
  log.info({
    "function": "/ostm/manage/createDeck().1",
    // "ipAddress": request.ip,
    "request": "",
    "data": {
      "deckName": deckName,
      "deck": deck
    },
    "error": {
      "err.object": "",
      "msg": ""
    }
  });
  //AWAIT --> does file already exist, if so then stop
  let deckNotExists = await fileNotExists(studyResources + 'decks/' + deckName + ".json");

  //AWAIT --> create Deck
  let writeDeck = await writeJSON(studyResources + 'decks/' + deckName + ".json", deck);

  return [deckNotExists, writeDeck];
}



/* 
 *
 * /pages/ Routes 
 *
 */
app.get("/page/create", function (request, response) {
  log.info({
    "function": "/ostm/manage/page/create.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });

  const getFileList = util.promisify(fs.readdir);
  getFileList(studyResources + 'studies/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].includes(".json")) {
          var thisFile = path.parse(fileList[i]);
          files.push({
            studyName: thisFile.name
          });
        }
      }
      response.render('page', {
        rPath: moduleRoot,
        files: files
      });
      response.end;
    })
    .catch(error => {
      //handle the error
      response.render('error', {
        rPath: moduleRoot,
        err: error.message
      });
      response.end;
    });
});
app.post("/page/create", function (request, response) {
  log.info({
    "function": "/ostm/manage/page/create.POST.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });
  let pageJSON = request.body;
  // console.dir(pageJSON);
  let data = JSON.parse(pageJSON.pageContent);
  var result = pageCreate(pageJSON.studyName, pageJSON.pageName.toLowerCase(), data)
    .then(resolved => {
      response.status(201).end();
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        response.status(409).end();
      } else if (err.code = "EXXIT") {
        response.status(409).end();
      } else {
        response.status(500).end();
      }
    });
});
async function pageCreate(studyName, pageName, data) {
  log.info("POST createPage: " + studyName + "_" + pageName);

  let result = await writeFile(studyResources + "studies/" + studyName + "_" + pageName + '.html', data);

  return [result];
}



/* 
 *
 * /Study/ Routes 
 *
 */
app.get("/studies/:studyName", function (request, response) {
  log.info({
    "function": "/ostm/manage/studies/:studyName.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });
  const studyURL = appRoot + "/ostm/data/resources/studies/" + request.params.studyName + ".json";
  getFile(studyURL)
    .then(resolved => {
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      response.status(200).send(resolved);
    })
    .catch(err => {
      log.info("POST /API/view/ err: " + err + ", failed", request.ip);
      response.status(406).end();
    });
});

app.get("/study/list", function (request, response) {
  log.info({
    "function": "/ostm/manage/study/list.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });

  const getFileList = util.promisify(fs.readdir);
  getFileList(studyResources + 'studies/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].includes(".json")) {
          let url = path.parse(fileList[i]);
          files.push({
            studyName: url.name
          });
        }
      }
      response.render('studyList', {
        rPath: moduleRoot,
        files: files
      });
      log.info("GET /study/list rendered", request.ip);
      response.end;
    })
    .catch(error => {
      //handle the error
      response.render("error", {
        rPath: moduleRoot,
        err: error.message
      });
      response.end;
    });
});
app.get("/study/create", function (request, response) {
  log.info({
    "function": "/ostm/manage/study/create.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });
  const getFileList = util.promisify(fs.readdir);
  getFileList(studyResources + 'decks/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        files.push({
          deckName: fileList[i],
          available: mUtils.getDeckLength(studyResources + 'decks/' + fileList[i])
        });
      }
      response.render('studyCreate', {
        rPath: moduleRoot,
        files: files
      });
    })
    .catch(error => {
      //handle the error
      response.render('error', {
        rPath: moduleRoot,
        err: error.message
      });
    });
});
app.post("/study/create", function (request, response) {
  log.info({
    "function": "/ostm/manage/study/create.POST.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });

  //a rudimentary check, if there are exactly 7 query string objects
  let oStudyConfig = request.body;
  //sanitize Fields, one-by-one becuase they each need a little tweek
  oStudyConfig["studyName"] = request.sanitize(oStudyConfig["studyName"]);
  oStudyConfig["studybackgroundColor"] = request.sanitize(oStudyConfig["studybackgroundColor"]);
  oStudyConfig["studyTextColor"] = request.sanitize(oStudyConfig["studyTextColor"]);
  oStudyConfig["shuffleBlocks"] = mUtils.isTrue(request.sanitize(oStudyConfig["shuffleBlocks"]));
  oStudyConfig["consentCopy"] = request.sanitize(oStudyConfig["consentCopy"]);
  oStudyConfig["instructionCopy"] = request.sanitize(oStudyConfig["instructionCopy"]);
  oStudyConfig["completionCode"] = request.sanitize(oStudyConfig["completionCode"]);
  oStudyConfig["redirectTimer"] = request.sanitize(oStudyConfig["redirectTimer"]);
  oStudyConfig["completionURL"] = request.sanitize(oStudyConfig["completionURL"]);

  try {
    var result = createStudy(request.body.studyName, request.body.completionCode, oStudyConfig)
      .then(resolved => {
        response.status(201).end();
      })
      .catch(err => {
        if (err.message.includes("The sum of sets in block")) {
          response.status(403).send(err.message);
        } else if (err.message == "This file already exists!") {
          response.status(409).send(err.message);
        } else {
          response.status(500).send(err.message);
        }
      });
  } catch (error) {
    response.render("error", {
      err: error.message
    });
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

  //AWAIT --> does file already exist, if so then stop
  let studyNotExists = await fileNotExists(studyResources + "studies/" + studyName + ".json");
  //AWAIT --> write codeFile

  //AWAIT --> loadsets according to deckConfiguration Rules
  for (let i = 0; i < oStudyConfig.blocks.length; i++) {
    /*--------------------------------------------------------------
     * load the block stimulus file, create and fill the sets of each block
     */
    let block = oStudyConfig.blocks[i];
    let fileURL = studyResources + "decks/" + block.stimulusFile;
    let stimulusFile = await getFile(fileURL);
    stimulusFile = JSON.parse(stimulusFile);

    //check if stimulus file length is big enough for the sum of sets
    let fileLength = stimulusFile.length;
    let sumSets = block.setSizes.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    if (sumSets > fileLength) {
      await Promise.reject(new Error(`The sum of sets in block ${i} is larger than the file array, try again.`));
    };

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

  //AWAIT --> write configfile
  let configFile = await writeJSON(studyResources + "studies/" + oStudyConfig.studyName + ".json", oStudyConfig);

  //AWAIT --> creation of completion code file
  let sCompletionFile = await createCompletionFile(
    oStudyConfig.completionCode,
    oStudyConfig.redirectTimer,
    oStudyConfig.completionURL
  )

  //let jCompletionFile = JSON.parse(sCompletionFile);
  let codeFile = await writeJSON(studyResources + "codes/" + studyName + "_code.json", sCompletionFile);
  delete oStudyConfig["completionCode"];
  delete oStudyConfig["redirectTimer"];
  delete oStudyConfig["completionURL"];

  //AWAIT --> write consentFile
  let consentFile = await writeFile(studyResources + "studies/" + oStudyConfig.studyName + "_consent.html",
    oStudyConfig["consentCopy"]
  );
  delete oStudyConfig["consentCopy"];

  //AWAIT --> write instructionFile
  let instructionFile = await writeFile(studyResources + "studies/" + oStudyConfig.studyName + "_instructions.html",
    oStudyConfig["instructionCopy"]
  );
  delete oStudyConfig["instructionCopy"];

  return [studyNotExists, codeFile, instructionFile, configFile];

};

function createCompletionFile(code = mUtils.getGUID(), delay = "10000", url = "/ostm/launch") {

  let strFile = {};
  strFile.completionCode = code;
  strFile.completionURL = url;
  strFile.redirectTimer = delay;

  return strFile;

  //  let sCompletionFile = '{"completionURL":"https://app.prolific.ac/submissions/complete?cc=' +
  //     completionCode + '","completionCode":"' +
  //     completionCode + '"}';
}

app.get("/study/duplicate", function (request, response) {
  log.info({
    "function": "/ostm/manage/study/duplicate.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });

  const getFileList = util.promisify(fs.readdir);
  getFileList(studyResources + 'studies/')
    .then(fileList => {
      //do somthing with file list
      let files = [];
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].includes(".json")) {
          var thisFile = path.parse(fileList[i]);
          files.push({
            studyName: thisFile.name
          });
        }
      }
      response.render('studyDuplicate', {
        rPath: moduleRoot,
        files: files
      });
      response.end;
    })
    .catch(error => {
      //handle the error
      response.render('error', {
        rPath: moduleRoot,
        err: error.message
      });
      response.end;
    });
});
app.post("/study/duplicate", function (request, response) {
  log.info({
    "function": "/ostm/manage/study/duplicate.POST.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "data": "",
    "error": {
      "err.object": "",
      "msg": ""
    }
  });
  // we are going to use await for this.
  let sSource = request.body.source_studyName;
  let sNew = request.body.new_studyName;
  try {

    //validate sNewURL
    if (sNew.length < 20 || sNew.length > 25 || !sNew) {
      return response.status(412).send("No studyName or studyName is malformed, try a new studyName. \n Please check the naming syntax label below");
    }
    //Using Promise with Async\Await
    let result = duplicateStudy(sSource, sNew)
      .then(resolved => {
        return response.status(201).send('The study was duplicated successfully');
      })
      .catch(err => {
        if (err.message == "This file already exists!") {
          return response.status(409).send('This file already exists!');
        } else {
          return response.status(500).send(err.message);
        }
      });
  } catch (error) {
    //handle the error
    response.render("error", {
      err: error.message
    });
    response.end;
  }
});
async function duplicateStudy(sSource, sNew) {
  //does the new file exist then throw an error
  let configResult = await copyConfig(
    studyResources + "/studies/", sSource, sNew);

  let consentResult = await copyFile(
    studyResources + "/studies/" + sSource + "_consent.html",
    studyResources + "/studies/" + sNew + "_consent.html"
  );
  let instructionResult = await copyFile(
    studyResources + "/studies/" + sSource + "_instructions.html",
    studyResources + "/studies/" + sNew + "_instructions.html"
  );
  let prolificCode = await copyFile(
    studyResources + "/codes/" + sSource + "_code.json",
    studyResources + "/codes/" + sNew + "_code.json"
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

      fs.readFile(URL, 'utf8', (err, data) => {
        if (err) {
          return reject(new Error("Error Reading File: " + URL + " Error:" + err));
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
          if (err === null) {
            resolve({
              created: newURL
            });
            return;
          } else {
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
        let writeResult = fs.writeFileSync(URL + newStudy + ".json", sNewFile, function (err) {
          if (err) {
            throw "fs.writeFileSync failed: " + err;
          }
        });
        //SUCCESS!!
        resolve({
          created: URL + newStudy + ".json"
        });
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
    var sFile = JSON.stringify(data, null, 2);
    fs.writeFile(sURL, sFile, "utf-8", function (err) {
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

function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    let options = {
      encoding: 'utf-8',
      flag: 'wx'
    }
    /* flag wx throws error if file exists 
    /* https://nodejs.org/api/fs.html#fs_file_system_flags
    * https://stackoverflow.com/questions/12899061/creating-a-file-only-if-it-doesnt-exist-in-node-js
    */
    fs.writeFile(path, data, options, function (err) {
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