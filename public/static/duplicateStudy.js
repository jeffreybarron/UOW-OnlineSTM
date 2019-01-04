//this var is for the new Study
var studyName = document.getElementById("studyName");
//this var is the source studyName in the table for the user to copy.
var currentStudyName = document.getElementById("currentStudyName");
//these vars are for confirming the researcher has picked the correct study to duplicate
var studybackgroundColor = document.getElementById("studybackgroundColor");
var studyTextColor = document.getElementById("studyTextColor");
var shuffleDecks = document.getElementById("shuffleDecks");
var shuffleAll = document.getElementById("shuffleAll");
var setSizes = document.getElementById("setSizes");
var refreshRateMS = document.getElementById("refreshRateMS");
var consentCopy = document.getElementById("consentCopy");
var completionCode = document.getElementById("completionCode");
//honestly this was just a lazy way to render the deck info.
var deckConfiguration = document.getElementById("deckConfiguration");



var pageHandler = main();
function main(){
  //console.log("main on load function");
  var oData = upDateTable(document.getElementById("source_studyName").firstElementChild.text);
  
}

function updateOnChange (){
  console.log("Selected: ", document.getElementById("source_studyName").value);
  var oData = upDateTable(document.getElementById("source_studyName").value);

}

function upDateTable(studyName) {
  let sUrl = '/data/studies/'+ studyName

    //get study details, but ignore copy 
    getFile(sUrl + '.json').then(function(configFile){
      oStudyConfig = configFile
      studybackgroundColor.innerText = oStudyConfig.studybackgroundColor
      console.log("oStudyConfig.studyName: ",oStudyConfig.studyName);
      currentStudyName.innerText = oStudyConfig.studyName 
      studyTextColor.innerText = oStudyConfig.studyTextColor
      shuffleDecks.innerText = oStudyConfig.shuffleDecks
      shuffleAll.innerText = oStudyConfig.shuffleAll
      setSizes.innerText = oStudyConfig.setSizes
      refreshRateMS.innerText = oStudyConfig.refreshRateMS
      deckConfiguration.innerHTML = JSON.stringify(oStudyConfig.deckConfiguration, undefined, 2);

    }).catch(function(err) {
      // catch any error that happened so far
      console.log("Argh, broken: " + err.message);
    });
  return true;
}

function getFile(url) {
  return new Promise(function(resolve, reject) {

    // Do the usual XHR stuff
		let xmlHttp = new XMLHttpRequest;
    xmlHttp.open('GET', url, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.onload = function() {
      if (xmlHttp.status == 200) {
        // Resolve the promise with the response text
        resolve(JSON.parse(xmlHttp.response));
      }
      else {
        // Otherwise reject with the status text, which will hopefully be a meaningful error
        reject(Error(xmlHttp.statusText));
      }
    };

    // Handle network errors, ie reject promise if necessary
    xmlHttp.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    xmlHttp.send();

  })
}
