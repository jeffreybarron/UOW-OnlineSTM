"use strict";
process.title 		 = 'Online STM';
const http 		     = require('http');
const fs			     = require('fs');
const bodyParser 	 = require('body-parser');
const express 	   = require('express'); //express module
const favicon 	   = require('serve-favicon');
const multer 		   = require('multer');
const sanitizer   = require('express-sanitizer');
const app 		     = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json()); // for parsing application/json
app.use(sanitizer());
app.use((request, response, next) => {
  //Santise Against XSS attack
  //we do this in App.use so every route is protected
  for (var propName in request.query) {
      if (request.query.hasOwnProperty(propName)) {
        request.query[propName] = request.sanitize(request.query[propName]);
      }
  }
  //if necessary we may need to add encoding too
  // for (var propName in request.body) {
  //     if (request.body.hasOwnProperty(propName)) {
  //       request.body[propName] = request.sanitize(request.body[propName]);
  //     }
  // }
  //pass along to the routes.
  next();
});
app.use('/static', express.static('static'));
app.use(favicon(__dirname + '/static/favicon.ico'));
app.use('/data/studies', express.static('data/studies'));
app.use('/data/decks', express.static('data/decks'));

const server = app.listen(3000, function(){
    console.log('server is running at %s .', server.address().port);
});


/********************
*
* Http GET: Page Loads
*
*/
app.get('/', function(request, response) {
	response.render('index');
});

app.get('/preflight', function(request, response) {
	response.render('preflight');
});

app.get('/study/new', function(request, response) {
	console.log("/study/new', Start");

  let files = fs.readdirSync('data/decks/');
  console.dir(files);
  // for (var file in files){
  //   console.log(files[file]);
  // }
  response.render('studyNew', {files: files});


});

app.post('/study/create', function(request, response, next) {
  console.log("/study/create, Start");
  //console.log(request.query);

  try {
    //a rudimentary check, if there are exactly 7 query string objects
    let oStudyConfig = request.body;

    //sanitize Fields, one-by-one becuase they each need a little tweek
    oStudyConfig["studyName"] = request.sanitize(oStudyConfig["studyName"]);
    oStudyConfig["studyTitle"] = request.sanitize(oStudyConfig["studyTitle"]);
    oStudyConfig["consentCopy"] = request.sanitize(oStudyConfig["consentCopy"]);
    oStudyConfig["instructionCopy"] = request.sanitize(oStudyConfig["instructionCopy"]);
    oStudyConfig["studybackgroundColor"] = request.sanitize(oStudyConfig["studybackgroundColor"]);
    oStudyConfig["refreshRateMS"] = parseInt(request.sanitize(oStudyConfig["refreshRateMS"]));
    oStudyConfig["shuffleDecks"] = isTrue(request.sanitize(oStudyConfig["shuffleDecks"]));
    oStudyConfig["shuffleAll"] = isTrue(request.sanitize(oStudyConfig["shuffleAll"]));

    oStudyConfig["completionCode"] = request.sanitize(oStudyConfig["completionCode"]);

    if (fs.existsSync('data/studies/' + request.body.studyName + '.json')) {
      console.log("that file exists");
      response.status(409);
      response.send("File Already Exists");
      response.end();
    } else {

      //Create the completion code file
      //console.log("request.body.completionCode, " + request.body.completionCode);
      let sCompletionFile = '{"completionURL":"https://app.prolific.ac/submissions/complete?cc=","completionCode":"' + request.body.completionCode + '"}'
      sCompletionFile = JSON.parse(sCompletionFile);
      var writeResult = fs.writeFileSync('data/codes/' + oStudyConfig.studyName +
        '_code.json', JSON.stringify(sCompletionFile), function(err) {
  			if(err) {
  				console.log("post('/study/create' Write COmpletionFile Error:" + err);
  				return console.err(err);
  			}
  		});
      delete oStudyConfig["completionCode"];
      //console.log("completiong created");

      //create Conset File
      //console.log(oStudyConfig);
      var writeResult = fs.writeFileSync('data/studies/' + oStudyConfig.studyName + '_consent.html',
        oStudyConfig["consentCopy"], function(err) {
  			  if(err) {
  			    //console.log("post('/study/create' Write ConfigFile Error:" + err);
  				return console.err(err);
  			}
  		});
      delete oStudyConfig["consentCopy"];
      //console.log("config created");

      //create Instruction File
      //console.log(oStudyConfig);
      var writeResult = fs.writeFileSync('data/studies/' + oStudyConfig.studyName + '_instructions.html',
        oStudyConfig["instructionCopy"], function(err) {
  			  if(err) {
  			    //console.log("post('/study/create' Write ConfigFile Error:" + err);
  				return console.err(err);
  			}
  		});
      delete oStudyConfig["instructionCopy"];
      //console.log("config created");


      //console.log(oStudyConfig);
      var writeResult = fs.writeFileSync('data/studies/' + oStudyConfig.studyName +
        '.json', JSON.stringify(oStudyConfig), function(err) {
  			if(err) {
  				//console.log("post('/study/create' Write ConfigFile Error:" + err);
  				return console.err(err);
  			}
  		});
      //console.log("config created");

      response.status(201);
      response.send("File Created");
    }
    // send the response
    // res.send('Your value was sanitized to: ' + req.body.sanitized);

  } catch (err) {
    console.log(err);
    response.status(500);
    response.send(err);
  }

      // 3 create consent File
      // 4 create instructions File
      // 5 how will we add decks.


});




app.post('/logger', function(request, response, next) {
	fs.writeFileSync('data/logs/' + request.body.source + "_" + request.body.time + ".log", JSON.stringify(request.body));
	response.end();
	next();
	console.log("post.logger COMPLETE");
});

app.get('/consent/:studyName', function(request, response, next) {
	console.log(".get('/consent, Start");
	try {
		console.log(".get/consent, try start:");
		if (fs.existsSync('data/studies/' + request.params.studyName + '.json')) {
			console.log(".get/consent, File found");

			//this line loads the consent.ejs template parseing contents of request.query
			console.log(".get/consent, render page");
			response.render('consent', {studyName: request.params.studyName, qs: request.query});
			//console.log(".get/consent, page rendered");

		} else {
			var fTemplate = fs.readFileSync('404.html', 'utf8');
			response.send(fTemplate);
			//console.log(".get/consent, No such File:" + err)
		}
	}
	catch (err) {
		var fTemplate = fs.readFileSync('404.html', 'utf8');
		response.send(fTemplate);
		//console.log(".get/consent. catch err:" + err);
	}
});

app.get('/instructions/:studyName', function(request, response, next) {
	//console.log(".get('/instructions Start");
	try {
		//console.log(".get/consent try start:");
		if (request.query.checkConsent === "on") {
			//console.log(".get('/instructions File found");

			//this line loads the consent.ejs template parseing contents of request.query
			//console.log(".get('/instructions render page");
			response.render('instructions', {studyName: request.params.studyName, qs: request.query});
			//console.log(".get('/instructions, page rendered");

		} else {
			var fTemplate = fs.readFileSync('404.html', 'utf8');
			response.send(fTemplate);
			//console.log(".get('/instructions, No such File:" + err)
		}
	}
	catch (err) {
		var fTemplate = fs.readFileSync('404.html', 'utf8');
		response.send(fTemplate);
		//console.log(".get('/instructions, catch err:" + err);
	}
});

app.get('/study/:studyName', function(request, response, next) {
	console.log("get('/study/:studyName', Start");
	try {
		//console.log("get('/study/:studyName', Try Start");
		var sStudyFile = 'data/studies/' + request.params.studyName + '.json'
		//console.log("get('/study/:studyName', sStudyFile: " + sStudyFile);

		if (fs.existsSync(sStudyFile)) {
			//console.log("get('/study/:studyName', sStudyFile: Exists");
			response.render('study', {studyName: request.params.studyName, qs: request.query});
			//console.log("request.query\r\n" + JSON.stringify(request.query));

			console.log("get('/study/:studyName', study.ejs Rendered");

		} else {
			//console.log("get('/study/:studyName', sStudyFile: Not Found");

			var fTemplate = fs.readFileSync('404.html', 'utf8');
			response.send(fTemplate);
			//console.log("get('/study/:studyName', 404 Response Sent:" + err)
		}
	}
	catch (err) {
		var fTemplate = fs.readFileSync('404.html', 'utf8');
		response.send(fTemplate);
		//console.log("get('/study/:studyName', catch err:" + err);
	}
});




/********************
*
* Http POST: Write Functions
*
*/
app.post('/results', function(request,response, next) {
	//console.log(".post('/results, Start");
	try {
		var	jsonResult = JSON.stringify(request.body, null, 2);
		//console.log(".post('/results, jsonResult:" + jsonResult);
		var	studyName = request.body.studyName;
		var participantID = request.body.PROLIFIC_PID;
		var	studyID = request.body.STUDY_ID;
		var sessionID = request.body.SESSION_ID;
		var resultGUID = request.body.resultGUID; //restulGUID may be redundant if SessionID works

		var jsonFileName = studyName + "_" + participantID + "_" + studyID + "_" + sessionID + '.json';
		//var jsonFileName = studyName + "_" + participantID + "_" + sessionID + "_" + resultGUID'.json';

		//console.log	(".post('/results, jsonFileName:" + jsonFileName);

		var writeResult = fs.writeFileSync('data/results/' + jsonFileName, jsonResult, function(err) {
			if(err) {
				console.log(".post('/results, WriteResult Error:" + err);
				return console.err(err);
			}
		});

		//console.log(".post('/results, getCodeFile=>jsonGetCode");
		var getCodeFile = fs.readFileSync('data/codes/' + studyName + '_code.json', 'utf8');
		var jsonGetCode = JSON.parse(getCodeFile);

		//console.log(".post('/results, response.render=>studyComplete");
		//console.log(".post('/results, completionURL:" + jsonGetCode.completionURL);

	} catch (err) {
		var fTemplate = fs.readFileSync('404.html', 'utf8');
		response.send(fTemplate);
		//console.log(".post('/results, catch err:" + err);

	} finally {
		response.end();
		next();
		// console.log("post.results COMPLETE");

	}
});




app.get('/sendCode/:studyName', function(request, response) {
	var errLocation = "get.sendCode/:studyName', "
	//the purpose of the this route\page is to collect the completion URL
	try {
		// console.log(errLocation + "studyName: " + request.params.studyName);
		// console.log(errLocation + "PROLIFIC_PID: " + request.query.PROLIFIC_PID);
		// console.log(errLocation + "STUDY_ID: " + request.query.STUDY_ID);
		// console.log(errLocation + "SESSION_ID: " + request.query.SESSION_ID);

		//check if the study has been saved first
		var resultFileName = 'data/results/' + request.params.studyName + "_" +
			request.query.PROLIFIC_PID + "_" +
			request.query.STUDY_ID + "_" +
			request.query.SESSION_ID + ".json";

		if (fs.existsSync(resultFileName)) {
			// console.log(errLocation + " resultFileName FOUND: " + resultFileName);
			//in that case we can load the completion code from the _code.json file
			var codeFileName = "data/codes/" + request.params.studyName + "_code.json"
			// console.log(errLocation + " codeFileName: " + codeFileName);
			if (fs.existsSync(codeFileName)) {
				var getCodeFile = fs.readFileSync(codeFileName, 'utf8');
				var jsonGetCode = JSON.parse(getCodeFile);

				//studyName: request.params.studyName, qs: request.query
				response.render('studycomplete', {qs: jsonGetCode});
				// console.log(errLocation + " COMPLETE:" + getDate());
				return true;
			} else {
				throw errLocation + " codeFileName NOT FOUND: " + resultFileName;
			}
		} else {
			throw errLocation + " resultFileName NOT FOUND: " + resultFileName;
		}
	}
	catch (err) {
		//console.log("/sendCode, try and Catch");
		//var errFile = fs.readFileSync('404.html', 'utf8');
		response.render('404', {qs: {"err":err}});
		// console.log(errLocation + " (404) " + err);
		return false;
	}
});

app.get('*', function(request, response) {
	/*
	Catchall all other routes
	this route is placed last in the code, so it is read last.
	if it is placed before any other routes those routes wont be handled
	*/
	var readStudy = fs.readFileSync('404.html', 'utf8');
	response.send(readStudy);

	var sLog = getDate() + ", source:" + request.ip + ", URL:" + request.originalUrl
	// console.log(".get('*', UnhandledPageCalls: " + sLog);

	fs.appendFile('data/logs/UnhandledPageCalls.log', sLog + "\r\n", function (err) {
	  if (err) throw err;
	});


});



/********************
*
* PRIVATE Functions
*
*/
function getGUID() {
	// then to call it, plus stitch in '4' in the third group
	var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
	return guid;
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function getDate() {
    var d = new Date();
    return d.YYYYMMDDHHMMSS()
}

function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

Date.prototype.YYYYMMDDHHMMSS = function () {
    var yyyy = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1,2);
    var dd = pad(this.getDate(), 2);
    var hh = pad(this.getHours(), 2);
    var mm = pad(this.getMinutes(), 2)
    var ss = pad(this.getSeconds(), 2)
    return yyyy + MM + dd + '_' + hh + mm + ss;
};
function isTrue(value){
		console.log("See" + value)
		//convert values to boolean type
		if (typeof(value) === 'string'){
        value = value.trim().toLowerCase();
    }
    switch(value){
        case true:
        case "true":
        case 1:
        case "1":
        case "on":
        case "yes":
            return true;
        default:
            return false;
    }
}
