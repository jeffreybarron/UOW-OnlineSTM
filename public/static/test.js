"use strict";
var questionObj = document.getElementById("question");
var answerDIV = document.getElementById("answerDIV");
var answer = document.getElementById("answer");
var startDIV = document.getElementById("startDIV");

//var buttonStart = document.getElementById('buttonStart');
var studyName = document.getElementById("studyName");
var studyID = document.getElementById("STUDY_ID");
var participantID = document.getElementById("PROLIFIC_PID");
var sessionID = document.getElementById("SESSION_ID");
var pageTitle = document.getElementById("pageTitle");
var studyText = document.getElementById("studyText");
var checkConsent = document.getElementById("checkConsent");
var checkInstructions = document.getElementById("checkInstructions");
var oStudyConfig;
var questionBank;
var myTicker;
var questionCounter = 0;
var deckCounter = 0;
var completedStudy = "";
var allDecks = [];
var sampledStimulus = [];

var pageHandler = main();
function main(){
	try {
		var sPathName = window.location.pathname;
		// console.log("sPathName",sPathName);
		var n = sPathName.lastIndexOf("/");
		// console.log(n);
		var sourceURL = sPathName.substring(0, n);
		// console.log("SourceURL:", sourceURL);
		//switch
		switch(sourceURL) {
    		case "/ostm/consent":
		    	//Page 1 - Entry Page from Prolific
		    	//in: Prolific Paramater
		    	//out: Prolific Paramaters, GUID\cookie
		        //console.log("entryPoint/consent Loading");
					loadConsent();
		        break;
		    case "/ostm/instructions":
		    	//Page 2 - Consent Recieved, Study Instructions
		    	//in: GUID\Cookie
		    	//out: GUID\Cookie
		    	//console.log("entryPoint/instructions Loading");
		    	loadInstructions();
		    	break;
		    case "/ostm/study":
		    	//Page 3 - Consent Recieved GUID Created and Study
		    	//in: GUID\Cookie => Studytemplate.json => loadQuestions()
		    	//out: studyresult.json + GUID\Cookie => uploadAnswers(http.POST /results)
		        //console.log("entryPoint/study Loading");
		        loadStudy();
		        break;
		    case "/ostm/results":
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
		};
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
		};
	} catch (err) {
		//alert("No Study ID specified in URL, cannot proceed!");
		setProperties(researcherCopy, err, "","");
		return false;
	}
}
function loadStudy() {
	//load config file
	var studyURL = '/data/studies/' + studyName.getAttribute('value') + '.json';
	//console.log("studyURL: " + studyURL);
	getFile(studyURL).then(function(configFile){
		//console.log("configFile:");
		//console.log(configFile);
		//setup the configFile for this 'game'
		//Take the parameters from the URL and put them in our new studyConfig object
	  var oStudyConfig = configFile;
	  oStudyConfig.PROLIFIC_PID = participantID.getAttribute('value');
	  oStudyConfig.STUDY_ID = studyID.getAttribute('value');
	  oStudyConfig.SESSION_ID = sessionID.getAttribute('value');
		oStudyConfig.checkConsent = checkConsent.getAttribute('value');
		oStudyConfig.checkInstructions = checkInstructions.getAttribute('value');

		//Shuffle the Stimulus Files if needed
		if (oStudyConfig.shuffleDecks === true) {
			oStudyConfig.deckConfiguration = shuffleArray(oStudyConfig.deckConfiguration).splice(0);
			//console.log("shuffled decks");
		}
		//console.log(oStudyConfig);

		//Get the list of Stimulus Files
		let stimulusFiles = [];
		for (let i = 0; i < oStudyConfig.deckConfiguration.length; i++){
			stimulusFiles.push("/data/decks/" + oStudyConfig.deckConfiguration[i].deckName);
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
		let dealersDeck=[];
		//load the samples
		//console.log(allDecks);

		for (let i = 0; i < allDecks.length; i++) {
			sampledStimulus.push(pickStimulus(allDecks[i],
			oStudyConfig.deckConfiguration[i].pickQty,
			oStudyConfig.deckConfiguration[i].sampleMode));
			//console.log("sampledStimulus");
			//console.log(sampledStimulus);

			//load them into a single dealer container to be
			//https://davidwalsh.name/combining-js-arrays
			dealersDeck = sampledStimulus[i].reduce(function(coll, item) {
			  coll.push(item);
			  return coll;
			}, dealersDeck);
			//console.log(dealersDeck);
		}

		//Shuffle the dealersDeck if needed
		if (oStudyConfig.shuffleAll === true) {
			//console.log(dealersDeck);
			dealersDeck = shuffleArray(dealersDeck);
			//console.log(dealersDeck);
		}

		//setup sets in the config file
		let currentStimulus = 0;
		let sumSetSize = oStudyConfig.setSizes.reduce(function (accumulator, currentValue) {
  			return accumulator + currentValue;}, 0);
		//console.log("sumSetSize:" + sumSetSize);

		//for each set
		oStudyConfig["sets"] = [];
		for (let iSetNumber = 0; iSetNumber < oStudyConfig.setSizes.length; iSetNumber++ ){
			//add set frame
			oStudyConfig.sets.push(JSON.parse("{\"set\":[]}"));
			let setSize = oStudyConfig.setSizes[iSetNumber];
			//console.log("\tiSetNumber:" + iSetNumber + ", setSize:" + setSize);

			//console.log(dealersDeck);
			//console.log(oStudyConfig);

			//dish out the number of cards required from the front of the deck
			for (let i = 0; i < setSize; i++ ){
				//push first element of dealersDeck onto the end of config file sets.set
				//console.log("iSetNumber:" + iSetNumber + ", setSize:" + setSize + ", i:" + i);
				oStudyConfig.sets[iSetNumber].set.push(dealersDeck[0]); //because zero is always the front
				dealersDeck.shift(); //remove first element of dealersDeck
			}
			//console.log(dealersDeck);
			//console.log(oStudyConfig);
		}

    //console.log('LoadTime updated');
    //update page Settings
		document.body.style.backgroundColor = oStudyConfig.studybackgroundColor;
		document.body.style.color = oStudyConfig.studyTextColor;
		oStudyConfig.loadTime = getDate();
    startDIV.style.display = "block";
	});
}
function pickStimulus(deck, pickQty, sampleMode) {
	//console.log("PickStimulus Start");
	let privArray = [];
	let mode = sampleMode.toLowerCase();
	//console.log(sampleMode);
	try {
		switch (mode) {
			case "simple":
				/*
				random sample (without replacement)
				Based on Sunter (1977) paper we first shuffle deck then pick 0-to-Qty
				Sunter, A. B. (1977). "List Sequential Sampling with Equal or Unequal
				 Probabilities without Replacement". Applied Statistics. 26 (3). doi:10.2307/2346966.
				 JSTOR 10.2307/2346966
				*/
				deck = shuffleArray(deck);
				//let sampleIndex = getRandomIntInclusive(0,deck.length);
				for (let cardIndex = 0; cardIndex < pickQty; cardIndex++) {
					if (cardIndex > deck.length) { 
						throw "pick quantity exceeds deck length"; 
					}
					privArray.push(deck[cardIndex]);
				}
				break;
			case "replace":
				//random sample (with replacement)
				//theory here is just to do a random pick from the unchanged array as many times as needed
				//the getRandomIntInclusive provides the randomness
				for (let cardIndex = 0; cardIndex < pickQty; cardIndex++) {
					if (cardIndex > deck.length) { 
						throw "pick quantity exceeds deck length"; 
					}
					let rand = getRandomIntInclusive(0,deck.length-1);
					privArray.push(deck[rand]);
				}
				break;
			case "sequential":
				//this is the same as the simple randomsample without the pre-shuffle, so cards are picked sequentially as
				//provided by the deckxx.json file
				for (let cardIndex = 0; cardIndex < pickQty; cardIndex++) {
					if (cardIndex > deck.length) { 
						throw "pick quantity exceeds deck length"; 
					}
					privArray.push(deck[cardIndex]);
				}
				break;
			default :
				throw mode + " sampleMode not recognised. Try simple, replace or sequential";
		}
		return privArray;
	} catch (err) {
		privArray = "[" + err + "]";
		return privArray;
	}
}



function startQuestions(){
	myTicker = setInterval(changeQuestion, oStudyConfig.refreshRateMS);
	startDIV.style.display = "none";
}
function changeQuestion() {
	//console.log(oStudyConfig.sets[deckCounter].set.length);
	if (questionCounter < oStudyConfig.sets[deckCounter].set.length) {
		//console.log(oStudyConfig.sets[deckCounter].set[questionCounter].stimulus);
		setProperties(
			questionObj,
			oStudyConfig.sets[deckCounter].set[questionCounter].stimulus,
			oStudyConfig.sets[deckCounter].set[questionCounter].textColor,
			oStudyConfig.sets[deckCounter].set[questionCounter].backGroundColor);
		questionCounter++;
	} else {
		// clear the text area and stop the ticker
		clearInterval(myTicker);
		setProperties(questionObj,"+", oStudyConfig.studyTextColor, oStudyConfig.studybackgroundColor);
		answerDIV.style.display = "block";
	}
}
function updateAnswers(){
	//console.log("answer:" + answer.name);
	var errLoc = "test.js.updateAnswer, ";
	//console.log(errLoc + 'Bank:' + deckCounter + ", answer.name:" + answer.name);
	if (answer.name < questionCounter) {
		//console.log(errLoc + 'saving: ' + answer.value +' to ' + answer.name + ' questionCounter=' + questionCounter);
		//console.log("deckCounter:" + deckCounter + ", answer.name:" + answer.name + ", answer.value:" + answer.value);
		oStudyConfig.sets[deckCounter].set[answer.name].responseTime = getDate(); //load answer into json
		oStudyConfig.sets[deckCounter].set[answer.name].response = answer.value; //load answer into json
		answer.value = ''; //reset form for next answer
		answer.focus();
		answer.name++; //this is why study.ejs input id=answer, requires name to be 0 and nothing else.

		//console.log(errLoc + 'Bank:' + deckCounter + ', answer.name:' + answer.name);
		if (answer.name == questionCounter){
			//console.log(errLoc + 'we have done all the questions in bank: ' + answer.name);
			//reset question counter for next questionBank and
			//reset answers
			questionCounter = 0;
			answer.name = 0;
			startDIV.style.display = "block";
			answerDIV.style.display = "none";
			deckCounter++;

			//console.log(errLoc + 'Deck:' + deckCounter + ', answer.name:' + answer.name);
			//if we have also reached the last question bank then stop
			if (deckCounter >= oStudyConfig.sets.length){

				setProperties(questionObj,"+", "white", "black");
				answerDIV.style.display = "none";

				//Study is complete return to provider
				//console.log(errLoc + "Study is complete, save data");
				oStudyConfig.saveTime = getDate();

				//Update Page Form
				startDIV.style.display = "none";
				answerDIV.style.display = "none";

				//Write Study Result to Server
				//postData(questionBank);
				var data = JSON.stringify(oStudyConfig, null, 2);
				//console.dir(data);
				let xmlHttp = new XMLHttpRequest;
			    xmlHttp.open("POST", "/ostm/results", true);
			    xmlHttp.setRequestHeader('Content-Type', 'application/json');
			    //Save data to server
			 	try {
					//console.log(data);
					xmlHttp.send(data);
					// console.log("sent now wait");
					xmlHttp.onreadystatechange = function() {
						errLoc = "test.js.updateAnswer, onReadyStateChange, ";
			    	if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
							console.log (errLoc + 'xmlHttp.readyState: ' + xmlHttp.readyState + ', xmlHttp.Status: ' + xmlHttp.status);
							completedStudy = "PROLIFIC_PID=" + oStudyConfig.PROLIFIC_PID + "&" +
		        		"STUDY_ID=" + oStudyConfig.STUDY_ID + "&" +
		        		"SESSION_ID=" + oStudyConfig.SESSION_ID;

				      setProperties(questionObj, "", "white", "black");
					    questionObj.style.display = "none";
							studyText.style.display = "block";
							studyText.outerHTML = "<p>You must click this <a href='/ostm/sendCode/" +
							studyName.getAttribute('value') + "?" + completedStudy + "'>Complete Study</a> link, to complete the study and generate a Prolific.ac completion code.</p>";
						} else {
			      	console.log (errLoc + 'xmlHttp.readyState: ' + xmlHttp.readyState + ', xmlHttp.Status: ' + xmlHttp.status);
			        // alert("Problem saving study:");
			      }
					};
				} catch (err) {
					console.log("error: " + err);
					// alert(errLoc + "There has been a problem saving your study!, Please contact the researcher: " + err);
				}
			}
		}
	}
}


function getFile(url) {
	//https://developers.google.com/web/fundamentals/primers/promises
	//console.log("url:" + url);
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    let req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
				//console.dir(req.response);
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
function shuffleArray(array){
	// modern version of the Fisher–Yates shuffle algorithm:
	var j, x, i;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
}
function setProperties(obj, textValue, textColor, textBackGroundColor){
	//set properties on page
	obj.innerText = textValue;
	//obj.style.color = textColor;
	//obj.style.backgroundColor = textBackGroundColor;
	document.body.style.backgroundColor = textBackGroundColor;
	document.body.style.color = textColor;


	//console.log(obj.id + ": " + textValue);
}
function total(arr) {
  if(!Array.isArray(arr)) return;
  return arr.reduce((a, v)=>a + v);
}
function getDate() {
    var d = new Date();
    return d.YYYYMMDDHHmmSSmsec();
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
Date.prototype.YYYYMMDDHHmmSSmsec = function () {
    var YYYY = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1,2);
    var DD = pad(this.getDate(), 2);
    var HH = pad(this.getHours(), 2);
    var mm = pad(this.getMinutes(), 2);
    var ss = pad(this.getSeconds(), 2);
    var msec = pad(this.getMilliseconds(),4);
    return YYYY + MM + DD + '_' + HH + ":" + mm + ":" +  ss + "." + msec;
};
