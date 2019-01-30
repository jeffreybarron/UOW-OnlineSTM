// routes/manage/index.js
"use strict";
const express 	    = require('express'); //express module
const path          = require('path');
const manage        = express.Router();
const bodyParser 	  = require('body-parser');
const sanitizer     = require('express-sanitizer');

const fs			      = require('fs');
const util          = require('util');
const bunyan        = require('bunyan');
const mUtils        = require.main.require('./utils/mUtils.js');
const moduleName    = 'manage';

const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
      level: 'debug',
      path: appRoot + '/data/logs/' + moduleName + '-logs.json'
    },
    {
      level: 'info',
      stream: process.stdout
    }
  ],
  src: true,
});



// manage.use('/manage', manage);
manage.use('/data/studies', express.static('public/data/studies'));
manage.use('/data/decks', express.static('public/data/decks'));
manage.use(bodyParser.json()); // for parsing application/json
manage.use(bodyParser.urlencoded({ extended: false }));
manage.use(sanitizer());



manage.get('/', function(request,response){
  log.info('Rendered /' + moduleName + '/ for IP:' + request.ip + ' using: ' + request.headers['user-agent']);
  response.render(appRoot + '/routes/' + moduleName + '/index');
});
manage.get('/guide', function(request,response){
  log.info("Rendered /guide/ for IP:" + request.ip + " using: " + request.headers['user-agent']);
  response.render(appRoot + '/routes/' + moduleName + '/guide');
});
manage.get('/deck/create', function(request,response){
  log.info("POST /deck/create, rendered for IP:" + request.ip + " using: " + request.headers['user-agent']);
  response.render('deckNew');
});
manage.get('/preflight', function(request, response) {
	log.info("GET /preflight/ rendered for IP:" + request.ip + " using: " + request.headers['user-agent']);
  response.render('preflight');
});


manage.get('/study/list', function(request, response) {
  log.info("GET /study/list requested for IP:" + request.ip + " using: " + request.headers['user-agent']);
  const getFileList = util.promisify(fs.readdir);
  getFileList('public/data/studies/').then((fileList) => {
    //do somthing with file list
    let files = [];
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].includes('.json')) {
        let url = path.parse(fileList[i]);
        files.push({ studyName : url.name });
      }  
    } 
    response.render('studyList', {files: files});
    log.info("GET /study/list rendered", request.ip);
    response.end;
  }).catch ((error) => {
    //handle the error
  	response.render('error', {err: error.message});
		response.end;
  });
});
manage.get('/study/new', function(request, response) {
  log.info("GET /study/new/, Requested for IP:" + request.ip + " using: " + request.headers['user-agent']);
  const getFileList = util.promisify(fs.readdir);
  getFileList('public/data/decks/').then((fileList) => {
    //do somthing with file list
    let files = [];
    for (let i = 0; i < fileList.length; i++) {
        files.push({ deckName : fileList[i], available : mUtils.getDeckLength('public/data/decks/' + fileList[i]) });
    }
    log.info("GET /study/new/, Rendered for IP:" + request.ip);
    response.render('studyNew', {files: files});
  }).catch ((error) => {
    //handle the error
  	response.render('error', {err: error.message});
  });
});
manage.get('/study/duplicate', function(request, response){
  log.info("GET /study/duplicate, Requested for IP:" + request.ip + " using: " + request.headers['user-agent']);
  const getFileList = util.promisify(fs.readdir);
  getFileList('public/data/studies/').then((fileList) => {
    //do somthing with file list
    let files = [];
    for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].includes('.json')) {
          var thisFile = path.parse(fileList[i]); 
          files.push({ studyName : thisFile.name });
        }  
    }
    log.info("GET /study/duplicate, Rendered for IP:", request.ip);
    response.render('studyDuplicate', {files: files});
    response.end;
  }).catch ((error) => {
    //handle the error
  	response.render('error', {err: error.message});
		response.end;
  });
});

manage.post('/deck/create/:deckName', function(request, response){
  log.info("POST /deck/create/:" + request.params.deckName + " requested for IP:" + request.ip);
  
  var result = createDeck(request.params.deckName, request.body)
    .then((resolved) => {
      log.info("POST /deck/create, Successful", resolved);
      log.info("POST /deck/created, from IP:", request.ip);
      response.status(201).end();
    })
    .catch ((err) => {
      if (err.message == "This file already exists!") {
        log.info("POST /deck/created, This file already exists!, from IP:", request.ip);
        response.status(409).end();
      } else {
        log.info("POST /deck/create, failed", err.message);
        response.status(500).end();
      }
  });

});
async function createDeck (deckName, deck) {
  log.info("POST /deck/create createDeck: " + deckName, deck);
  //AWAIT --> does file already exist, if so then stop
  let deckNotExists = await fileNotExists(appRoot + '/public/data/decks/' + deckName + '.json');
  
  //AWAIT --> create Deck
  let writeDeck = await writeJSON(appRoot + '/public/data/decks/' + deckName + '.json', deck);
    
  return [deckNotExists, writeDeck];
};

manage.post('/study/create', function(request, response) {

    log.info("POST /study/create, requested for IP:" + request.ip + " using: " + request.headers['user-agent']);
    log.info(request.body);
  //try {
    //a rudimentary check, if there are exactly 7 query string objects
    let oStudyConfig = request.body;
    log.trace(oStudyConfig);
    //sanitize Fields, one-by-one becuase they each need a little tweek
    log.trace("/study/create, begin load");
    oStudyConfig["studyName"] = request.sanitize(oStudyConfig["studyName"]);
    oStudyConfig["consentCopy"] = request.sanitize(oStudyConfig["consentCopy"]);
    oStudyConfig["instructionCopy"] = request.sanitize(oStudyConfig["instructionCopy"]);
    oStudyConfig["studybackgroundColor"] = request.sanitize(oStudyConfig["studybackgroundColor"]);
    oStudyConfig["refreshRateMS"] = parseInt(request.sanitize(oStudyConfig["refreshRateMS"]));
    oStudyConfig["shuffleDecks"] = mUtils.isTrue(request.sanitize(oStudyConfig["shuffleDecks"]));
    oStudyConfig["shuffleAll"] = mUtils.isTrue(request.sanitize(oStudyConfig["shuffleAll"]));
    oStudyConfig["completionCode"] = request.sanitize(oStudyConfig["completionCode"]);
    log.trace("/study/create, success");
    log.trace(oStudyConfig);

  try {

    var result = createStudy(request.body.studyName,request.body.completionCode, oStudyConfig)
      .then((resolved) => {
        log.info("POST /study/create, Successful", resolved);
        log.info("POST /study/created, from IP:", request.ip);
        response.status(201).end();
    })
      .catch ((err) => {
        if (err.message == "This file already exists!") {
          log.info("POST /study/created, This file already exists!, from IP:", request.ip);
          response.status(409).end();
        } else {
          log.info("POST /study/create, failed", err.message);
          response.status(500).send(err);
        }
    });
    
  } catch (error) {
    response.render('error', {err: error.message});
    response.end;
  }
});
async function createStudy (studyName, completionCode, oStudyConfig) {
  // try { 
    //declare variables
    let sURL = appRoot + '/public/data/studies/';
    let sPrivateURL = appRoot + '/data/codes/';
        
    //AWAIT --> does file already exist, if so then stop
    let studyNotExists = await fileNotExists(sURL + studyName + '.json')
   
    //AWAIT --> write codeFile
    let sCompletionFile = '{"completionURL":"https://app.prolific.ac/submissions/complete?cc=' + completionCode + '","completionCode":"' + completionCode + '"}';
    let jCompletionFile = JSON.parse(sCompletionFile);
    let codeFile = await writeJSON(sPrivateURL + studyName + '_code.json', jCompletionFile);
    delete oStudyConfig["completionCode"];

    //AWAIT --> write consentFile
    let consentFile = await writeFile (sURL + oStudyConfig.studyName + '_consent.html', 
      oStudyConfig["consentCopy"]);
    delete oStudyConfig["consentCopy"];

    //AWAIT --> write instructionFile
    let instructionFile = await writeFile(sURL + oStudyConfig.studyName + '_instructions.html',  oStudyConfig["instructionCopy"]);
    delete oStudyConfig["instructionCopy"];

    //AWAIT --> write configfile
    let configFile = await writeJSON(sURL + oStudyConfig.studyName + '.json', oStudyConfig);

    return [studyNotExists, codeFile, instructionFile, configFile];
};

manage.post('/study/duplicate', function(request, response){
  log.info("POST /study/duplicate requested for IP:" + request.ip + " using: " + request.headers['user-agent']);
  // we are going to use await for this.
  let sSource = request.body.currentStudyName;
  let sNew = request.body.new_studyName;
  try {

    //Using Promise with Async\Await 
    let result = duplicateStudy(sSource,sNew)
      .then((resolved) => {
        log.info("POST /study/duplicate, Successful", resolved);
        log.info("POST /study/duplicate, from IP:", request.ip);
        response.status(201).end();
    })
      .catch ((err) => {
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
  	response.render('error', {err: error.message});
		response.end;
  };
});
async function duplicateStudy (sSource, sNew) {
  try { 
    //validate sNewURL
    if( sNew.length < 20 || sNew.length > 25 || !sNew ){
      throw "New studyName must be 24 characters, please use the documented Syntax"
    } 

    //does the new file exist then throw an error
    let sURL = appRoot + '/public/data/studies/';
    let configResult = await copyConfig(sURL, sSource, sNew);
    let consentResult = await copyFile(sURL + sSource + '_consent.html',sURL + sNew + '_consent.html');
    let instructionResult = await copyFile(sURL + sSource + '_instructions.html',sURL + sNew + '_instructions.html');

    let sPrivateURL = appRoot + '/data/codes/';
    let prolificCode = await copyFile(sPrivateURL + sSource + '_code.json', sPrivateURL + sNew + '_code.json');
    
    //I really dont know how to report back from here? this doesnt seem to work
    return [configResult, consentResult, instructionResult, prolificCode];

  } catch (err) {
      log.info(err);
      throw (err);
  }
};

function copyFile(sourceURL, newURL) {
  return new Promise((resolve, reject) => {
    // exist already
    try{

      if (sourceURL === newURL){
        reject(new Error("This file already exists!"));
      }
      if (!fs.existsSync(newURL)) {
        fs.copyFile(sourceURL, newURL, (err) => {
          if (err) throw err;
        });
        resolve({"created": newURL});

      } else {      
        reject(new Error("This file already exists!"));
      }

    } catch (err) {
      reject(new Error("There was an unhandeled error at copyFile: " + err));
    }
  })
};
function copyConfig(URL, sourceStudy, newStudy) {
  return new Promise((resolve, reject) => {
    // copy config file 
    try{
      //need something to copy see if the source file exists
      if (!fs.existsSync(URL + sourceStudy + ".json")) {
        let sMsg = "Source File does not Exist:" + err;
        reject(new Error(sMsg));
      }

      if (sourceStudy === newStudy){
        reject(new Error("This file already exists!"));
      }

      //if new file does not exists then
      if (!fs.existsSync(URL + newStudy + ".json")) {

        // 2-read old file, update studyName
        let configFile = fs.readFileSync(URL + sourceStudy + ".json", 'utf8');
        let oStudyConfig = JSON.parse(configFile);
        oStudyConfig.studyName = newStudy
        let sNewFile = JSON.stringify(oStudyConfig,null,2)

        // 3-write updated config to file on the new studyName
        let writeResult = fs.writeFileSync(URL + newStudy + ".json", sNewFile, function(err) {
          if(err) {
             throw "fs.writeFileSync failed: " + err;
          }
        });
        //SUCCESS!!
        resolve({"created": URL + newStudy + '.json'});

      } else {
        reject(new Error("This file already exists!"));
      }

    } catch (err) {
      reject(new Error("There was an unhandeled error at copyConfig: " + err));
    }
  })
};
function writeJSON(sURL, data){
  return new Promise((resolve, reject) => {
    var sFile = JSON.stringify(data,null,2) 
    fs.writeFile(sURL, sFile, 'utf-8', function(err) {
        if (err) {
          //Deal with error
          reject(err);
          return;
        } else {
          resolve(data);
        };
    });

	});
}
function writeFile(sURL, data){
  return new Promise((resolve, reject) => {
    fs.writeFile(sURL, data, 'utf-8', function(err) {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(data);
        };
    });

	});
}
function fileNotExists (sURL) {
  return new Promise((resolve, reject) => {
		let fileExists = fs.existsSync(sURL);
		if (fileExists) {
			reject (new Error("This file already exists!"));
      //return; 
		} else {
			resolve (true);
      return;
		}
	});
};

function fileExists (sURL) {
  return new Promise((resolve, reject) => {
		let fileExists = fs.existsSync(sURL);
		if (fileExists) {
			resolve (fileExists);
		} else {
			reject (true);
		}
	});
};
//This Function is used on its own for asyncronous file checks on various routes.. no its not great.
async function fileExistsAsync (sURL) {
	let fileExists = await fs.existsSync(sURL);
	if (fileExists) {
		return fileExists;
	} else {
		throw "File does not exist.";
	}
};

module.exports = manage;