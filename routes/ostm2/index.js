// routes/ostm/index.js
"use strict";
const express = require("express"); //express module
const app = express();
const bodyParser = require("body-parser");
const sanitizer = require("express-sanitizer");
const fs = require("fs");
const bunyan = require("bunyan");
const manage = require("./manage");

const moduleName = "/ostm2";//deprecated
const modulePath_Private = appRoot + "/routes/ostm2" 
const modulePath_Public = "/ostm2" 

app.use("/manage", manage);
app.use("/static", express.static(__dirname + "/public/static"));
app.use("/resources/studies", express.static(__dirname + "/public/resources/studies"));
app.use("/resources/decks", express.static(__dirname + "/public/resources/decks"));
app.use(bodyParser.json()); // for parsing application/json
app.use(sanitizer());

app.set("view engine", "ejs");
app.set("views", [
  __dirname
]);

/*======================================================================================
*
* Server Side Logging Middleware
*
*/
const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
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
app.get("/", function(request, response) {
  log.info("GET /participant/:" + request.params.studyName + ", requested", request.ip);
  let sURL = appRoot + "/public/resources/studies/" + request.params.studyName + ".json";

  response.render('index',{ rPath: moduleName });
  
});
app.get("/participant/:studyName", function(request, response, next) {
  log.info("GET /participant/:" + request.params.studyName + ", requested", request.ip);
  let sURL = __dirname + "/public/resources/studies/" + request.params.studyName + ".json";
  //Using Promise with Async\Await
  let result = fileExistsAsync(sURL)
    .then(resolved => {
      log.info("GET /participant/:" + request.params.studyName + ", Successful", request.ip);
      response.render("base", { rPath: moduleName, studyName: request.params.studyName, qs: request.query });
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
app.get("/consent/:studyName", function(request, response, next) {
  log.info("GET /consent/:" + request.params.studyName + ", requested", request.ip);
  let sURL = __dirname + "/public/resources/studies/" + request.params.studyName + ".json";
  //Using Promise with Async\Await
  let result = fileExistsAsync(sURL)
    .then(resolved => {
      log.info("GET /consent/:" + request.params.studyName + ", Successful", request.ip);
      response.render("consent", { rPath: moduleName, studyName: request.params.studyName, qs: request.query });
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
app.get("/instructions/:studyName", function(request, response, next) {
  log.info("GET /instructions/:" + request.params.studyName + ", requested", request.ip);
  let sURL = __dirname + "/public/resources/studies/" + request.params.studyName + ".json";
  //Using Promise with Async\Await
  let result = fileExistsAsync(sURL)
    .then(resolved => {
      log.info("GET /instructions/:" + request.params.studyName + ", Successful", request.ip);
      if (request.query.checkConsent === "on") {
        response.render("instructions", { rPath: moduleName, studyName: request.params.studyName, qs: request.query });
      } else {
        //if consent tickbox is off then redirect back to consent
        response.render("consent", { rPath: moduleName, studyName: request.params.studyName, qs: request.query });
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
// app.get("/study/:studyName", function(request, response, next) {
//   log.info("GET /study/:" + request.params.studyName + ", requested", request.ip);
//   let sURL = __dirname + "/public/resources/studies/" + request.params.studyName + ".json";
//   //Using Promise with Async\Await
//   let result = fileExistsAsync(sURL)
//     .then(resolved => {
//       if (!request.query.checkConsent === "on") {
//         response.render("consent", { rPath: moduleName, studyName: request.params.studyName, qs: request.query });
//         response.end;
//       }
//       if (!request.query.checkInstructions === "on") {
//         response.render("instructions", { rPath: moduleName, studyName: request.params.studyName, qs: request.query });
//         response.end;
//       }

//       //checks are ok render the test
//       let oInstance = {
//         studyName: request.params.studyName,
//         PROLIFIC_PID: request.query.PROLIFIC_PID,
//         STUDY_ID: request.query.STUDY_ID,
//         SESSION_ID: request.query.SESSION_ID
//       };
//       response.render("study", { rPath: moduleName, studyName: request.params.studyName, qs: request.query });
//       log.info({ instance: oInstance }, ": study .rendered");
//       response.end;
//     })
//     .catch(error => {
//       let txt = error.message;
//       log.info("GET /study/:" + request.params.studyName + ", failed", error.message);
//       var fTemplate = fs.readFileSync("404.html", "utf8");
//       response.send(fTemplate);
//       response.end;
//     });
// });
app.get("/sendCode/:studyName", function(request, response) {
  // 	//the purpose of the this route\page is to pass the prolific code to the participant if they have completed

  //declare file URL's
  var resultFileName =
    __dirname + "/data/results/" +
    request.params.studyName + "_" +
    request.query.PROLIFIC_PID + "_" +
    request.query.STUDY_ID + "_" +
    request.query.SESSION_ID + ".json";
  var codeFileName = __dirname + "/data/codes/" + request.params.studyName + "_code.json";

  try {
    var prolificCode = getProlificCode(resultFileName, codeFileName)
      .then(jsonGetCode => {
        // the study has been saved and the prolific code retrieved
        response.render("studycomplete", { rPath: moduleName, qs: jsonGetCode });
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
          response.render("error", { rPath: moduleName,
            err: request.params.studyName + "_code does not exist, contact Researcher."
          });
          response.end;
        } else {
          // there is a missing file
          log.info("POST /study/duplicate, failed", error.message);
          response.render("error", { rPath: moduleName, err: error.message });
          response.end;
        }
      });
  } catch (err) {
    //unhandled exception.
    response.render("error", { rPath: moduleName, err: error.message });
    response.end;
  }
});
app.post("/results", function(request, response, next) {
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
      __dirname + "/data/results/" +
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
app.get("/study", function(request, response) {

  let JSONstateData = request.query; // initialise stateData with URL Query string key/vals

  /* As HTTP:GET on /base is the begining of the study 
  * we take the query string with Prolific data and add default state value of 0
  * /data/configuration/statflow.json defines pagination via AJAX API calls after this page render
  * i.e. this part of the site, the study, is a single page site
  */
  JSONstateData.getView = 0;

  //save stateFlow config to JSONstateData then render the  
  var result = loadFlow()
    .then(resolved => {
      JSONstateData.stateFlowConfig = resolved;
      JSONstateData = JSON.stringify(request.query);
      console.log(JSONstateData);
      response.render('base', { stateData: JSONstateData });

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

async function loadFlow(){

  let jFlow = await readFile( modulePath_Private + "/data/config/stateflow.json" ); 
  return JSON.parse(jFlow);

}

/*======================================================================================
*
* API Routes Routes
* Usage: response.render('pageName')
*
*/
app.post("/API/page", function(request, response) {
  //State Variables
  let stateData = {};
  stateData = request.body; //dont change these at this API Call

  var pageData =  preparePage(stateData)
    .then(resolved => {
      //wrap the file in JSON and set some other data with it
      let returnData = resolved;
      response.status(202).send(returnData);
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        response.status(409).end();
      } else {
        response.status(500).send(err);
      }
  });;




});

async function preparePage (state) {
  /* so what we are doing is updating and checking data within the state JSON object
  * we store the data and send it along so we dont need to re-read files needlessly
  */
  
  //Fixed Variables
  let scriptPath = modulePath_Public + "/static/";
  
  //if there is no view we may as will stop now!!
  if (state.getView == isNaN){
    throw "No page state was provided!"
  }

  //If a script is provided then prepend the module path, saving new value
  if ( state.stateFlowConfig.views[state.getView].script ) {
    state.stateFlowConfig.views[state.getView].script = modulePath_Public + 
      "/static/" + state.stateFlowConfig.views[state.getView].script;
  }

  //load the HMTL for this view state
  state.pageContent = await readFile(
    modulePath_Private + "/pages/" + 
    state.stateFlowConfig.views[state.getView].name + ".html"
  )

  return state;

}




async function postResult(jsonFileName, jsonResult) {
  log.trace("POST /deck/create PostResult: " + jsonFileName, jsonResult);

  //AWAIT --> does file already exist, if so then stop
  // let fileNotExists = await fileNotExists(jsonFileName);

  //AWAIT --> create Deck
  let writeDeck = await writeJSON(jsonFileName, jsonResult);

  // return [fileNotExists, writeDeck];
  return [fileNotExists, writeDeck];
}

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

module.exports = app;
