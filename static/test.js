"use strict";
var questionObj = document.getElementById("question");
var answerObj = document.getElementById("answers");
var buttonStart = document.getElementById('buttonStart');
//var answerform = document.getElementById("form_answers");
var studyName = document.getElementById("studyName");
var studyID = document.getElementById("STUDY_ID");
var participantID = document.getElementById("PROLIFIC_PID");
var sessionID = document.getElementById("SESSION_ID");
var pageTitle = document.getElementById("pageTitle");
var studyText = document.getElementById("studyText");
var consent = document.getElementById("consent");
var trainingComplete = document.getElementById("trainingComplete");
var xmlHttp = new XMLHttpRequest;

var questionBank; // instantiate global array variable
var myTicker; // Instantiate global ticker variable
var questionCounter = 0;
var deckCounter = 0;
var completedStudy = "";
var resultGUID = ""



function changeQuestion() {
	if (questionCounter < questionBank[1].decks[deckCounter].questions.length) {
		setProperties( 
			questionObj,
			questionBank[1].decks[deckCounter].questions[questionCounter].question, 
			questionBank[1].decks[deckCounter].questions[questionCounter].textColor,
			questionBank[1].decks[deckCounter].questions[questionCounter].backGroundColor);
		questionCounter++;
	} else {
		// clear the text area and stop the ticker
		clearInterval(myTicker);		
		setProperties(questionObj,"+", "Black", "White");
		answerObj.style.visibility = "visible";
	}
}

function updateAnswers(){
	var errLoc = "test.js.updateAnswer, " 
	//console.log(errLoc + 'Bank:' + deckCounter + ", answer.name:" + answer.name);
	if (answer.name < questionCounter) {
		//console.log(errLoc + 'saving: ' + answer.value +' to ' + answer.name + ' questionCounter=' + questionCounter);
		
		questionBank[1].decks[deckCounter].questions[answer.name].answer = answer.value; //load answer into json
		answer.value = ''; //reset form for next answer
		answer.focus()
		answer.name++; //this is why study.ejs input id=answer, requires name to be 0 and nothing else.

		console.log(errLoc + 'Bank:' + deckCounter + ', answer.name:' + answer.name);
		if (answer.name == questionCounter){
			//console.log(errLoc + 'we have done all the questions in bank: ' + answer.name);
			//reset question counter for next questionBank and 
			//reset answers
			questionCounter = 0;
			answer.name = 0;
			buttonStart.style.visibility = "visible";
			answerObj.style.visibility = "hidden";
			deckCounter++;
			
			//console.log(errLoc + 'Deck:' + deckCounter + ', answer.name:' + answer.name);
			//if we have also reached the last question bank then stop
			if (deckCounter >= questionBank[1].decks.length){

				setProperties(questionObj,"+", "Black", "White");
				answerObj.style.visibility = "hidden";

				//Study is complete return to provider
				//console.log(errLoc + "Study is complete, save data");
				questionBank[0].parameters.saveTime = getDate();
				questionBank[0].parameters.resultGUID = getGUID();
		        
				//Update Page Form
				buttonStart.style.visibility = "hidden";
				answerObj.style.visibility = "hidden";
				
				//Write Study Result to Server
				//postData(questionBank);
				var data = JSON.stringify(questionBank, null, 2);
			    xmlHttp.open("POST", "/results", true);
			    xmlHttp.setRequestHeader('Content-Type', 'application/json');
			    //Save data to server
			 	try {
					xmlHttp.send(data);
					xmlHttp.onreadystatechange = function() {
					    if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				            //console.log (errLoc + 'readystate 4 data: ' + data);
				            //console.log(errLoc + "Page Title: " + document.getElementById("pageTitle").innerText);
				        	completedStudy = "PROLIFIC_PID=" + questionBank[0].parameters.PROLIFIC_PID + "&" + 
				        		"STUDY_ID=" + questionBank[0].parameters.STUDY_ID + "&" + 
				        		"SESSION_ID=" + questionBank[0].parameters.SESSION_ID; //+ "&" + 
				        		//"resultGUID=" + questionBank[0].parameters.resultGUID;

							setProperties(pageTitle, "UOW Online STM","Black", "White");
							//setProperties(studyText, "The study is complete", "Black", "White")
				        	setProperties(questionObj, "+","Black", "White");
					    	questionObj.style.visibility = "hidden";

							studyText.outerHTML = "You have finished. You must </br>click this link to generate study completion code:" +
								" <a href='/sendCode/"+ studyName.getAttribute('value') + "?" + completedStudy + "'>Complete Study</a>" 


				        } else {
				        	//console.log (errLoc + 'xmlHttp.readyState: ' + xmlHttp.readyState + ', xmlHttp.Status: ' + xmlHttp.status);
				         	setProperties(studyText, "Saving study, please wait...","Black", "White");   
				        }
					}
				}
				catch (err) {
					//console.log("error: " + err);
					setProperties(questionObj, "There has been a problem saving your study!!!","Black", "White");
				}
			}
		}
	}
}

function sendCode(){
	//now check the study is recorded and display completion code
	//resultGUID is used so previous results cannot be guessed.
	//console.log("Study answer File: " + completedStudy);
	xmlHttp.open('GET', '/complete/' + completedStudy, true);
	xmlHttp.setRequestHeader('Content-Type', 'text/html');
	xmlHttp.send();
	xmlHttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
	   		//console.log("Get ready status 4");
			return true;
	   	} else {
	   		//console.log ("not yet");
	   	}
	};
}


function setProperties(obj, textValue, textColor, textBackGroundColor){
	obj.innerText = textValue;
	obj.style.color = textColor;
	obj.style.backgroundColor = textBackGroundColor;
	//console.log(obj.id + ": " + textValue);
}

function shuffleTemplate (err) {
	//shuffle paramater takes three possible values
	//full, deck, questions
	var i;
	
	try {
		if (questionBank[0].parameters.shuffleFull === "true"){
			shuffleFullArray();
			//alert('full shuffle ended:');
		} 
		if (questionBank[0].parameters.shuffleDecks === "true"){
			//shuffle decks
			shuffleArray(questionBank[1].decks);
		} 
		if (questionBank[0].parameters.shuffleQuestions === "true"){
			//shuffle questions in all decks
			for (i = 0; i < questionBank[1].decks.length ; i++) {
				shuffleArray(questionBank[1].decks[i].questions);
			};
		}
	}
	catch (err) {
		//console.log('ShuffleTemplat: ' + err);
		return false;
	}
	return true;
}

function shuffleArray(array){
// modern version of the Fisher–Yates shuffle algorithm:
/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
    var j, x, i;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
}

function shuffleFullArray(){
	//assumes all decks are equal length ;)
	//then do this custom shuffle.

	var newDeck, newQuestion, deck;
	var deckLength = questionBank[1].decks.length;
	var questionsLength = questionBank[1].decks[0].questions.length;
	var i = 0; 

   	try {
		//alert('try block start');
		//check deck lengths, if unequal throw error
		if (compareDecks(questionBank[1].decks) === false) { 
			//alert('compare decks is false');
			throw "Decks must be equal in size if shuffleFull is true"; 
		}

		//alert('start loops');
		for (deck = 0; deck < deckLength; deck++) {
			for (quest = 0; quest < questionsLength; quest++) {
				newDeck = Math.floor(Math.random() * (deckLength));
		  	  	newQuestion = Math.floor(Math.random() * (questionsLength));

		        //store the question A 
		        //alert('store A');
		        holdQuest = questionBank[1].decks[deck].questions[quest];
		        
		        // write question B to Location A 
		       	//alert('write B');
		        questionBank[1].decks[deck].questions[quest] = questionBank[1].decks[newDeck].questions[newQuestion];
		   
		        //now write stored question A to Location B
		        //alert('write hold');
		        questionBank[1].decks[newDeck].questions[newQuestion] = holdQuest;
		   
				//console.log(i++ + ', quest: ' + quest + ', deck: ' + deck);
		    }
		}
	}
 	catch (err) {
   		//console.log('ShuffleFullArray Failed:');
   		//console.log(err);
   		throw err;
   	}
    return true;
}

function compareDecks(arr){
	var deckCount = arr.length;
	var deckLengths = [];
	var i;

	for (i=0; i < arr.length; i++ ){
		deckLengths.push(arr[i].questions.length);
	}
	if (total(deckLengths) === deckLengths.length * deckLengths[0]) {
		// sum of question and product of questions in one deck and num decks is equal
		return true;
	} else {
		return false;
	}
}

function total(arr) {
  if(!Array.isArray(arr)) return;
  return arr.reduce((a, v)=>a + v);
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

function getGUID() {
	// then to call it, plus stitch in '4' in the third group
	var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
	return guid;
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}

function Logger(sSource,sLevel,sMessage){
	//put code in here to output combined logs to results file.
	// use try catch and throw to around all functions and finally make sure you 
	//figure out how to enable this in degub mode only.
	var data = '{"source":"", "level":"", "message":"", "time":""}';
	data = JSON.parse(data); //turn the string into an JSON object to work with
	data.source = sSource.toString();
	data.level = sLevel.toString();
	data.message = sMessage.toString();
	data.time = getDate();
	data = JSON.stringify(data); //turn the JSON object into a string to parse via AJAX
	//console.log(data);
	xmlHttp.open('POST', '/logger', true);
	xmlHttp.setRequestHeader('Content-Type', 'application/json');
	xmlHttp.send(data);
	xmlHttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
	   		//console.log("Get ready status 4");
			return true;
	   	}
	};
	return true;
}

function startQuestions(){
	myTicker = setInterval(changeQuestion, questionBank[0].parameters.refreshRateMS);
	buttonStart.style.visibility = "hidden";
}

Date.prototype.YYYYMMDDHHMMSS = function () {
    var yyyy = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1,2);
    var dd = pad(this.getDate(), 2);
    var hh = pad(this.getHours(), 2);
    var mm = pad(this.getMinutes(), 2)
    var ss = pad(this.getSeconds(), 2)

    return yyyy + MM + dd + '_' + hh + mm + ss;
}



function loadQuestions() {
	try {
		xmlHttp.open('GET', '/data/studies/' + studyName.getAttribute('value') + '.json', true);
		xmlHttp.send();
		xmlHttp.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		        questionBank = JSON.parse(this.responseText);
		        //shuffle according to paramaters on file
		        var result = shuffleTemplate(); 
		        //console.log("STUDY_ID: " + studyID.getAttribute('value') + " loaded and shuffled.");
		        //console.log("participantID: " + participantID.getAttribute('value'));
		        //console.log("sessionID: " + sessionID.getAttribute('value'));
		        //update the Results Object for output.
		        questionBank[0].parameters.PROLIFIC_PID = participantID.getAttribute('value');
		        questionBank[0].parameters.STUDY_ID = studyID.getAttribute('value');
		        questionBank[0].parameters.SESSION_ID = sessionID.getAttribute('value');
				questionBank[0].parameters.loadTime = getDate();
				questionBank[0].parameters.consent = consent.getAttribute('value');
				questionBank[0].parameters.trainingComplete = trainingComplete.getAttribute('value');


		        //console.log('LoadTime updated');
		        //update page Settings
		        setProperties(pageTitle, questionBank[0].parameters.studyTitle, "","");
		        setProperties(studyText, questionBank[0].parameters.studyText, questionBank[0].parameters.studyTextColor, questionBank[0].parameters.studybackgroundColor);
			};
			return true;
		} 
	} catch (err) {
		//alert("No Study ID specified in URL, cannot proceed!");
		setProperties(pageTitle, err, "","");
		return false;
		
	}
}

function loadInstructions() {
	try {
		xmlHttp.open('GET', '/data/studies/' + studyName.getAttribute('value') + '_instructions.html', true);
		xmlHttp.setRequestHeader('Content-Type', 'text/html');
		xmlHttp.send();
		xmlHttp.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		    	var researcherCopy = document.getElementById("researcherCopy");
		    	researcherCopy.innerHTML = this.responseText;
		    }
		} 
	} catch (err) {
		//alert("No Study ID specified in URL, cannot proceed!");
		setProperties(researcherCopy, err, "","");
		return false;
	}
}

function loadConsent() {
	try {
		console.log("test.js.loadConsent, studyID: " + studyName.getAttribute('value'))
		xmlHttp.open('GET', '/data/studies/' + studyName.getAttribute('value') + '_consent.html', true);
		xmlHttp.setRequestHeader('Content-Type', 'text/html');
		xmlHttp.send();
		xmlHttp.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		        var researcherCopy = document.getElementById("researcherCopy");
		        researcherCopy.innerHTML = this.responseText;
		    }
		} 
	} catch (err) {
		//alert("No Study ID specified in URL, cannot proceed!");
		setProperties(researcherCopy, err, "","");
		return false;
	}
}

function entryPoint(){
	try {
	
		/*
		so this is no longer good enough.. I need to extract final part of the part before ?
		and before the pathname to see which page we are loading.
		find the last / in pathname and then get everything before it

		note: this function is called every ~750millisconds so make it efficient
		*/

		var sPathName = window.location.pathname;
		var n = sPathName.indexOf("/",1);
		var sourceURL = sPathName.substring(0, n);

		//console.log("href: " + window.location.href);
		//console.log("pathname: " + window.location.pathname);
		//console.log("sourceURL: " + sourceURL);
		
		//switch 
		switch(sourceURL) {
   			case "/":
   				//Sending Users Back to Prolific in 5000ms, nothing to load.
        		//console.log("Home Page Loaded.");
        		break;
    		case "/consent":
		    	//Page 1 - Entry Page from Prolific
		    	//in: Prolific Paramater
		    	//out: Prolific Paramaters, GUID\cookie
		        //console.log("ConsentPage Loading");
		    	loadConsent();

		        break;
		    case "/instructions":
		    	//Page 2 - Consent Recieved, Study Instructions
		    	//in: GUID\Cookie
		    	//out: GUID\Cookie
		    	//console.log("Instructions Loading");
		    	loadInstructions();
		    	break;
		    case "/study":
		    	//Page 3 - Consent Recieved GUID Created and Study
		    	//in: GUID\Cookie => Studytemplate.json => loadQuestions()
		    	//out: studyresult.json + GUID\Cookie => uploadAnswers(http.POST /results)
		      //  console.log("StudyPage Loaded");
		        loadQuestions();
		        break;
		    case "/results":
		    	//Page 
		        //console.log("Results Posted");
		        break;
		    case "/sendCode":

		        //console.log("sendCode Posted");
		        break;
		    default:
		        //console.log("I have never heard of that fruit...");
		}
	} catch (err) {
		console.log("loadPage Error: " + err);

	} finally {
		console.log("loadPage COMPLETE");
	}
}

/**************************
* Sequetial code
*/
//Set opening question.
//setProperties("Begin.","Black", "White");

// load array
//var loadResult = loadQuestions(); //check every 10 milliseconds

var pageHandler = entryPoint(); 
