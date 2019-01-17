// routes/manage/index.js
"use strict";
const express 	    = require('express'); //express module
const path          = require('path');
const manage        = express.Router();
// const http 		       = require('http');
const bodyParser 	  = require('body-parser');
const sanitizer     = require('express-sanitizer');
const fs			      = require('fs');
const mUtils        = require.main.require('./utils/mUtils.js');
const bunyan        = require('bunyan');

const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
      level: 'debug',
      path: appRoot + '/data/logs/manage-logs.json'
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
manage.use(bodyParser.urlencoded({ extended: false }))
manage.use(sanitizer());



manage.get('/', function(request,response){
  log.info("Rendered /manage/",request.ip);
  response.render(appRoot + '/routes/manage/index');
});
manage.get('/guide', function(request,response){
  log.info("Rendered /guide/",request.ip);
  response.render(appRoot + '/routes/manage/guide');
});
manage.get('/study/new', function(request, response) {
  log.info("GET /study/new/, Requested",request.ip);
  let fileList = fs.readdirSync('public/data/decks/');
  let files = []
  for (let i = 0; i < fileList.length; i++) {
      files.push({ deckName : fileList[i], available : mUtils.getDeckLength('public/data/decks/' + fileList[i]) })
  }
  log.info("GET /study/new/, Rendered",request.ip);
  response.render('studyNew', {files: files});
});
manage.post('/study/create', function(request, response) {
    log.info("POST /study/create, requested",request.ip);
    log.info(request.body);
  //try {
    //a rudimentary check, if there are exactly 7 query string objects
    let oStudyConfig = request.body;
    // console.dir(oStudyConfig);
    //sanitize Fields, one-by-one becuase they each need a little tweek
    // console.log("/study/create, begin load");
    oStudyConfig["studyName"] = request.sanitize(oStudyConfig["studyName"]);
    oStudyConfig["consentCopy"] = request.sanitize(oStudyConfig["consentCopy"]);
    oStudyConfig["instructionCopy"] = request.sanitize(oStudyConfig["instructionCopy"]);
    oStudyConfig["studybackgroundColor"] = request.sanitize(oStudyConfig["studybackgroundColor"]);
    oStudyConfig["refreshRateMS"] = parseInt(request.sanitize(oStudyConfig["refreshRateMS"]));
    oStudyConfig["shuffleDecks"] = mUtils.isTrue(request.sanitize(oStudyConfig["shuffleDecks"]));
    oStudyConfig["shuffleAll"] = mUtils.isTrue(request.sanitize(oStudyConfig["shuffleAll"]));
    oStudyConfig["completionCode"] = request.sanitize(oStudyConfig["completionCode"]);
    // console.log("/study/create, success");
    // console.log(oStudyConfig);

    if (fs.existsSync(appRoot + 'public/data/studies/' + request.body.studyName + '.json')) {
      log.info("POST /study/create, 3, " + request.body.studyName + " file already exists",request.ip);
      response.status(409);
      response.send("File Already Exists");
      response.end();
    } else {
      //Create the completion code file
      log.info("POST /study/create, 4, Forming completionCode file content",request.ip);
      let sCompletionFile = '{"completionURL":"https://app.prolific.ac/submissions/complete?cc=' + request.body.completionCode + '","completionCode":"' + request.body.completionCode + '"}'
      
      log.info("POST /study/create, 5, convert it to JSON");
      let jCompletionFile = JSON.parse(sCompletionFile);
      
      log.info("POST /study/create, 6, Write the codeFile to server", request.ip);
      log.info("POST /study/create, 6.1, " + appRoot,request.ip);
      log.info("POST /study/create, 6.2, " + oStudyConfig.studyName, request.ip);
      
      let sFileURL = appRoot + '/data/codes/' + oStudyConfig.studyName + '_code.json'
      log.info("POST /study/create, 6.3, " + sFileURL, request.ip);
      var writeResult = fs.writeFileSync(sFileURL, JSON.stringify(jCompletionFile,null,2), function(err) {
        if (err) {
          log.info("POST /study/create, 7, there has been an error writing file to server",err);
          throw new Error("/study/create, could not process completionCode\n", err);
        }
      });
      log.info("POST /study/create, 8, codeFile Created", request.ip);
      delete oStudyConfig["completionCode"];

      //create Consent File
      var writeResult = fs.writeFileSync(appRoot + '/public/data/studies/' + oStudyConfig.studyName + '_consent.html', oStudyConfig["consentCopy"], function(err) {
        if (err) {
          log.info("POST /study/create, 9, Error writing Consent file: ",err);
          throw new Error("/study/create, could not process consentCopy\n", err);
        }
  		});
      log.info("POST /study/create, 10, consentFile created", request.ip);
      delete oStudyConfig["consentCopy"];

      //create Instruction File
      var writeResult = fs.writeFileSync(appRoot + '/public/data/studies/' + oStudyConfig.studyName + '_instructions.html', oStudyConfig["instructionCopy"], function(err) {
        if (err) {
          log.info("POST /study/create, 11, Error writing instructionFile: " ,err)
          throw "/study/create, could not process instructionCopy\n", err;
        }
  		});
      log.info("POST /study/create, 12, InstuctionFile Created", request.ip);
      delete oStudyConfig["instructionCopy"];

      //Create the all important studyConfig file
      var writeResult = fs.writeFileSync(appRoot + '/public/data/studies/' + oStudyConfig.studyName + '.json', JSON.stringify(oStudyConfig,null,2), function(err) {
        if (err) {
          log.info("POST /study/create, 13, Error writing StudyConfig" ,err)
          throw new Error("/study/create, could not create study file\n", err);
        }
  		});
      log.info("POST /study/create, 14, configFile created", request.ip);
      response.status(201);
      response.send("File Created");
    }
});
manage.get('/study/list', function(request, response) {
  log.info("GET /study/list requested", request.ip);
  let fileList = fs.readdirSync('public/data/studies/');
  let files = []
  for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].includes('.json')) {
        let url = path.parse(fileList[i])
        files.push({ studyName : url.name })
      }  
  }
  log.info("GET /study/list rendered", request.ip);
  response.render('studyList', {files: files});
});
manage.get('/preflight', function(request, response) {
	log.info("GET /preflight/ rendered", request.ip)
  response.render('preflight');
});
manage.get('/study/duplicate', function(request, response){
  log.info("GET /study/duplicate requested", request.ip)
  let fileList = fs.readdirSync('public/data/studies/');
  let files = []
  for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].includes('.json')) {
        var thisFile = path.parse(fileList[i]); 
        files.push({ studyName : thisFile.name })
      }  
  }
  log.info("GET /study/duplicate rendered", request.ip)
  response.render('duplicate', {files: files});
});
manage.post('/study/duplicate', function(request, response){
  log.info("POST /study/duplicate requested", request.ip)
  // we are going to use await for this.
  let sSource = request.body.source_studyName
  let sNew = request.body.new_studyName
  try {

    //Using Promise with Async\Await 
    let result = duplicateStudy(sSource,sNew)
      .then((resolved) => {
      
      log.info(resolved);
      log.info("POST /study/duplicate Successful", request.ip);
      response.render('duplicate_response', {files: resolved});
      response.end;
    })
      .catch ((error) => {
      let txt = error.message;
      log.info("POST /study/duplicate, failed", txt);
      response.render('error', {err: txt});
      response.end;

    })
    
    // console.log("wow, how did we get here");
    // console.dir(result)

    } catch (error) {
      log.info("POST /study/duplicate, unhandled error", txt);
      response.status = 500
      response.render('error', {err: error});
      response.end;
  } 

  // console.log("Wait what!! Im Asynchronus what do you expect!!");

});
manage.get('/deck/create', function(request,response){
  log.info("POST /deck/create, rendered",request.ip);
  response.render('deckNew');
});
manage.post('/deck/create/:deckName', function(request,response){
  log.info("POST /deck/create/:" + request.params.deckName + ' requested', request.ip);
  if (fs.existsSync(appRoot + '/public/data/decks/' + request.params.deckName + '.json')) {
      log.info("POST /deck/create/:" + request.params.deckName + ', File already exists error', request.ip);
      response.status(409);
      response.send("File Already Exists");
  } else {
      try{
        let deck = request.body;
        var writeResult = fs.writeFileSync(appRoot + '/public/data/decks/' + request.params.deckName + '.json', JSON.stringify(deck, null, 2), function(err) {
          if (err) {
            log.info("deck/create write error");
            throw new Error("/deck/create, could not create Deck", err);
          } 
        });
      } catch (err) {
        log.info("deck/create write catch error"+ err);
        response.status(500);
        response.send("deck/create write catch error");
      }   
      log.info("POST /deck/create/:" + request.params.deckName + ' SEND File Created', request.ip);
      response.status(201);
      response.send("File Created");

  }
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
}
  function copyFile(sourceURL, newURL) {
  return new Promise((resolve, reject) => {
    // exist already
    try{

      if (sourceURL === newURL){
        reject(new Error("The Source File name and Duplicate File name are the same, a duplicate must have a new name!!"));
      }
      
      if (!fs.existsSync(newURL)) {
        fs.copyFile(sourceURL, newURL, (err) => {
          if (err) throw err;
        });
        //SUCCESS!!
        resolve({"created": newURL});

      } else {      
        reject(new Error("copyFile: " + newURL + " file already exists, choose a new name!"));
      }

    } catch (err) {
      reject(new Error("There was an unhandeled error at copyFile: " + err));
    }
  })
}
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
        reject(new Error("The Source File name and Duplicate File name are the same, a duplicate must have a new name!!"));
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
        reject(new Error("copyConfig: " + newStudy + " already Exists, duplication failed!"));
      }

    } catch (err) {
      reject(new Error("There was an unhandeled error at copyConfig: " + err));
    }
  })
}


module.exports = manage;