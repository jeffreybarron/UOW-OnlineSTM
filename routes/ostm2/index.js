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
app.use("/static/layouts", express.static(__dirname + "/public/static"));
app.use("/static/views", express.static(__dirname + "/public/static"));
app.use("/static/styles", express.static(__dirname + "/public/static"));
app.use("/static/scripts", express.static(__dirname + "/public/static"));
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
    // let studyName = request.body.studyName;
    // let participantID = request.body.PROLIFIC_PID;
    // let studyID = request.body.STUDY_ID;
    // let sessionID = request.body.SESSION_ID;
    let jsonResult = request.body;

    var result = saveState(jsonResult)
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
  * i.e. this part of the site, the study, is a single page site
  */

  response.render('base');

});


/*======================================================================================
*
* API Routes Routes
* Usage: response.render('pageName')
*
*/
app.post("/API/flow", function(request, response) {
  
  var result = loadFlow(request.body)
    .then(resolved => {
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      response.status(202).send(resolved);
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        response.status(409).end();
      } else {
        response.status(500).send(err);
      }
    });

});
async function loadFlow(state){

  let jFlow = await readFile( modulePath_Private + "/data/config/stateflow.json" ); 
  state.flow = JSON.parse(jFlow); 
  state.flow.initialised = getDate();
  let result = saveState(state);
  return state;

};
app.post("/API/layout", function(request, response) {

  var pageData = loadLayout(request.body)
    .then(resolved => {
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      
      response.status(202).send(resolved);
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        response.status(409).end();
      } else {
        response.status(500).send(err);
      }
    });

});
async function loadLayout (state) {

  /* so what we are doing is updating and checking data within the state JSON object
  * we store the data and send it along so we dont need to re-read files needlessly
  */
  
  //Fixed Variables
  let resourcePath = modulePath_Private + "/public/static" ;
  
  //if there is no view we may as will stop now!!
  if (state.getView == isNaN){
    throw "No page state was provided!"
  }


  //load the HMTL for this view state
  let sURL = resourcePath + "/layouts/" + state.flow.views[state.getView].layout + ".html"
  state.flow.views[state.getView].layoutContent = await readFile(sURL)

  //update the render date/tim
  state.flow.views[state.getView].layoutLoaded = getDate(); 

  let result = saveState(state);

  return state;

}

app.post("/API/view", function(request, response) {

  var pageData = loadView(request.body)
    .then(resolved => {
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      
      response.status(202).send(resolved);
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        response.status(409).end();
      } else {
        response.status(500).send(err);
      }
    });

});
async function loadView (state) {

  /* so what we are doing is updating and checking data within the state JSON object
  * we store the data and send it along so we dont need to re-read files needlessly
  */
  
  //Fixed Variables
  let sPath = modulePath_Public + "/static";
  
  //if there is no view we may as will stop now!!
  if (state.getView == isNaN){
    throw "No page state was provided!"
  }

  //If a PAGE Styles CSS is provided then prepend the module path, saving new value
  for ( let i = 0; i < state.flow.views[state.getView].layoutStyles.length; i++ ) {
    state.flow.views[state.getView].layoutStyles[i] = sPath + "/styles/" + state.flow.views[state.getView].layoutStyles[i];
  }
  console.dir(state.flow.views[state.getView].layoutStyles);

  //If a contentCSS are provided then prepend the module path, saving new value
  for ( let j = 0; j < state.flow.views[state.getView].viewStyles.length; j++ ) {
    state.flow.views[state.getView].viewStyles[j] = sPath + "/styles/"  + state.flow.views[state.getView].viewStyles[j];
  }
  console.dir(state.flow.views[state.getView].viewStyles);
  
  //If SCRIPTS are provided then prepend the module path, saving new value
  for ( let k = 0; k < state.flow.views[state.getView].scripts.length; k++ ) {
    state.flow.views[state.getView].scripts[k] = sPath + "/scripts/"  + state.flow.views[state.getView].scripts[k];
  }
  console.dir(state.flow.views[state.getView].scripts);

  //load the HMTL for this view state
  var sURL = modulePath_Private + "/public/static/views/" +  state.flow.views[state.getView].name + ".html"
  state.flow.views[state.getView].viewContent = await readFile( sURL  )
  console.log(sURL);

  //update the render date/tim
  state.flow.views[state.getView].viewLoaded = getDate(); 

  let result = saveState(state);

  return state;

}

app.post("/API/save", function(request, response) {
  
  var result = saveState(request.body)
    .then(resolved => {
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      response.status(202).send(resolved);
    })
    .catch(err => {
      if (err.message == "This file already exists!") {
        response.status(409).end();
      } else {
        response.status(500).send(err);
      }
    });

});
async function saveState(state) {

  // //AWAIT --> does file already exist, if so then stop
  // let fileNotExists = await fileNotExists(jsonFileName);

  //AWAIT --> create Deck
  let stateFile = modulePath_Private + "/data/results/" + state.studyName + "_" + state.PROLIFIC_PID + "_" + state.STUDY_ID + "_" + state.SESSION_ID + ".json";

  let writeDeck = await writeJSON(stateFile, state);

  // return [fileNotExists, writeDeck];
  return [writeDeck];

};
app.post("/API/issuecode", function(request, response) {
  // 	//the purpose of the this route\page is to pass the prolific code to the participant if they have completed

  let state = request.body
  //declare file URL's
  var resultFileName =
    __dirname + "/data/results/" +
    state.studyName + "_" +
    state.PROLIFIC_PID + "_" +
    state.STUDY_ID + "_" +
    state.SESSION_ID + ".json";
  var codeFileName = __dirname + "/data/codes/" + state.studyName + "_code.json";

  try {

    var prolificCode = getProlificCode(resultFileName, codeFileName)
      .then(resolved => {
        //wrap the file in JSON and set some other data with it
        // let returnData = resolved;
        response.status(202).send(resolved);
      })
      .catch(err => {
        if (err.message == "This file already exists!") {
          response.status(409).end();
        } else {
          response.status(500).send(err);
        }
      });

  } catch (err) {
    //unhandled exception.
    response.render("error", { rPath: moduleName, err: error.message });
    response.end;
  }
});



/* ====================================================
*
* Utility Functions
*
*/
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
        return reject(err);
      } else {
        return resolve(data);
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


/* ====================================
* Date Functions
*/
function getDate() {
  var d = new Date();
  return d.YYYYMMDDHHmmSSmsec();
}
Date.prototype.YYYYMMDDHHmmSSmsec = function() {
  var YYYY = this.getFullYear().toString();
  var MM = pad(this.getMonth() + 1, 2);
  var DD = pad(this.getDate(), 2);
  var HH = pad(this.getHours(), 2);
  var mm = pad(this.getMinutes(), 2);
  var ss = pad(this.getSeconds(), 2);
  var msec = pad(this.getMilliseconds(), 4);
  return YYYY + MM + DD + "T" + HH + ":" + mm + ":" + ss + "." + msec;
};
function pad(number, length) {
  var str = "" + number;
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}


module.exports = app;
