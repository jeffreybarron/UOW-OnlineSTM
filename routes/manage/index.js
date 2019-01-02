// routes/manage/index.js
"use strict";
const express 	    = require('express'); //express module
const manage        = express.Router();
// const http 		    = require('http');
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
manage.use(sanitizer());



manage.get('/', function(request,response){
  response.render(appRoot + '/routes/manage/index');
});
manage.get('/guide', function(request,response){
  response.render(appRoot + '/routes/manage/guide');
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

manage.get('/preflight', function(request, response) {
	response.render('preflight');
});

module.exports = manage;