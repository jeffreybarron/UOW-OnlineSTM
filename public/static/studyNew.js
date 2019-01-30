"use strict";
//DOC Elements by ID
var studyForm = document.getElementById("studyForm");
var buttonCreate = document.getElementById("buttonCreate");
var studyName = document.getElementById("studyName");
var consentCopy = document.getElementById("consentCopy");
var instructionCopy = document.getElementById("instructionCopy");
var studybackgroundColor = document.getElementById("studybackgroundColor");
var studyTextColor = document.getElementById("studyTextColor");
var refreshRateMS = document.getElementById("refreshRateMS");
var setSizes = document.getElementById("setSizes");
var completionCode = document.getElementById("completionCode");
var msgResult = document.getElementById("msgResult");


//JScript Variables
var oStudyConfig = {};

//prefer this is the only syncronus call in the File, this runs
//when createStudy.js is run say using <Script>
var pageHandler = main();

function main(){
	//Im not doing anything on page load, so Im just leaving this blank
	try {
		//switch
    // console.log("createStudy, main()")
  } catch (err) {
		// console.log("loadPage Error: " + err);
	} finally {
    // console.log("createStudy load COMPLETE");
	}
}

function createStudy() {
	try {
		//console.log("createStudy() Started");
	  oStudyConfig["studyName"] = rejectBlanks(studyName);
	  oStudyConfig["studybackgroundColor"] = rejectBlanks(studybackgroundColor);
	  oStudyConfig["studyTextColor"] = rejectBlanks(studyTextColor);
		oStudyConfig["setSizes"] = cleanSetsArray(rejectBlanks(setSizes));
		oStudyConfig["deckConfiguration"] = getDeckArray(studyForm,oStudyConfig["setSizes"]);
	  oStudyConfig["shuffleDecks"] = isTrue(getRadioValue(document.getElementById('studyForm'), 'shuffleDecks' ));
	  oStudyConfig["shuffleAll"] = isTrue(getRadioValue(document.getElementById('studyForm'), 'shuffleAll' ));
		oStudyConfig["refreshRateMS"] = parseInt(rejectBlanks(refreshRateMS));
		oStudyConfig["consentCopy"] = rejectBlanks(consentCopy);
	  oStudyConfig["instructionCopy"] = rejectBlanks(instructionCopy);
		oStudyConfig["completionCode"] = rejectBlanks(completionCode);

	  //3- build query stringify, ie custom serialize
		// console.dir(oStudyConfig);
		let created = false;
		created = studyPOST(oStudyConfig);

	  //encode string
	  //4- Post and direct to new pageTitle

		return created;

	} catch (err) {
		alert("createStudy ERROR: " + err);
		return false;
	}

}

function studyPOST(oStudyConfig) {
  try {
	  let errMsg = "studyPOST, start";
	  let data = JSON.stringify(oStudyConfig, null, 2);
		let sPath = "create";
		let xmlHttp = new XMLHttpRequest;
    xmlHttp.open("POST", sPath, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    //Save data to server

     // console.log(errMsg + "try ", data);
    xmlHttp.send(data);
     // console.log("sent now wait");
    xmlHttp.onreadystatechange = function() {
      errMsg = "studyPOST, onReadyStateChange, ";
      if (xmlHttp.readyState == 4 && xmlHttp.status == 201) {
				// alert("Study Created!\n\nWe suggest you, click ok, and leave this page open until you've finished setting up.");
				msgResult.innerHTML = '<p>Study Created!</><p>We suggest you:<ul><li>leave this page open</li><li>open a new browser tab</li><li>Do any other setup on the new tab</li></ul></p>';
        msgResult.style.display = "block";
        msgResult.className = "msgResult-success";
				return true;
			} else if (xmlHttp.readyState == 4 && xmlHttp.status == 404){
				// alert("A required file on the server was not found, contact your supervisor");
				msgResult.innerHTML = '<p>A required file on the server was not found, contact your supervisor</p>';
				msgResult.style.display = "block";
				msgResult.className = "msgResult-error";
				return false;
			} else if (xmlHttp.readyState == 4 && xmlHttp.status == 409){
				// alert("You must choose another studyName, this one is already in use");
				msgResult.innerHTML = '<p>You must choose another studyName, this one is already in use</p>';
				msgResult.style.display = "block";
				msgResult.className = "msgResult-error";
				return false;
			} else if (xmlHttp.readyState == 4 && xmlHttp.status == 500){
				// alert("Server returned a general error state, go tell mum.");
				msgResult.innerHTML = '<p>Server returned a general error state (500), your deck was not created.</p>';
				msgResult.style.display = "block";
				msgResult.className = "msgResult-error";
				return false;
			} else {
				//alert("studyPOST, Error at server: xmlHttp.readyState: " + xmlHttp.readyState + ", xmlHttp.Status: " + xmlHttp.status);
			}
		};
		//console.log("xmlHttp.readyState:", xmlHttp.readyState)
	} catch (err) {
		let errMsg = "studyPOST, Error on Browser: " + err;
		alert(errMsg);
    return false;
  } finally {
		return true;
	}

}

function rejectBlanks(element)	{
	//console.log(element.id);
	switch(element.value){
			case "":
			case null:
					throw element.id + ": must contain valid data, blank or empty fields are not permitted.";
			default:
					return element.value;
	}
}
function isTrue(value){
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
function getDeckArray(form,setSizes) {
  let newArray = [];
  let deckNames = form.elements["deckConfiguration[deckName]"];

	// loop through list of radio buttons, build an array of decks chosen
  for (let i=0, len=deckNames.length; i<len; i++) {
    var pickQty = form.elements["deckConfiguration[pickQty]"];
    let sampleMode = form.elements["deckConfiguration[sampleMode]"];

    if (isNaN(pickQty[i].value)){
			continue;
		}	else if (pickQty[i].value === null) {
			continue;
		} else if (pickQty[i].value === "") {
			continue;
		} else {
			// console.log(deckNames[i].value + ':' + pickQty[i].value);
			let sNewDeck = '{"deckName":"","pickQty":"","sampleMode":""}';
			sNewDeck = JSON.parse(sNewDeck);
			sNewDeck.deckName = deckNames[i].value;
			sNewDeck.pickQty = parseInt(pickQty[i].value);
			sNewDeck.sampleMode = sampleMode[i].value;
			newArray.push(sNewDeck);
		}
	}
    
	// console.log(newArray);
	//study needs at least one card!
	let sumDeckSize = newArray.reduce((accumulator, currentValue) => {
			//https://stackoverflow.com/questions/6736476/how-to-turn-nan-from-parseint-into-0-for-an-empty-string
			let val = parseInt(currentValue.pickQty) || 0;
			// console.log("accumulator:" + accumulator, "val:" + val);
			return accumulator + val;
	}, 0);
	if (sumDeckSize < 1){ 
    throw "Wait! What? You can't do a study with no cards?! ";
  }

	//does the number of cards selected in all decks equal the setSizes total?
	let sumSetSizes = setSizes.reduce((accumulator, currentValue) => {
			return accumulator + currentValue;
	}, 0);
	if (sumDeckSize != sumSetSizes){ 
    throw "Mate, Mate, Maaaate! hold up cobba!\n\n (Sum of picked cards) needs to equal (sum of setSizes)!"; 
  }

  return newArray;


}

function cleanSetsArray(sText){
    //remove all but numbers and commas
    sText = sText.replace(/[^0-9,]/g, "");
    //remove leading and trailing commas and return result
    sText = sText.replace(/(^,)|(,$)/g, "");
    //remove null elements from string e.g consecutive commas 4,,4 = 4,4
    sText = sText.replace(/\,+/g, ',');
		sText = JSON.parse("[" + sText + "]");
		// console.log("cleanedsetus:", sText);
		return sText;
}
function getRadioValue(form, name) {
//https://www.dyn-web.com/tutorials/forms/radio/get-selected.php
    // let val;
    // get list of radio buttons with specified name
    let radios = form.elements[name];
    // loop through list of radio buttons
    for (let i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) { // radio checked?
            // val = radios[i].value; // if so, hold its value in val
            // break; // and break out of for loop
            return radios[i].value; // if so, hold its value in val
        }
    }
    // return val; // return value of checked radio or undefined if none checked
    return ''; // return value of checked radio or undefined if none checked
}
