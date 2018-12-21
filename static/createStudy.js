"use strict";
//DOC Elements by ID
var studyForm = document.getElementById("studyForm");
var buttonCreate = document.getElementById("buttonCreate");

var studyName = document.getElementById("studyName");
var consentCopy = document.getElementById("consentCopy");
var instructionCopy = document.getElementById("instructionCopy");
var studybackgroundColor = document.getElementById("studybackgroundColor");
var refreshRateMS = document.getElementById("refreshRateMS");
var setSizes = document.getElementById("setSizes");
var completionCode = document.getElementById("completionCode");

//JScript Variables
var oStudyConfig = {};
var deckCounter = 0;
var allDecks = [];

//prefer this is the only syncronus call in the File, this runs
//when createStudy.js is run say using <Script>
var pageHandler = main();


function main(){
	try {
		//switch
    console.log("createStudy, main()")
  } catch (err) {
		console.log("loadPage Error: " + err);
	} finally {
    console.log("createStudy load COMPLETE");
	}
}

function createStudy() {
  //console.log("createStudy() Started");
  //1- studyExists just for good measure
  oStudyConfig["studyName"] = studyName.value;
  oStudyConfig["consentCopy"] = consentCopy.value;
  oStudyConfig["instructionCopy"] = instructionCopy.value;
  oStudyConfig["studybackgroundColor"] = studybackgroundColor.value;
  oStudyConfig["refreshRateMS"] = parseInt(refreshRateMS.value);
  oStudyConfig["shuffleDecks"] = isTrue(getRadioValue(document.getElementById('studyForm'), 'shuffleDecks' ));
  oStudyConfig["shuffleAll"] = isTrue(getRadioValue(document.getElementById('studyForm'), 'shuffleAll' ));
  oStudyConfig["setSizes"] = cleanSetsArray(setSizes.value);
  oStudyConfig["deckConfiguration"] = getDeckArray(studyForm);
	oStudyConfig["completionCode"] = completionCode.value;



  //3- build query stringify, ie custom serialize
  let created = studyPOST(oStudyConfig);
  console.log("created:" + created)
  //encode string
  //4- Post and direct to new pageTitle
 	return "created"
}

function studyPOST(oStudyConfig) {
  var errLoc = "studyPOST, start"
  var data = JSON.stringify(oStudyConfig, null, 2);
  let xmlHttp = new XMLHttpRequest;
    xmlHttp.open("POST", "/study/create", true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    //Save data to server
  try {
    console.log(errLoc + "try ", data);
    xmlHttp.send(data);
    console.log("sent now wait");
    xmlHttp.onreadystatechange = function() {
      errLoc = "studyPOST, onReadyStateChange, "
      if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        console.log (errLoc + 'xmlHttp.readyState: ' + xmlHttp.readyState + ', xmlHttp.Status: ' + xmlHttp.status);
        return true
      } else {
        console.log (errLoc + 'xmlHttp.readyState: ' + xmlHttp.readyState + ', xmlHttp.Status: ' + xmlHttp.status);
        return false
        console.log("Problem saving study:");
      }
    }
  } catch (err) {
    console.log("error: " + err);
    return false
  }
}

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

function getDeckArray(form) {
  let newArray = []
  let deckNames = form.elements["deckConfiguration[deckName]"];
  // loop through list of radio buttons
  for (let i=0, len=deckNames.length; i<len; i++) {
    let pickQty = form.elements["deckConfiguration[pickQty]"];
    let sampleMode = form.elements["deckConfiguration[sampleMode]"];

    if (!isNaN(pickQty[i].value)){
      //if qty is not, not a number (ie an number), then add to newArray
      //console.log("{'" + deckNames[i].value + "':'" + qty[i].value + "'}");
			let sNewDeck = '{"deckName":"","pickQty":"","sampleMode":""}'
			sNewDeck = JSON.parse(sNewDeck);
			sNewDeck.deckName = deckNames[i].value;
      sNewDeck.pickQty = parseInt(pickQty[i].value);
      sNewDeck.sampleMode = sampleMode[i].value;

			newArray.push(sNewDeck);
    }

  }
  return newArray; // if so, hold its value in val
}

function cleanSetsArray(sText){
    //remove all but numbers and commas
    sText = sText.replace(/[^0-9,]/g, "");
    //remove leading and trailing commas and return result
    sText = sText.replace(/(^,)|(,$)/g, "");
    //remove null elements from string e.g consecutive commas 4,,4 = 4,4
    sText = sText.replace(/\,+/g, ',');
		sText = JSON.parse("[" + sText + "]")
		return sText
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



function studyExists (){
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
