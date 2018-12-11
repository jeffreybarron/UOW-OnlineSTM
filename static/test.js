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
var checkConsent = document.getElementById("checkConsent");
var checkInstructions = document.getElementById("checkInstructions");
//var xmlHttp = new XMLHttpRequest;
var oStudyConfig; 
var studyDecks; //the source decks are sampled based on studyConfig and held here

var questionBank; // instantiate global array variable
var myTicker; // Instantiate global ticker variable
var questionCounter = 0;
var deckCounter = 0;
var completedStudy = "";
var resultGUID = ""
var allDecks = [];
var sampledStimulus = [];
const randomSample = {
  false: "false", //Sequential Pick
  simple: "simple", //picked at random from remaining array
  replacement: "replacement", //picked at random with replacement
};
const shuffleMode = {
	false: "false", // No Shuffle
	decks: "decks", // shuffle the order of the decks, not the cards in the decks
	all: "all" // shuffle all the card\stimulus between decks
}

var pageHandler = main(); 


function main(){
	try {
		var sPathName = window.location.pathname;
		var n = sPathName.indexOf("/",1);
		var sourceURL = sPathName.substring(0, n);

		//switch 
		switch(sourceURL) {
   			case "/":
   				//Sending Users Back to Prolific in 5000ms, nothing to load.
        		//console.log("entryPoint/ Loading.");
        		break;
    		case "/consent":
		    	//Page 1 - Entry Page from Prolific
		    	//in: Prolific Paramater
		    	//out: Prolific Paramaters, GUID\cookie
		        //console.log("entryPoint/consent Loading");
		    	loadConsent();

		        break;
		    case "/instructions":
		    	//Page 2 - Consent Recieved, Study Instructions
		    	//in: GUID\Cookie
		    	//out: GUID\Cookie
		    	//console.log("entryPoint/instructions Loading");
		    	loadInstructions();
		    	break;
		    case "/study":
		    	//Page 3 - Consent Recieved GUID Created and Study
		    	//in: GUID\Cookie => Studytemplate.json => loadQuestions()
		    	//out: studyresult.json + GUID\Cookie => uploadAnswers(http.POST /results)
		        //console.log("entryPoint/study Loading");
	
		        loadStudy();
		        break;
		    case "/results":
		    	//Page 
		        //console.log("entryPoint/results Loading");
		        break;
		    default:
		        //console.log("I have never heard of that fruit...");
		}
	} catch (err) {
		console.log("loadPage Error: " + err);

	} finally {
		//console.log("loadPage COMPLETE");
	}
}


function loadStudy() {
	
	//load config file
	var studyURL = '/data/studies/' + studyName.getAttribute('value') + '.json' 
	//console.log("studyURL: " + studyURL);
	getFile(studyURL).then(function(configFile){
		//console.log("configFile:");
		//console.log(configFile);
		//setup the configFile for this 'game'
			//Take the parameters from the URL and put them in our new studyConfig object
	        oStudyConfig = configFile
	        oStudyConfig.PROLIFIC_PID = participantID.getAttribute('value');
	        oStudyConfig.STUDY_ID = studyID.getAttribute('value');
	        oStudyConfig.SESSION_ID = sessionID.getAttribute('value');
			oStudyConfig.loadTime = getDate();
			oStudyConfig.checkConsent = checkConsent.getAttribute('value');
			oStudyConfig.checkInstructions = checkInstructions.getAttribute('value');

			//Shuffle the Stimulus Files if needed
			if (oStudyConfig.shuffleDecks === true) {
				oStudyConfig.deckConfiguration = shuffleArray(oStudyConfig.deckConfiguration).splice(0);
				console.log("shuffled decks");
			}
			//console.log(oStudyConfig);


			//Get the list of Stimulus Files
			let stimulusFiles = [];
			for (let i = 0; i < oStudyConfig.deckConfiguration.length; i++){
				stimulusFiles.push("/data/studies/" + oStudyConfig.deckConfiguration[i].deckName + ".json");
			}
			//console.log("stimulusFiles");
			//console.log(stimulusFiles);

		// Take an array of promises and wait on them all
		return Promise.all(
			// Map our array of chapter urls to
	    	// an array of chapter json promises
	    	stimulusFiles.map(getFile)
	  	);
	}).then(function(deckList) {
		//console.log("The DeckList");
		//console.log(deckList);
		
		// Now we have the decks from the Config File order! Loop through…
		deckList.forEach(function(deck) {
		   	//At this point Im just going to add all decks to an allDecks object, so I 
	    	//can use it once everything is loaded.
	    	allDecks.push(deck);
	    		    	
	  	});
	}).catch(function(err) {
	  // catch any error that happened so far
	  //console.log("Argh, broken: " + err.message);
	}).then(function() {
		//load the samples
		//console.log(allDecks);
		for (let i = 0; i < allDecks.length; i++) {
			sampledStimulus.push(pickStimulus(allDecks[i], 
				oStudyConfig.deckConfiguration[i].pickQty, 
				oStudyConfig.deckConfiguration[i].sampleMode));
			//console.log("sampledStimulus");			
			//console.log(sampledStimulus);
		}
	})

}

function pickStimulus(deck, pickQty, sampleMode) {
	//console.log("PickStimulus Start");
	let privArray = [];
	let mode = sampleMode.toLowerCase();
	//console.log(sampleMode);

	try {
		switch (mode) {
			case "simple": 
				//random sample (without replacement)
				//Sunter, A. B. (1977). "List Sequential Sampling with Equal or Unequal Probabilities without Replacement". Applied Statistics. 26 (3). doi:10.2307/2346966. JSTOR 10.2307/2346966
				//based on Sunter paper we first shuffle deck then pick 0-to-Qty  
				deck = shuffleArray(deck);
				//let sampleIndex = getRandomIntInclusive(0,deck.length);
				for (let cardIndex = 0; cardIndex < pickQty; cardIndex++) {
					if (cardIndex > deck.length) { throw "pick quantity exceeds deck length" }
					privArray.push(deck[cardIndex]);
				}
				break;
			case "replace": 
				//random sample (with replacement)
				//theory here is just to do a random pick from the unchanged array as many times as needed
				//the getRandomIntInclusive provides the randomness
				for (let cardIndex = 0; cardIndex < pickQty; cardIndex++) {
					if (cardIndex > deck.length) { throw "pick quantity exceeds deck length" }
					let rand = getRandomIntInclusive(0,deck.length-1)
					privArray.push(deck[rand]);
				}
				break;
			case "sequential":
				//this is the same as the simple randomsample without the pre-shuffle, so cards are picked sequentially as 
				//provided by the deckxx.json file
				for (let cardIndex = 0; cardIndex < pickQty; cardIndex++) {
					if (cardIndex > deck.length) { throw "pick quantity exceeds deck length" }
					privArray.push(deck[cardIndex]);
				}
				break;
			default :
				throw mode + " sampleMode not recognised. Try simple, replace or sequential"
		}

		return privArray;

	} catch (err) {
		privArray = "[" + err + "]"; 
		return privArray
	}
}


//https://developers.google.com/web/fundamentals/primers/promises
function getFile(url) {
  //console.log("url:" + url);
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(JSON.parse(req.response));
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };
    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    // Make the request
    req.send();
  });
}





/*
function loadStudy() {
	try {
		//We know the study exist, now load the studyConfig.
		var xmlHttp = new XMLHttpRequest;
		xmlHttp.open('GET', '/data/studies/' + studyName.getAttribute('value') + '.json', true);
		xmlHttp.send();
		xmlHttp.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {

		    	//load studyConfig object
		        oStudyConfig = JSON.parse(this.responseText);
				
				//Take the parameters from the URL and put them in our new studyConfig object
		        oStudyConfig[0].parameters.PROLIFIC_PID = participantID.getAttribute('value');
		        oStudyConfig[0].parameters.STUDY_ID = studyID.getAttribute('value');
		        oStudyConfig[0].parameters.SESSION_ID = sessionID.getAttribute('value');
				oStudyConfig[0].parameters.loadTime = getDate();
				oStudyConfig[0].parameters.consent = consent.getAttribute('value');
				oStudyConfig[0].parameters.trainingComplete = trainingComplete.getAttribute('value');

				//console.log("loadStudy, LoadDecks List: " + JSON.stringify(oStudyConfig[1].decks));
				loadDecks(oStudyConfig[1].decks);


		        //shuffle according to paramaters on file
		        var result = shuffleTemplate(); 
		        

		        //console.log('LoadTime updated');
		        //update page Settings
		        setProperties(pageTitle, oStudyConfig[0].parameters.studyTitle, "","");
		        setProperties(studyText, oStudyConfig[0].parameters.studyText, oStudyConfig[0].parameters.studyTextColor, oStudyConfig[0].parameters.studybackgroundColor);
			};
			return true;
		} 
	} catch (err) {
		//alert("No Study ID specified in URL, cannot proceed!");
		setProperties(pageTitle, err, "","");
		return false;
		
	}
}
*/






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
	console.log(errLoc + 'Bank:' + deckCounter + ", answer.name:" + answer.name);
	if (answer.name < questionCounter) {
		console.log(errLoc + 'saving: ' + answer.value +' to ' + answer.name + ' questionCounter=' + questionCounter);
		
		questionBank[1].decks[deckCounter].questions[answer.name].answer = answer.value; //load answer into json
		answer.value = ''; //reset form for next answer
		answer.focus()
		answer.name++; //this is why study.ejs input id=answer, requires name to be 0 and nothing else.

		console.log(errLoc + 'Bank:' + deckCounter + ', answer.name:' + answer.name);
		if (answer.name == questionCounter){
			console.log(errLoc + 'we have done all the questions in bank: ' + answer.name);
			//reset question counter for next questionBank and 
			//reset answers
			questionCounter = 0;
			answer.name = 0;
			buttonStart.style.visibility = "visible";
			answerObj.style.visibility = "hidden";
			deckCounter++;
			
			console.log(errLoc + 'Deck:' + deckCounter + ', answer.name:' + answer.name);
			//if we have also reached the last question bank then stop
			if (deckCounter >= questionBank[1].decks.length){

				setProperties(questionObj,"+", "Black", "White");
				answerObj.style.visibility = "hidden";

				//Study is complete return to provider
				console.log(errLoc + "Study is complete, save data");
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
				            console.log (errLoc + 'readystate 4 data: ' + data);
				            console.log(errLoc + "Page Title: " + document.getElementById("pageTitle").innerText);
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
				        	console.log (errLoc + 'xmlHttp.readyState: ' + xmlHttp.readyState + ', xmlHttp.Status: ' + xmlHttp.status);
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



function startQuestions(){
	myTicker = setInterval(changeQuestion, questionBank.refreshRateMS);
	buttonStart.style.visibility = "hidden";
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



function setProperties(obj, textValue, textColor, textBackGroundColor){
	//set properties on page
	obj.innerText = textValue;
	obj.style.color = textColor;
	obj.style.backgroundColor = textBackGroundColor;
	//console.log(obj.id + ": " + textValue);
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
function getRandomIntInclusive(min, max) {
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}
function getGUID() {
	// then to call it, plus stitch in '4' in the third group
	var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
	return guid;
}
function S4() {
    //work out what this does again
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
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



function loadInstructions() {
	try {
		let xmlHttp = new XMLHttpRequest;
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
		//console.log("test.js.loadConsent, studyID: " + studyName.getAttribute('value'))
		let xmlHttp = new XMLHttpRequest;
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