// routes/manage/index.js
"use strict";
const express 	    = require('express'); //express module
const path          = require('path');
const manage        = express.Router();
const http 		    = require('http');
// const favicon 	    = require('serve-favicon');
const bodyParser 	  = require('body-parser');
// const sanitizeHtml  = require('sanitize-html');
const sanitizer     = require('express-sanitizer');
//require.main.require is more obcvious than ./../../../
const fs			      = require('fs');
// const mDates        = require.main.require('./utils/mDates.js');
const mUtils        = require.main.require('./utils/mUtils.js');



// manage.use('/manage', manage);
manage.use('/data/studies', express.static('public/data/studies'));
manage.use('/data/decks', express.static('public/data/decks'));
manage.use(bodyParser.json()); // for parsing application/json
manage.use(bodyParser.urlencoded({ extended: false }))
manage.use(sanitizer());

manage.get('/', function(request,response){
  response.render(appRoot + '/routes/manage/index');
});
manage.get('/guide', function(request,response){
  response.render(appRoot + '/routes/manage/guide');
});
manage.get('/study/new', function(request, response) {
  let fileList = fs.readdirSync('public/data/decks/');
  let files = []
  for (let i = 0; i < fileList.length; i++) {
      files.push({ deckName : fileList[i], available : mUtils.getDeckLength('public/data/decks/' + fileList[i]) })
  }
  response.render('studyNew', {files: files});
});
manage.post('/study/create', function(request, response, next) {
    // console.log("/study/create, Begin");
    // console.dir(request.body);
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
      response.status(409);
      response.send("File Already Exists");
      response.end();
    } else {
      //Create the completion code file
      let sCompletionFile = '{"completionURL":"https://app.prolific.ac/submissions/complete?cc=' + request.body.completionCode + '","completionCode":"' + request.body.completionCode + '"}'
      sCompletionFile = JSON.parse(sCompletionFile);
      var writeResult = fs.writeFileSync(appRoot + '/data/codes/' + oStudyConfig.studyName + '_code.json', JSON.stringify(sCompletionFile), function(err) {
        if (err) throw "/study/create, could not process completionCode\n", err;
        console.log("completionCode File Error");
      });
      delete oStudyConfig["completionCode"];

      //create Conset File
      var writeResult = fs.writeFileSync(appRoot + '/public/data/studies/' + oStudyConfig.studyName + '_consent.html', oStudyConfig["consentCopy"], function(err) {
        if (err) throw "/study/create, could not process consentCopy\n", err;
        console.log("conset File Error");
  		});
      delete oStudyConfig["consentCopy"];

      //create Instruction File
      var writeResult = fs.writeFileSync(appRoot + '/public/data/studies/' + oStudyConfig.studyName + '_instructions.html', oStudyConfig["instructionCopy"], function(err) {
        if (err) throw "/study/create, could not process instructionCopy\n", err;
        console.log("Instruction File Error");
  		});
      delete oStudyConfig["instructionCopy"];

      //Create the all important studyConfig file
      var writeResult = fs.writeFileSync(appRoot + '/public/data/studies/' + oStudyConfig.studyName + '.json', JSON.stringify(oStudyConfig), function(err) {
        if (err) throw "/study/create, could not create study file\n", err;
        console.log("Config File Error");
  		});

      response.status(201);
      response.send("File Created");
    }
});
manage.get('/study/list', function(request, response) {
  let fileList = fs.readdirSync('public/data/studies/');
  let files = []
  for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].includes('.json')) {
        files.push({ studyName : fileList[i] })
      }  
  }
  response.render('studyList', {files: files});
});
manage.get('/study/duplicate', function(request, response){
  let fileList = fs.readdirSync('public/data/studies/');
  let files = []
  for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].includes('.json')) {
        var thisFile = path.parse(fileList[i]); 
        files.push({ studyName : thisFile.name })
      }  
  }
  response.render('duplicate', {files: files});
});
manage.post('/study/duplicate', function(request, response, next){
  // we are going to use await for this.
  let sSource = request.body.source_studyName
  let sNew = request.body.new_studyName
  try {
    let result = duplicateStudy(sSource,sNew);
    // response.render('duplicate', {files: files});
    console.log("duplicate returned");
    response.status = 200
  } catch (err) {
    response.status = 500
    console.log(err)
  } 
  
  console.log("WTF");
});
async function duplicateStudy (sSource, sNew) {
  let sURL = appRoot + '/public/data/studies/';
  try { 
    //validate sNewURL
    if( sNew.length < 20 || sNew.length > 25 || !sNew ){
      console.log("invalid studyName");
      throw "New studyName must be 24 characters, please use the documented Syntax"
    } 
    

    //does the new file exist then throw an error
      console.log("configResult, start");
    let configResult = await copyConfig(sURL, sSource, sNew);
      // console.log("configResult, complete",configResult);
    let consentResult = await copyFile(sURL + sSource + '_consent.html',sURL + sNew + '_consent.html');
      // console.log("configResult, complete",consentResult);
    let instructionResult = await copyFile(sURL + sSource + '_instructions.html',sURL + sNew + '_instructions.html');
      // console.log("configResult, complete", instructionResult);

    if (configResult && consentResult && instructionResult){
      return true;
    } else {
      sMsg = "One of the configuration files was not created\n " + 
        "ConfigFile:" + configResult + "\n" +
        "consentResult:" + consentResult + "\n" +
        "instructionResult:" + instructionResult;
      return false;
    }
  } catch (err) {
      console.log(err);
      return false;
  }
console.log("WT");
}


function copyFile(sourceURL, newURL) {
  return new Promise((resolve, reject) => {
    // exist already
    try{
      if (sourceURL === newURL){
        Promise.reject(new Error("The Source File name and Destination File name are the same, a duplicate must have a new name!!"));
        return false;
      }
      
      if (!fs.existsSync(newURL)) {
        fs.copyFile(sourceURL, newURL, (err) => {
          if (err) throw err;
        });
        let sMsg = newURL + " copied."
        Promise.resolve('Success');
        console.log(sMsg);
        return true;
      } else {      
        let sMsg = newURL + " file already exists, choose a new name"
        Promise.reject(new Error(sMsg));
        console.log(sMsg);
        return false;
      }

    } catch (err) {
      let sMsg = "Unhandled copyFile err:" + err;
      Promise.reject(new Error(sMsg));
      return false;
    }
  })
}
function copyConfig(URL, sourceStudy, newStudy) {
  console.log("copyConfig:","0");
  return new Promise((resolve, reject) => {
    // copy config file 
    try{

      //need something to copy see if the source file exists
      console.log("copyConfig:","1");
      if (!fs.existsSync(URL + sourceStudy + ".json")) {
        let sMsg = "Source File does not Exist:" + err;
        Promise.reject(new Error(sMsg));
        return false;
      }
      console.log("copyConfig:","2");

      if (sourceStudy === newStudy){
        let sMsg = "The Source File name and Destination File name are the same, a duplicate must have a new name!!\n\n" + err;
        Promise.reject(new Error(sMsg));
        return false;
      }
      console.log("copyConfig:","3");

      //if new file does not exists then
      if (!fs.existsSync(URL + newStudy + ".json")) {
        // 2-read old file, update studyName
        console.log("copyConfig:","4");
        let configFile = fs.readFileSync(URL + sourceStudy + ".json", 'utf8');
        let oStudyConfig = JSON.parse(configFile);
        oStudyConfig.studyName = newStudy
        let sNewFile = JSON.stringify(oStudyConfig,null,2)
        // 3-write updated config to file on the new studyName
        let writeResult = fs.writeFileSync(URL + newStudy + ".json", sNewFile, function(err) {
          if(err) {
            let sMsg = "CopyConfig, WriteFile Failed: " + err;;
            Promise.reject(new Error(sMsg));
            // return false;
          }
        });
        let sMsg = "CopyConfig, File Duplicated successfully: ";
        Promise.resolve();
        console.log(sMsg);
        // return true;
      } else {
        let sMsg = newStudy + " already Exists, duplication failed!";
        Promise.reject(new Error(sMsg));
        console.log(sMsg);
        // return false;
      }

    } catch (err) {
      let sMsg = "CopyConfig, There was an unhandeled problem:" + err;
      Promise.reject(new Error(sMsg));
      console.log(sMsg);
      // return false;
    }
  })
}






manage.get('/preflight', function(request, response) {
	response.render('preflight');
});

module.exports = manage;