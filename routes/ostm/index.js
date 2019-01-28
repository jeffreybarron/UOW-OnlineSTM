// routes/ostm/index.js

// create another router for getting 'product' resources
"use strict";
const express 	    = require('express'); //express module
const router        = express.Router();
const bodyParser 	  = require('body-parser');
const sanitizer     = require('express-sanitizer');
const fs			      = require('fs');





const bunyan        = require('bunyan');

const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
      level: 'debug',
      path: appRoot + '/data/logs/ostm-logs.json'
    },
    {
      level: 'info',
      stream: process.stdout
    }
  ],
  src: true,
});

router.use('/static', express.static('public/static'));
router.use('/data/studies', express.static('public/data/studies'));
router.use('/data/decks', express.static('public/data/decks'));
router.use('/data/codes', express.static('data/codes'));

router.use(bodyParser.json()); // for parsing application/json
router.use(sanitizer());



router.get('/participant/:studyName', function(request, response, next) {
	log.info("GET /participant/:" + request.params.studyName + ', requested', request.ip);
	try {
		let sURL = appRoot + '/public/data/studies/' + request.params.studyName + '.json'
		if (fs.existsSync(sURL)) {
			response.render('participant', {studyName: request.params.studyName, qs: request.query});
		} else {
			var fTemplate = fs.readFileSync('404.html', 'utf8');
			response.send(fTemplate);
		}
	}
	catch (err) {
		var fTemplate = fs.readFileSync('404.html', 'utf8');
		response.send(fTemplate);
	}
});

router.get('/consent/:studyName', function(request, response, next) {
	log.info("GET /consent/:" + request.params.studyName + ', requested', request.ip);
	try {
		let sURL = appRoot + '/public/data/studies/' + request.params.studyName + '.json'
		if (fs.existsSync(sURL)) {
			response.render('consent', {studyName: request.params.studyName, qs: request.query});
		} else {
			var fTemplate = fs.readFileSync('404.html', 'utf8');
			response.send(fTemplate);
		}
	}
	catch (err) {
		var fTemplate = fs.readFileSync('404.html', 'utf8');
		response.send(fTemplate);
	}
});

router.get('/instructions/:studyName', function(request, response, next) {
	log.info("GET /instructions/:" + request.params.studyName + ', requested', request.ip);
	try {
		let sURL = appRoot + '/public/data/studies/' + request.params.studyName + '.json'
		if (fs.existsSync(sURL)) {
			if (request.query.checkConsent === "on") {
				response.render('instructions', {studyName: request.params.studyName, qs: request.query});
			} else {
				//if consent off then back for consent
				response.render('consent', {studyName: request.params.studyName, qs: request.query});
			}
		} else {
			throw "Study does not exist!";
		}
	}
	catch (err) {
		var fTemplate = fs.readFileSync('404.html', 'utf8');
		response.send(fTemplate);
	}
});

router.get('/study/:studyName', function(request, response, next) {
	log.info("GET /study/:" + request.params.studyName + ', requested', request.ip);
	let oInstance = {"studyName": request.params.studyName,
		"PROLIFIC_PID":request.query.PROLIFIC_PID,
		"STUDY_ID": request.query.STUDY_ID,
		"SESSION_ID": request.query.SESSION_ID} 
	
	try {
		let sURL = appRoot + '/public/data/studies/' + request.params.studyName + '.json'
		if (fs.existsSync(sURL)) {
			if (request.query.checkInstructions === "on") {
				response.render('study', {studyName: request.params.studyName, qs: request.query});
				log.info({"instance": oInstance},'study.rendered');
			} else {
				//if consent off then back for consent
				response.render('instructions', {studyName: request.params.studyName, qs: request.query});
			}
		} else {
			throw "Study does not exist!";
		}
	}
	catch (err) {
		var fTemplate = fs.readFileSync('404.html', 'utf8');
		response.send(fTemplate);
	}
});

router.post('/results', function(request,response, next) {
  log.info("POST /results/ requested", request.ip);
	try {
		let	studyName = request.body.studyName;
		let participantID = request.body.PROLIFIC_PID;
		let	studyID = request.body.STUDY_ID;
		let sessionID = request.body.SESSION_ID;
		let jsonFileName = appRoot + '/data/results/' + studyName + "_" + participantID + "_" + studyID + "_" + sessionID + '.json';
		console.log(jsonFileName);

		let	jsonResult = JSON.stringify(request.body, null, 2);
    let writeResult = fs.writeFileSync(jsonFileName, jsonResult, function(err) {
      if(err) {
				console.log(".post('/results, WriteResult Error:" + err);
				return console.err(err);
			}
		});
    response.end();

		// let getCodeFile = fs.readFileSync(appRoot + 'data/codes/' + studyName + '_code.json', 'utf8');
		// let jsonGetCode = JSON.parse(getCodeFile);
	} catch (err) {
		let fTemplate = fs.readFileSync(appRoot + '/404.html', 'utf8');
		response.send(fTemplate);
	}
});

router.get('/sendCode/:studyName', function(request, response) {
	log.info("GET /sendCode/:" + request.params.studyName + ', requested', request.ip);
	var errLocation = "get.sendCode/:studyName', "
	//the purpose of the this route\page is to collect the completion URL
	try {
		//check if the study has been saved first
		var resultFileName = appRoot + '/data/results/' + request.params.studyName + "_" +
			request.query.PROLIFIC_PID + "_" +
			request.query.STUDY_ID + "_" +
			request.query.SESSION_ID + ".json";

		if (fs.existsSync(resultFileName)) {
			//in that case we can load the completion code from the _code.json file
			var codeFileName = appRoot + '/data/codes/' + request.params.studyName + '_code.json'
			if (fs.existsSync(codeFileName)) {
				var getCodeFile = fs.readFileSync(codeFileName, 'utf8');
				var jsonGetCode = JSON.parse(getCodeFile);
				//studyName: request.params.studyName, qs: request.query
				response.render('studycomplete', {qs: jsonGetCode});
				return true;
			} else {
				throw errLocation + " codeFileName NOT FOUND: " + resultFileName;
			}
		} else {
			throw errLocation + " resultFileName NOT FOUND: " + resultFileName;
		}
	}
	catch (err) {
		//var errFile = fs.readFileSync('404.html', 'utf8');
		response.render('404', {qs: {"err":err}});
		return false;
	}
});


module.exports = router;
