// routes/lab/index.js

// create another router for getting 'product' resources
const express 	    = require('express'); //express module
const router        = express.Router();
// const http 		      = require('http');
const bodyParser 	  = require('body-parser');
// const sanitizeHtml  = require('sanitize-html');
const sanitizer     = require('express-sanitizer');
// const favicon 	    = require('serve-favicon');
const fs			      = require('fs');


router.use('/static', express.static('public/static'));
router.use('/data/studies', express.static('public/data/studies'));
router.use('/data/decks', express.static('public/data/decks'));
router.use('/data/codes', express.static('data/codes'));

router.use(bodyParser.json()); // for parsing application/json
router.use(sanitizer());



router.get('/participant/:studyName', function(request, response, next) {
  console.log("get participant");
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
	try {
		if (fs.existsSync(appRoot + '/data/studies/' + request.params.studyName + '.json')) {
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
	try {
		if (request.query.checkConsent === "on") {
			response.render('instructions', {studyName: request.params.studyName, qs: request.query});
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

router.get('/study/:studyName', function(request, response, next) {
	try {
		var sStudyFile = appRoot + '/data/studies/' + request.params.studyName + '.json'
		if (fs.existsSync(sStudyFile)) {
			response.render('study', {studyName: request.params.studyName, qs: request.query});
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

router.post('/results', function(request,response, next) {
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
