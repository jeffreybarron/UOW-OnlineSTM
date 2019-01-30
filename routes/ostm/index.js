// routes/ostm/index.js
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
	let sURL = appRoot + '/public/data/studies/' + request.params.studyName + '.json'
	//Using Promise with Async\Await 
  let result = fileExistsAsync(sURL).then((resolved) => {

			log.info("GET /participant/:" + request.params.studyName + ", Successful", request.ip);
			response.render('participant', {studyName: request.params.studyName, qs: request.query});
			response.end;

  	}).catch ((error) => {

			let txt = error.message;
			log.info("GET /participant/:" + request.params.studyName + ", failed", error.message);
			var fTemplate = fs.readFileSync('404.html', 'utf8');
			response.send(fTemplate);
			response.end;

    });
});

router.get('/consent/:studyName', function(request, response, next) {
	log.info("GET /consent/:" + request.params.studyName + ', requested', request.ip);
	let sURL = appRoot + '/public/data/studies/' + request.params.studyName + '.json'
	//Using Promise with Async\Await 
  let result = fileExistsAsync(sURL).then((resolved) => {

			log.info("GET /consent/:" + request.params.studyName + ", Successful", request.ip);
			response.render('consent', {studyName: request.params.studyName, qs: request.query});
			response.end;

  	}).catch ((error) => {

			let txt = error.message;
			log.info("GET /consent/:" + request.params.studyName + ", failed", error.message);
			var fTemplate = fs.readFileSync('404.html', 'utf8');
			response.send(fTemplate);
			response.end;

    });
});

router.get('/instructions/:studyName', function(request, response, next) {
	log.info("GET /instructions/:" + request.params.studyName + ', requested', request.ip);
	let sURL = appRoot + '/public/data/studies/' + request.params.studyName + '.json'
	//Using Promise with Async\Await 
  let result = fileExistsAsync(sURL).then((resolved) => {

			log.info("GET /instructions/:" + request.params.studyName + ", Successful", request.ip);
			if (request.query.checkConsent === "on") {
				response.render('instructions', {studyName: request.params.studyName, qs: request.query});
			} else {
				//if consent tickbox is off then redirect back to consent
				response.render('consent', {studyName: request.params.studyName, qs: request.query});
			}
			response.end;

  	}).catch ((error) => {

			let txt = error.message;
			log.info("GET /instructions/:" + request.params.studyName + ", failed", error.message);
			var fTemplate = fs.readFileSync('404.html', 'utf8');
			response.send(fTemplate);
			response.end;

    });
});

router.get('/study/:studyName', function(request, response, next) {
	log.info("GET /study/:" + request.params.studyName + ', requested', request.ip);
	let sURL = appRoot + '/public/data/studies/' + request.params.studyName + '.json'
	//Using Promise with Async\Await 
  let result = fileExistsAsync(sURL).then((resolved) => {
	
			if (!request.query.checkConsent === "on") {
				response.render('consent', {studyName: request.params.studyName, qs: request.query});
				response.end;
			}
			if (!request.query.checkInstructions === "on") {
				response.render('instructions', {studyName: request.params.studyName, qs: request.query});
				response.end;
			}

			//checks are ok render the test
			let oInstance = {"studyName": request.params.studyName,
				"PROLIFIC_PID":request.query.PROLIFIC_PID,
				"STUDY_ID": request.query.STUDY_ID,
				"SESSION_ID": request.query.SESSION_ID} 
			response.render('study', {studyName: request.params.studyName, qs: request.query});
			log.info({"instance": oInstance},': study .rendered');
			response.end;

  	}).catch ((error) => {

			let txt = error.message;
			log.info("GET /study/:" + request.params.studyName + ", failed", error.message);
			var fTemplate = fs.readFileSync('404.html', 'utf8');
			response.send(fTemplate);
			response.end;

    });

});

router.post('/results', function(request,response, next) {
  log.info("POST /results/ requested", request.ip);
	try {
		let	studyName = request.body.studyName;
		let participantID = request.body.PROLIFIC_PID;
		let	studyID = request.body.STUDY_ID;
		let sessionID = request.body.SESSION_ID;
		let jsonFileName = appRoot + '/data/results/' + studyName + "_" + participantID + "_" + studyID + "_" + sessionID + '.json';
		let	jsonResult = JSON.stringify(request.body, null, 2);
    
		writeFile = fs.writeFile(jsonFileName, jsonResult, (err) => {
			if (err) {
				throw err;
			}
			//return status 202 accepted to client javascript test.js/updateAnswers
			response.status(202)
			response.end();
		});

	} catch (error) {
		response.render('error', {err: error.message});
		response.end;
	}
});

router.get('/sendCode/:studyName', function(request, response) {
// 	//the purpose of the this route\page is to pass the prolific code to the participant if they have completed 

//declare file URL's
	var resultFileName = appRoot + '/data/results/' + request.params.studyName + "_" +
		request.query.PROLIFIC_PID + "_" +
		request.query.STUDY_ID + "_" +
		request.query.SESSION_ID + ".json";
	var codeFileName = appRoot + '/data/codes/' + request.params.studyName + '_code.json';

try {

	var prolificCode = getProlificCode(resultFileName, codeFileName)
		.then((jsonGetCode) => {
			// the study has been saved and the prolific code retrieved
			response.render('studycomplete', {qs: jsonGetCode});
			log.info("GET /sendCode/:" + request.params.studyName + ', passe code to client: ' + prolificCode);
  		response.end;
	  })
		.catch ((error) => {
			if (error.code === 'ENOENT') {
				// code file is missing, did you delete it?
				log.info("GET /sendCode/:" + request.params.studyName + '_code.json does not exist', request.ip);
				response.render('error', {err: request.params.studyName + '_code does not exist, contact Researcher.'});
				response.end;
			} else {
				// there is a missing file 
				log.info("POST /study/duplicate, failed", error.message);
				response.render('error', {err: error.message});
				response.end;
			}
    });;	
} catch (err) {
	//unhandled exception.
	response.render('error', {err: error.message});
	response.end;
}
});



/// supporting functions

//used with get('/sendCode/:studyName'
async function getProlificCode (sResultURL, sCodeURL) {
// 		//check if the study has been saved first
	try {
  	let resultExists = await fileExists(sResultURL)
		var prolificCodeFile = await readFile (sCodeURL)		
		if (resultExists) {
			return JSON.parse(prolificCodeFile);
		} else {
			return "Result not Recieved, cannot issue Prolific Code!"
		}
	} catch {
		return 'There was a problem with your code';
	}
};
//These functions are used by getProlificCode. 
function fileExists (sURL) {
  return new Promise((resolve, reject) => {
		let fileExists = fs.existsSync(sURL);
		if (fileExists) {
			resolve (fileExists);
		} else {
			reject("File does not exist.");
		}
	});
};
function readFile (sURL) {
	return new Promise((resolve, reject) => {
		fs.readFile(sURL, 'utf8', (err, data) => {
			if (err) {
				reject (err);
				return;
			}
			resolve(data);
		});
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



module.exports = router;