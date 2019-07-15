// working through log info's 

"use strict";
// routes/ostm/index.js
const moduleName = "/ostm";
const modulePath_Private = appRoot + moduleName;
const modulePath_Public = moduleName + "/public";
const modulePath_Data = modulePath_Private + "/data";

console.log('Load: ' + modulePath_Private + '/index.js');

const express = require("express"); //express module
const app = express();
const bodyParser = require("body-parser");
const sanitizer = require("express-sanitizer");
const fs = require("fs");
const bunyan = require("bunyan");
const manage = require("./manage");

const COMPLETION_VIEW = 4;

//set subroute
app.use("/manage", manage);
app.use("/public", express.static(__dirname + "/public"));
app.use("/resources/studies", express.static(__dirname + "/data/resources/studies"));
// app.use("/resources/decks", express.static(__dirname + "/data/resources/decks"));
app.use(bodyParser.json()); // for parsing application/JSON
app.use(sanitizer());

app.set("view engine", "ejs");
app.set("views", [__dirname + '/views']);

/*======================================================================================
 *
 * Server Side Logging Middleware
 *
 */
const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [{
      level: "debug",
      path: __dirname + "/logs/ostm-log.json"
    },
    {
      level: "info",
      stream: process.stdout
    }
  ],
  src: true
});

/*======================================================================================
 *
 * EJS Page Routes
 * Usage: response.render('pageName')
 *
 */

app.get("/", function (request, response) {
  log.info({
    "function": "(home page)/.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "render.index",
    "studyName": "",
    "PROLIFIC_PID": "",
    "STUDY_ID": "",
    "SESSION_ID": "",
    "data": "",
    "error": ""
  });
  response.render("index", {
    rPath: moduleName
  });
});
app.get("/launch", function (request, response) {
  let sPath = "ostm";
  log.info({
    "function": "/ostm/launch.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "render.launch",
    "studyName": "",
    "PROLIFIC_PID": "",
    "STUDY_ID": "",
    "SESSION_ID": "",
    "data": "",
    "error": ""
  });
  response.render("launch", {
    rPath: sPath
  });
});
app.get("/simplelaunch", function (request, response) {
  log.info({
    "function": "/ostm/simplelaunch.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "render.simplelaunch",
    "studyName": "",
    "PROLIFIC_PID": "",
    "STUDY_ID": "",
    "SESSION_ID": "",
    "data": "",
    "error": ""
  });
  let sPath = "ostm";
  response.render("simplelaunch", {
    rPath: sPath
  });
});



app.get("/study", function (request, response) {
  log.info({
    "function": "/ostm/study.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "render.base",
    "studyName": request.query.studyName,
    "PROLIFIC_PID": request.query.PROLIFIC_PID,
    "STUDY_ID": request.query.STUDY_ID,
    "SESSION_ID": request.query.SESSION_ID,
    "data": "",
    "error": ""
  });

  // TESTING IF THIS CODE IS DEPRECATED
  // let JSONstateData = request.query; // initialise stateData with URL Query string key/vals
  /* As HTTP:GET on /base is the begining of the study
   * we take the query string with Prolific data and add default state value of 0
   * i.e. this part of the site, the study, is a single page site
   */
  response.render("base");
});

app.post("/results", function (request, response, next) {
  log.info({
    "function": "/ostm/results.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "studyName": request.params.studyName,
    "PROLIFIC_PID": request.params.PROLIFIC_PID,
    "STUDY_ID": request.params.STUDY_ID,
    "SESSION_ID": request.params.SESSION_ID,
    "data": "",
    "error": ""
  });

  try {
    // let studyName = request.body.studyName;
    // let participantID = request.body.PROLIFIC_PID;
    // let studyID = request.body.STUDY_ID;
    // let sessionID = request.body.SESSION_ID;
    let JSONResult = request.body;

    var result = saveState(JSONResult)
      .then(resolved => {
        log.info({
          "function": "/ostm/results.2",
          "ipAddress": request.ip,
          "request": request,
          "response": "202",
          "studyName": request.params.studyName,
          "PROLIFIC_PID": request.params.PROLIFIC_PID,
          "STUDY_ID": request.params.STUDY_ID,
          "SESSION_ID": request.params.SESSION_ID,
          "data": resolved,
          "error": ""
        });
        response.status(202).end();
      })
      .catch(err => {
        if (err.message == "This file already exists!") {
          log.info({
            "function": "/ostm/results.3",
            "ipAddress": request.ip,
            "request": request,
            "response": "409",
            "studyName": request.params.studyName,
            "PROLIFIC_PID": request.params.PROLIFIC_PID,
            "STUDY_ID": request.params.STUDY_ID,
            "SESSION_ID": request.params.SESSION_ID,
            "data": "",
            "error": {
              "err.object": err,
              "msg": "This file already exists!"
            }
          });
          response.status(409).end();
        } else {
          log.info({
            "function": "/ostm/results.4",
            "ipAddress": request.ip,
            "request": request,
            "response": "500",
            "studyName": request.params.studyName,
            "PROLIFIC_PID": request.params.PROLIFIC_PID,
            "STUDY_ID": request.params.STUDY_ID,
            "SESSION_ID": request.params.SESSION_ID,
            "data": "",
            "error": {
              "err.object": err,
              "msg": "failed general server error"
            }
          });
          response.status(500).send(err);
        }
      });
  } catch (error) {
    response.render("error", {
      err: error.message
    });
    response.end;
  }
});

/*======================================================================================
 *
 * API Routes Routes
 * Usage: response.render('pageName')
 *
 */
app.post("/API/flow", function (request, response) {
  log.info({
    "function": "/ostm/API/flow.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "studyName": request.body.studyName,
    "PROLIFIC_PID": request.body.PROLIFIC_PID,
    "STUDY_ID": request.body.STUDY_ID,
    "SESSION_ID": request.body.SESSION_ID,
    "getView": request.body.getView,
    "data": "",
    "error": ""
  });

  var result = loadFlow(request.body)
    .then(resolved => {
      log.info({
        "function": "/ostm/API/flow.2",
        "ipAddress": request.ip,
        "request": request,
        "response": "202",
        "studyName": request.body.studyName,
        "PROLIFIC_PID": request.body.PROLIFIC_PID,
        "STUDY_ID": request.body.STUDY_ID,
        "SESSION_ID": request.body.SESSION_ID,
        "getView": request.body.getView,
        "data": {
          "msg": "success",
          "saved": resolved
        },
        "error": ""
      });
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      response.status(202).send(resolved);
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        log.info({
          "function": "/ostm/API/flow.3",
          "ipAddress": request.ip,
          "request": request,
          "response": "409",
          "studyName": request.body.studyName,
          "PROLIFIC_PID": request.body.PROLIFIC_PID,
          "STUDY_ID": request.body.STUDY_ID,
          "SESSION_ID": request.body.SESSION_ID,
          "getView": request.body.getView,
          "data": "",
          "error": {
            "err.object": err,
            "msg": "This file already exists!"
          }
        });
        response.status(409).end();
      } else {
        log.info({
          "function": "/ostm/API/flow.4",
          "ipAddress": request.ip,
          "request": request,
          "response": "500",
          "studyName": request.body.studyName,
          "PROLIFIC_PID": request.body.PROLIFIC_PID,
          "STUDY_ID": request.body.STUDY_ID,
          "SESSION_ID": request.body.SESSION_ID,
          "getView": request.body.getView,
          "data": "",
          "error": {
            "err.object": err,
            "msg": "General Server Error"
          }
        });
        response.status(500).send(err);
      }
    });
});
async function loadFlow(state) {
  let jFlow = await readFile(modulePath_Private + "/views/configuration/stateflow.json");
  state.flow = JSON.parse(jFlow);
  state.flow.initialised = getDate();
  let result = saveState(state);
  return state;
}
app.post("/API/layout", function (request, response) {
  log.info({
    "function": "/ostm/API/layout.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "studyName": request.body.studyName,
    "PROLIFIC_PID": request.body.PROLIFIC_PID,
    "STUDY_ID": request.body.STUDY_ID,
    "SESSION_ID": request.body.SESSION_ID,
    "data": "",
    "error": ""
  });
  var pageData = loadLayout(request.body)
    .then(resolved => {
      log.info({
        "function": "/ostm/API/layout.2",
        "ipAddress": request.ip,
        "request": request,
        "response": "202",
        "studyName": request.body.studyName,
        "PROLIFIC_PID": request.body.PROLIFIC_PID,
        "STUDY_ID": request.body.STUDY_ID,
        "SESSION_ID": request.body.SESSION_ID,
        "data": {
          "msg": "success",
          "saved": resolved
        },
        "error": ""
      });
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      response.status(202).send(resolved);
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        log.info({
          "function": "/ostm/API/layout.3",
          "ipAddress": request.ip,
          "request": request,
          "response": "409",
          "studyName": request.body.studyName,
          "PROLIFIC_PID": request.body.PROLIFIC_PID,
          "STUDY_ID": request.body.STUDY_ID,
          "SESSION_ID": request.body.SESSION_ID,
          "data": "",
          "error": {
            "err.object": err,
            "msg": "This file already exists!"
          }
        });
        response.status(409).end();
      } else {
        log.info({
          "function": "/ostm/API/layout.4",
          "ipAddress": request.ip,
          "request": request,
          "response": "500",
          "studyName": request.body.studyName,
          "PROLIFIC_PID": request.body.PROLIFIC_PID,
          "STUDY_ID": request.body.STUDY_ID,
          "SESSION_ID": request.body.SESSION_ID,
          "data": "",
          "error": {
            "err.object": err,
            "msg": "General Server Error"
          }
        });
        response.status(500).send(err);
      }
    });
});
async function loadLayout(state) {
  /* so what we are doing is updating and checking data within the state JSON object
   * we store the data and send it along so we dont need to re-read files needlessly
   */

  //Fixed Variables
  let resourcePath = modulePath_Private + '/views/';

  //if there is no view we may as will stop now!!
  if (state.getView == isNaN) {
    throw "No page state was provided!";
  }

  //load the HMTL for this view state
  let sURL = resourcePath + "layouts/" + state.flow.views[state.getView].layout + ".html";
  state.flow.views[state.getView].layoutContent = await readFile(sURL);

  //update the render date/tim
  state.flow.views[state.getView].layoutLoaded = getDate();

  let result = saveState(state);

  return state;
}
app.post("/API/view", function (request, response) {
  log.info({
    "function": "/ostm/API/view.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "/API/flow",
    "studyName": request.body.studyName,
    "PROLIFIC_PID": request.body.PROLIFIC_PID,
    "STUDY_ID": request.body.STUDY_ID,
    "SESSION_ID": request.body.SESSION_ID,
    "data": "",
    "error": ""
  });
  var pageData = loadView(request.body)
    .then(resolved => {
      log.info({
        "function": "/ostm/API/view.2",
        "ipAddress": request.ip,
        "request": request,
        "response": "202",
        "studyName": request.body.studyName,
        "PROLIFIC_PID": request.body.PROLIFIC_PID,
        "STUDY_ID": request.body.STUDY_ID,
        "SESSION_ID": request.body.SESSION_ID,
        "data": {
          "msg": "success",
          "saved": resolved
        },
        "error": ""
      });
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      response.status(202).send(resolved);
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        log.info({
          "function": "/ostm/API/view.3",
          "ipAddress": request.ip,
          "request": request,
          "response": "409",
          "studyName": request.body.studyName,
          "PROLIFIC_PID": request.body.PROLIFIC_PID,
          "STUDY_ID": request.body.STUDY_ID,
          "SESSION_ID": request.body.SESSION_ID,
          "data": "",
          "error": {
            "err.object": err,
            "msg": "General Server Error"
          }
        });
        response.status(409).end();
      } else {
        log.info({
          "function": "/ostm/API/view.4",
          "ipAddress": request.ip,
          "request": request,
          "response": "500",
          "studyName": request.body.studyName,
          "PROLIFIC_PID": request.body.PROLIFIC_PID,
          "STUDY_ID": request.body.STUDY_ID,
          "SESSION_ID": request.body.SESSION_ID,
          "data": "",
          "error": {
            "err.object": err,
            "msg": "General Server Error"
          }
        });
        response.status(500).send(err);
      }
    });
});
async function loadView(state) {
  /* so what we are doing is updating and checking data within the state JSON object
   * we store the data and send it along so we cache these files on the proxy server
   */

  //if there is no view we may as will stop now!!
  if (state.getView == isNaN) {
    throw "No page state was provided!";
  }

  //If a PAGE Styles CSS is provided then prepend the module path, saving new value
  for (let i = 0; i < state.flow.views[state.getView].layoutStyles.length; i++) {
    state.flow.views[state.getView].layoutStyles[i] =
      modulePath_Public + "/css/" + state.flow.views[state.getView].layoutStyles[i];
  }
  // console.dir(state.flow.views[state.getView].layoutStyles);

  //If a contentCSS are provided then prepend the module path, saving new value
  for (let j = 0; j < state.flow.views[state.getView].viewStyles.length; j++) {
    state.flow.views[state.getView].viewStyles[j] =
      modulePath_Public + "/css/" + state.flow.views[state.getView].viewStyles[j];
  }
  // console.dir(state.flow.views[state.getView].viewStyles);

  //If SCRIPTS are provided then prepend the module path, saving new value
  for (let k = 0; k < state.flow.views[state.getView].scripts.length; k++) {
    state.flow.views[state.getView].scripts[k] =
      modulePath_Public + "/js/" + state.flow.views[state.getView].scripts[k];
  }
  // console.dir(state.flow.views[state.getView].scripts);

  //load the HMTL for this view state
  var sURL =
    modulePath_Private + "/views/pages/" + state.flow.views[state.getView].name + ".html";
  state.flow.views[state.getView].viewContent = await readFile(sURL);
  // console.log(sURL);

  //update the render date/tim
  state.flow.views[state.getView].viewLoaded = getDate();

  let result = saveState(state);

  return state;
}
app.post("/API/save", function (request, response) {
  log.info({
    "function": "/ostm/API/save.1",
    "ipAddress": request.ip,
    "request": "",
    "response": "",
    "studyName": request.body.studyName,
    "PROLIFIC_PID": request.body.PROLIFIC_PID,
    "STUDY_ID": request.body.STUDY_ID,
    "SESSION_ID": request.body.SESSION_ID,
    "data": request.body,
    "error": ""
  });

  var result = saveState(request.body)
    .then(resolved => {
      log.info({
        "function": "/ostm/API/save.2",
        "ipAddress": request.ip,
        "request": "",
        "response": "202",
        "studyName": request.body.studyName,
        "PROLIFIC_PID": request.body.PROLIFIC_PID,
        "STUDY_ID": request.body.STUDY_ID,
        "SESSION_ID": request.body.SESSION_ID,
        "getView": request.body.getView,
        "data": {
          "msg": "success",
          "saved": request.body
        },
        "error": ""
      });
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      response.status(202).send(resolved);
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        log.info({
          "function": "/ostm/API/save.3",
          "ipAddress": request.ip,
          "request": request,
          "response": "409",
          "studyName": request.body.studyName,
          "PROLIFIC_PID": request.body.PROLIFIC_PID,
          "STUDY_ID": request.body.STUDY_ID,
          "SESSION_ID": request.body.SESSION_ID,
          "data": "",
          "error": {
            "err.object": err,
            "msg": "This file already exists!"
          }
        });
        response.status(409).end();
      } else {
        log.info({
          "function": "/ostm/API/save.4",
          "ipAddress": request.ip,
          "request": request,
          "response": "500",
          "studyName": request.body.studyName,
          "PROLIFIC_PID": request.body.PROLIFIC_PID,
          "STUDY_ID": request.body.STUDY_ID,
          "SESSION_ID": request.body.SESSION_ID,
          "data": "",
          "error": {
            "err.object": err,
            "msg": "General Server Error"
          }
        });
        response.status(500).send(err);
      }
    });
});
async function saveState(state) {
  log.info({
    "function": "saveState(state).1",
    "ipAddress": "",
    "request": "",
    "response": "",
    "studyName": state.studyName,
    "PROLIFIC_PID": state.PROLIFIC_PID,
    "STUDY_ID": state.STUDY_ID,
    "SESSION_ID": state.SESSION_ID,
    "data": {
      "msg": "commenceSave",
      "state": state
    },
    "error": ""
  });
  // //AWAIT --> does file already exist, if so then stop
  // let fileNotExists = await fileNotExists(JSONFileName);

  //AWAIT --> create Deck
  let stateFile =
    modulePath_Private +
    "/data/results/" +
    state.studyName +
    "_" +
    state.PROLIFIC_PID +
    "_" +
    state.STUDY_ID +
    "_" +
    state.SESSION_ID;

  let saveToJSON = await writeJSON(stateFile + ".json", state);
  log.info({
    "function": "saveState(state).2",
    "ipAddress": "",
    "request": "",
    "response": "",
    "studyName": state.studyName,
    "PROLIFIC_PID": state.PROLIFIC_PID,
    "STUDY_ID": state.STUDY_ID,
    "SESSION_ID": state.SESSION_ID,
    "data": {
      "msg": "writeJSON() Complete"
    },
    "error": ""
  });
  try {
    if (typeof state.studyConfig.blocks !== "undefined") {
      if (state.flow.views[COMPLETION_VIEW].viewLoaded !== "undefined") {
        // let saveToCSV_wide = await writeCSV_wide (stateFile + "_wide.csv", state);
        // let saveToCSV_wide_grouped = await writeCSV_wide_grouped (stateFile + "_wide_grouped.csv", state);
        // let saveToCSV_forSQL = await writeCSV_forSQL(stateFile + "_forSQL.csv", state);
        let saveCSV_medium_grouped = await writeCSV_medium_grouped(
          stateFile + "_medium_grouped.csv",
          state
        );
        log.info({
          "function": "saveState(state).3",
          "ipAddress": "",
          "request": "",
          "response": "",
          "studyName": state.studyName,
          "PROLIFIC_PID": state.PROLIFIC_PID,
          "STUDY_ID": state.STUDY_ID,
          "SESSION_ID": state.SESSION_ID,
          "data": {
            "msg": "writeCSV_medium_grouped() complete"
          },
          "error": ""
        });
      }
    }
  } catch (err) {
    log.info({
      "function": "saveState(state).4",
      "ipAddress": "",
      "request": "",
      "response": "",
      "studyName": state.studyName,
      "PROLIFIC_PID": state.PROLIFIC_PID,
      "STUDY_ID": state.STUDY_ID,
      "SESSION_ID": state.SESSION_ID,
      "data": "",
      "error": {
        "err.object": err,
        "msg": "UN-HANDLED ERROR in saveState(state)"
      }
    });
  }

  // return [fileNotExists, writeDeck];
  log.info({
    "function": "saveState(state).5",
    "ipAddress": "",
    "request": "",
    "response": "saveToJSON",
    "studyName": state.studyName,
    "PROLIFIC_PID": state.PROLIFIC_PID,
    "STUDY_ID": state.STUDY_ID,
    "SESSION_ID": state.SESSION_ID,
    "getView": state.getView,
    "data": {
      "msg": "saveState() complete",
      "state": state
    },
    "error": ""
  });
  return [saveToJSON];
}

app.post("/API/issuecode", function (request, response) {
  log.info({
    "function": "/ostm/API/issuecode.1",
    "ipAddress": request.ip,
    "request": request,
    "response": "",
    "studyName": request.body.studyName,
    "PROLIFIC_PID": request.body.PROLIFIC_PID,
    "STUDY_ID": request.body.STUDY_ID,
    "SESSION_ID": request.body.SESSION_ID,
    "getView": request.body.getView,
    "data": request.body,
    "error": ""
  });

  // 	//the purpose of the this route\page is to pass the prolific code to the participant if they have completed
  let state = request.body;
  //declare file URL's
  var resultFileName =
    __dirname +
    "/data/results/" +
    state.studyName +
    "_" +
    state.PROLIFIC_PID +
    "_" +
    state.STUDY_ID +
    "_" +
    state.SESSION_ID +
    ".json";
  var codeFileName = __dirname + "/data/resources/codes/" + state.studyName + "_code.json";

  try {
    var prolificCode = getProlificCode(resultFileName, codeFileName)
      .then(resolved => {
        log.info({
          "function": "/ostm/API/issuecode.2",
          "ipAddress": request.ip,
          "request": request,
          "response": "202",
          "studyName": request.body.studyName,
          "PROLIFIC_PID": request.body.PROLIFIC_PID,
          "STUDY_ID": request.body.STUDY_ID,
          "SESSION_ID": request.body.SESSION_ID,
          "getView": request.body.getView,
          "data": {
            "msg": "success",
            "saved": request.body
          },
          "error": ""
        });
        //wrap the file in JSON and set some other data with it
        // let returnData = resolved;
        response.status(202).send(resolved);
      })
      .catch(err => {
        if (err.message == "This file already exists!") {
          log.info({
            "function": "/ostm/API/issuecode.3",
            "ipAddress": request.ip,
            "request": request,
            "response": "409",
            "studyName": request.body.studyName,
            "PROLIFIC_PID": request.body.PROLIFIC_PID,
            "STUDY_ID": request.body.STUDY_ID,
            "SESSION_ID": request.body.SESSION_ID,
            "getView": request.body.getView,
            "data": {
              "msg": "error",
              "saved": request.body
            },
            "error": {
              "err.object": err,
              "msg": "This file already exists!"
            }
          });
          response.status(409).end();
        } else {
          log.info({
            "function": "/ostm/API/issuecode.4",
            "ipAddress": request.ip,
            "request": request,
            "response": "500",
            "studyName": request.body.studyName,
            "PROLIFIC_PID": request.body.PROLIFIC_PID,
            "STUDY_ID": request.body.STUDY_ID,
            "SESSION_ID": request.body.SESSION_ID,
            "getView": request.body.getView,
            "data": request.body,
            "error": {
              "err.object": err,
              "msg": "General Server Error"
            }
          });
          response.status(500).send(err);
        }
      });
  } catch (err) {
    //unhandled exception.
    response.render("error", {
      rPath: moduleName,
      err: error.message
    });
    response.end;
  }
});

/* ====================================
 * Util Functions
 */
async function getProlificCode(sResultURL, sCodeURL) {
  // 		//check if the study has been saved first
  try {
    let resultExists = await fileExists(sResultURL);
    var prolificCodeFile = await readFile(sCodeURL);
    if (resultExists) {
      log.info({
        "function": "getProlificCode(sResultURL, sCodeURL).1",
        "ipAddress": "",
        "request": "",
        "response": "202",
        "studyName": "",
        "PROLIFIC_PID": "",
        "STUDY_ID": "",
        "SESSION_ID": "",
        "data": {
          "sResultURL": sResultURL,
          "sCodeURL": sCodeURL,
          "resultExists": resultExists,
          "prolificCodeFile": prolificCodeFile
        },
        "error": ""
      });
      return JSON.parse(prolificCodeFile);
    } else {
      log.info({
        "function": "getProlificCode(sResultURL, sCodeURL).2",
        "ipAddress": "",
        "request": "",
        "response": "202",
        "studyName": "",
        "PROLIFIC_PID": "",
        "STUDY_ID": "",
        "SESSION_ID": "",
        "data": {
          "sResultURL": sResultURL,
          "sCodeURL": sCodeURL,
          "resultExists": resultExists,
          "prolificCodeFile": prolificCodeFile
        },
        "error": "Result not Recieved, cannot issue Prolific Code!"
      });
      return "Result not Recieved, cannot issue Prolific Code!";
    }
  } catch (err) {
    log.info({
      "function": "getProlificCode(sResultURL, sCodeURL).3",
      "ipAddress": "",
      "request": "",
      "response": "202",
      "studyName": "",
      "PROLIFIC_PID": "",
      "STUDY_ID": "",
      "SESSION_ID": "",
      "data": {
        "sResultURL": sResultURL,
        "sCodeURL": sCodeURL,
        "resultExists": resultExists,
        "prolificCodeFile": prolificCodeFile
      },
      "error": {
        "err.object": err,
        "msg": "General Server Error"
      }
    });

    return "There was a problem with your code";
  }
}

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

function writeJSON(sURL, data) {
  return new Promise((resolve, reject) => {
    var sFile = JSON.stringify(data, null, 2);
    fs.writeFile(sURL, sFile, "utf-8", function (err) {
      if (err) {
        //Deal with error
        return reject(err);
      } else {
        return resolve(data);
      }
    });
  });
}

function writeCSV_wide(sURL, data) {
  return new Promise((resolve, reject) => {
    let header = ["studyName", "PROLIFIC_PID", "STUDY_ID", "SESSION_ID"];
    let rows = [];
    let col = [
      `${data.studyName}`,
      `${data.PROLIFIC_PID}`,
      `${data.STUDY_ID}`,
      `${data.SESSION_ID}`
    ];

    try {
      for (let i = 0; i < data.studyConfig.blocks.length; i++) {
        for (let j = 0; j < data.studyConfig.blocks[i].sets.length; j++) {
          for (let k = 0; k < data.studyConfig.blocks[i].sets[j].stimuli.length; k++) {
            //now we move horizontally
            header.push(
              `stimulus-${i}.${j}.${k}`,
              `response-${i}.${j}.${k}`,
              `equal-${i}.${j}.${k}`,
              `responseTime-${i}.${j}.${k}`
            );
            let diff = 0;
            if (k > 0) {
              diff =
                data.studyConfig.blocks[i].sets[j].stimuli[k].timeStamp -
                data.studyConfig.blocks[i].sets[j].stimuli[k - 1].timeStamp;
            }

            col.push(
              `${data.studyConfig.blocks[i].sets[j].stimuli[k].stimulus}`,
              `${data.studyConfig.blocks[i].sets[j].stimuli[k].response}`,
              `${data.studyConfig.blocks[i].sets[j].stimuli[k].stimulus.trim().toLowerCase() ===
              data.studyConfig.blocks[i].sets[j].stimuli[k].response.trim().toLowerCase()}`,
              `${data.studyConfig.blocks[i].sets[j].stimuli[k].responseTime}`
            );
            //end stimulus
          }
        }
      }
      rows.push(col);
    } catch (err) {
      return reject(err);
    }

    //save csv here

    /* to strip the [] after stringify use .substring(1,strung.length-1) 
    https://stackoverflow.com/questions/29737024/json-stringifyarray-surrounded-with-square-brackets
    */
    let participantResultFile = fs.createWriteStream(sURL, {
      flags: "w"
    });
    let sHeaderData = JSON.stringify(header);
    participantResultFile.on("open", function (fd) {
      participantResultFile.write(sHeaderData.substring(1, sHeaderData.length - 1) + "\r\n");
      for (let n = 0; n < rows.length; n++) {
        let sRowData = JSON.stringify(rows[n]);
        participantResultFile.write(sRowData.substring(1, sRowData.length - 1) + "\r\n");
      }
      participantResultFile.end();
      participantResultFile.close();
    });
    //aysnc callbacks
    participantResultFile.on("finish", () => {
      return resolve(true);
    }); // not sure why you want to pass a boolean
    participantResultFile.on("error", e => {
      return reject(e);
    }); // don't forget this!
  });
}

function writeCSV_wide_grouped(sURL, data) {
  return new Promise((resolve, reject) => {
    let header = ["studyName", "PROLIFIC_PID", "STUDY_ID", "SESSION_ID"];
    let rows = [];
    let col = [
      `${data.studyName}`,
      `${data.PROLIFIC_PID}`,
      `${data.STUDY_ID}`,
      `${data.SESSION_ID}`
    ];

    let head1 = [];
    let head2 = [];
    let head3 = [];
    let grp1 = [];
    let grp2 = [];
    let grp3 = [];

    try {
      for (let i = 0; i < data.studyConfig.blocks.length; i++) {
        for (let j = 0; j < data.studyConfig.blocks[i].sets.length; j++) {
          for (let k = 0; k < data.studyConfig.blocks[i].sets[j].stimuli.length; k++) {
            //now we move horizontally

            head1.push(`stimulus-${i}.${j}.${k}`);
            grp1.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].stimulus}`);

            head2.push(`response-${i}.${j}.${k}`);
            grp2.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].response}`);

            head3.push(`responseTime-${i}.${j}.${k}`);
            grp3.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].responseTime}`);

            //end stimulus
          }
        }
      }

      header = header.concat(head1, head2, head3);
      col = col.concat(grp1, grp2, grp3);
      rows.push(col);
    } catch (err) {
      return reject(err);
    }

    //save csv here

    /* to strip the [] after stringify use .substring(1,strung.length-1) 
    https://stackoverflow.com/questions/29737024/json-stringifyarray-surrounded-with-square-brackets
    */
    let participantResultFile = fs.createWriteStream(sURL, {
      flags: "w"
    });
    let sHeaderData = JSON.stringify(header);
    participantResultFile.on("open", function (fd) {
      participantResultFile.write(sHeaderData.substring(1, sHeaderData.length - 1) + "\r\n");
      for (let n = 0; n < rows.length; n++) {
        let sRowData = JSON.stringify(rows[n]);
        participantResultFile.write(sRowData.substring(1, sRowData.length - 1) + "\r\n");
      }
      participantResultFile.end();
      participantResultFile.close();
    });
    //aysnc callbacks
    participantResultFile.on("finish", () => {
      return resolve(true);
    }); // not sure why you want to pass a boolean
    participantResultFile.on("error", e => {
      return reject(e);
    }); // don't forget this!
  });
}

function writeCSV_medium_grouped(sURL, data) {
  return new Promise((resolve, reject) => {
    // let header = ["studyName","PROLIFIC_PID","STUDY_ID","SESSION_ID"];
    let header = ["studyName", "PROLIFIC_PID", "STUDY_ID", "SESSION_ID", "block", "set"];
    let rows = [];

    try {
      for (let i = 0; i < data.studyConfig.blocks.length; i++) {
        // console.log("new block");
        for (let j = 0; j < data.studyConfig.blocks[i].sets.length; j++) {
          // console.log("new Set");

          let col = [
            `${data.studyName}`,
            `${data.PROLIFIC_PID}`,
            `${data.STUDY_ID}`,
            `${data.SESSION_ID}`
          ];
          let head1 = [];
          let head2 = [];
          let head3 = [];
          let grp0 = [];
          let grp1 = [];
          let grp2 = [];
          let grp3 = [];

          grp0.push(`${i}`);
          grp0.push(`${j}`);

          for (let k = 0; k < data.studyConfig.blocks[i].sets[j].stimuli.length; k++) {
            //now we move horizontally

            head1.push(`stimulus-${k}`);
            grp1.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].stimulus}`);

            head2.push(`response-${k}`);
            grp2.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].response}`);

            head3.push(`responseTime-${k}`);
            grp3.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].responseTime}`);

            //end stimulus
          }

          if (header.length < 7) {
            header = header.concat(head1, head2, head3);
          } //ie we have never put the stimulus headers in before
          col = col.concat(grp0, grp1, grp2, grp3);
          rows.push(col);
          // console.dir(col);

          //end set
        }

        //end block
      }
    } catch (err) {
      return reject(err);
    }

    //save csv here

    /* to strip the [] after stringify use .substring(1,strung.length-1) 
    https://stackoverflow.com/questions/29737024/json-stringifyarray-surrounded-with-square-brackets
    */
    let participantResultFile = fs.createWriteStream(sURL, {
      flags: "w"
    });
    let sHeaderData = JSON.stringify(header);
    participantResultFile.on("open", function (fd) {
      participantResultFile.write(sHeaderData.substring(1, sHeaderData.length - 1) + "\r\n");
      for (let n = 0; n < rows.length; n++) {
        let sRowData = JSON.stringify(rows[n]);
        participantResultFile.write(sRowData.substring(1, sRowData.length - 1) + "\r\n");
      }
      participantResultFile.end();
      participantResultFile.close();
    });

    //aysnc callbacks
    //unknown if this event is even called
    participantResultFile.on("end", () => {
      // console.log("aysync write.end");
      return resolve(true);
    }); // not sure why you want to pass a boolean

    //event new in 9.x
    participantResultFile.on("ready", () => {
      // console.log("aysync write.ready");
      return resolve(true);
    }); // not sure why you want to pass a boolean

    //event from 8.16.0 deprecated
    participantResultFile.on("finish", () => {
      // console.log("aysync write.finish");
      return resolve(true);
    }); // not sure why you want to pass a boolean

    participantResultFile.on("error", e => {
      // console.log("aysync write.error:", e);
      return reject(e);
    }); // don't forget this!
  });
}

function writeCSV_forSQL(sURL, data) {
  return new Promise((resolve, reject) => {
    let header = [
      "studyName",
      "PROLIFIC_PID",
      "STUDY_ID",
      "SESSION_ID",
      "block",
      "refreshRateMS",
      "set",
      "stimulusNo",
      "stimulus",
      "response",
      "responseTime",
      "timeStamp",
      "backGroundColor",
      "textColor"
    ];
    let file = fs.createWriteStream(sURL);
    let rows = [];

    try {
      for (let i = 0; i < data.studyConfig.blocks.length; i++) {
        for (let j = 0; j < data.studyConfig.blocks[i].sets.length; j++) {
          for (let k = 0; k < data.studyConfig.blocks[i].sets[j].stimuli.length; k++) {
            let col = [
              `${data.studyName}`,
              `${data.PROLIFIC_PID}`,
              `${data.STUDY_ID}`,
              `${data.SESSION_ID}`
            ];
            col.push(`${data.studyConfig.blocks[i].block}`);
            col.push(`${data.studyConfig.blocks[i].refreshRateMS}`);
            col.push(`${data.studyConfig.blocks[i].sets[j].set}`);

            col.push(`${k}`);
            col.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].stimulus}`);
            col.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].response}`);
            col.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].responseTime}`);
            col.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].timeStamp}`);
            col.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].backGroundColor}`);
            col.push(`${data.studyConfig.blocks[i].sets[j].stimuli[k].textColor}`);
            rows.push(col);
            //end stimulus
          }
        }
      }
    } catch (err) {
      return reject(err);
    }

    //save csv here

    /* to strip the [] after stringify use .substring(1,strung.length-1) 
    https://stackoverflow.com/questions/29737024/json-stringifyarray-surrounded-with-square-brackets
    */
    let participantResultFile = fs.createWriteStream(sURL, {
      flags: "w"
    });
    let sHeaderData = JSON.stringify(header);
    participantResultFile.on("open", function (fd) {
      participantResultFile.write(sHeaderData.substring(1, sHeaderData.length - 1) + "\r\n");
      for (let n = 0; n < rows.length; n++) {
        let sRowData = JSON.stringify(rows[n]);
        participantResultFile.write(sRowData.substring(1, sRowData.length - 1) + "\r\n");
      }
      participantResultFile.end();
      participantResultFile.close();
    });
    //aysnc callbacks
    participantResultFile.on("finish", () => {
      return resolve(true);
    }); // not sure why you want to pass a boolean
    participantResultFile.on("error", e => {
      return reject(e);
    }); // don't forget this!

    /* =========================================
     *
     * //Now Write it to a study wide log
     *
     */
    let studyResultFile = fs.createWriteStream(
      modulePath_Private + "/data/results/" + data.studyName + ".csv", {
        flags: "a"
      }
    );
    studyResultFile.on("open", function (fd) {
      studyResultFile.write(sHeaderData.substring(1, sHeaderData.length - 1) + "\r\n");
      for (let n = 0; n < rows.length; n++) {
        let sRowData = JSON.stringify(rows[n]);
        studyResultFile.write(sRowData.substring(1, sRowData.length - 1) + "\r\n");
      }
      studyResultFile.end();
      studyResultFile.close();
    });
    //aysnc callbacks
    studyResultFile.on("finish", () => {
      return resolve(true);
    }); // not sure why you want to pass a boolean
    studyResultFile.on("error", e => {
      return reject(e);
    }); // don't forget this!
  });
}

/* ====================================
 * Date Functions
 */
function getDate(timeStamp = Date.now()) {
  var d = new Date(timeStamp);
  return d.yyyyMMddhhmmssfff();
}
Date.prototype.yyyyMMddhhmmssfff = function () {
  var yyyy = this.getFullYear().toString();
  var MM = pad(this.getMonth() + 1, 2);
  var dd = pad(this.getDate(), 2);
  var hh = pad(this.getHours(), 2);
  var mm = pad(this.getMinutes(), 2);
  var ss = pad(this.getSeconds(), 2);
  var fff = pad(this.getMilliseconds(), 4);
  return yyyy + "/" + MM + "/" + dd + " " + hh + ":" + mm + ":" + ss + "." + fff;
};

function pad(number, length) {
  var str = "" + number;
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}

module.exports = app;


//Deprecated Utils

// //This Function is used on its own for asyncronous file checks on various routes.. no its not great.
// async function fileExistsAsync(sURL) {
//   let fileExists = await fs.existsSync(sURL);
//   if (fileExists) {
//     return fileExists;
//   } else {
//     throw "File does not exist.";
//   }
// }
// function writeFile(sURL, data) {
//   return new Promise((resolve, reject) => {
//     fs.writeFile(sURL, data, "utf-8", function(err) {
//       if (err) {
//         reject(err);
//         return;
//       } else {
//         resolve(data);
//       }
//     });
//   });
// }
// function fileNotExists(sURL) {
//   return new Promise((resolve, reject) => {
//     let fileExists = fs.existsSync(sURL);
//     if (fileExists) {
//       reject(new Error("This file already exists!"));
//       //return;
//     } else {
//       resolve(true);
//       return;
//     }
//   });
// }