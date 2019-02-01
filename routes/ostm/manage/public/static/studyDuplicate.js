"use strict";
var sPath = '/ostm/manage'
var currentStudyName = document.getElementById("currentStudyName");
var new_studyName = document.getElementById("new_studyName");

var studybackgroundColor = document.getElementById("studybackgroundColor");
var studyTextColor = document.getElementById("studyTextColor");
var shuffleDecks = document.getElementById("shuffleDecks");
var shuffleAll = document.getElementById("shuffleAll");
var setSizes = document.getElementById("setSizes");
var refreshRateMS = document.getElementById("refreshRateMS");
var deckConfiguration = document.getElementById("deckConfiguration");
var msgResult = document.getElementById("msgResult");

var oStudyConfig = {};

var pageHandler = main();

function main() {
  //console.log("main on load function");
  var oData = upDateTable(document.getElementById("source_studyName").firstElementChild.text);
}
function updateOnChange() {
  // console.log("Selected: ", document.getElementById("source_studyName").value);
  var oData = upDateTable(document.getElementById("source_studyName").value);
}
function upDateTable(studyName) {
  let sUrl = sPath + "/resources/studies/" + studyName;

  //get study details, but ignore copy
  getFile(sUrl + ".json")
    .then(function(configFile) {
      var oStudyConfig = configFile;
      studybackgroundColor.innerText = oStudyConfig.studybackgroundColor;
      // console.log("oStudyConfig.studyName: ", oStudyConfig.studyName);
      currentStudyName.innerText = oStudyConfig.studyName;
      studyTextColor.innerText = oStudyConfig.studyTextColor;
      shuffleDecks.innerText = oStudyConfig.shuffleDecks;
      shuffleAll.innerText = oStudyConfig.shuffleAll;
      setSizes.innerText = oStudyConfig.setSizes;
      refreshRateMS.innerText = oStudyConfig.refreshRateMS;
      deckConfiguration.innerHTML = JSON.stringify(oStudyConfig.deckConfiguration, undefined, 2);
    })
    .catch(function(err) {
      // catch any error that happened so far
      // console.log("Argh, broken: " + err.message);
    });
  return true;
}

function getFile(url) {
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.onload = function() {
      if (xmlHttp.status == 200) {
        // Resolve the promise with the response text
        resolve(JSON.parse(xmlHttp.response));
      } else {
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
  });
}

function studyDuplicate() {
  try {
    let data = {
      "currentStudyName": currentStudyName.innerText,
      "new_studyName": new_studyName.value
    };
    let sUrl = sPath + "/study/duplicate";
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.open("POST", sUrl, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    //Save data to server

    xmlHttp.send(JSON.stringify(data, null, 2));
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 201) {
        // alert("Study Created!\n\nWe suggest you, click ok, and leave this page open until you've finished setting up.");
        msgResult.innerHTML =
          "<p>Study Created!</><p>We suggest you:<ul><li>leave this page open</li><li>open a new browser tab</li><li>Do any other setup on the new tab</li></ul></p>";
        msgResult.style.display = "block";
        msgResult.className = "msgResult-success";
        return true;
      } else if (xmlHttp.readyState == 4 && xmlHttp.status == 404) {
        // alert("A required file on the server was not found, contact your supervisor");
        msgResult.innerHTML =
          "<p>A required file on the server was not found, contact your supervisor</p>";
        msgResult.style.display = "block";
        msgResult.className = "msgResult-error";
        return false;
      } else if (xmlHttp.readyState == 4 && xmlHttp.status == 409) {
        // alert("You must choose another studyName, this one is already in use");
        msgResult.innerHTML =
          "<p>You must choose another studyName, this one is already in use</p>";
        msgResult.style.display = "block";
        msgResult.className = "msgResult-error";
        return false;
      } else if (xmlHttp.readyState == 4 && xmlHttp.status == 412) {
        // alert("You must choose another studyName, this one is already in use");
        msgResult.innerHTML = xmlHttp.responseText;
        msgResult.style.display = "block";
        msgResult.className = "msgResult-error";
        return false;
      } else if (xmlHttp.readyState == 4 && xmlHttp.status == 500) {
        // alert("Server returned a general error state, go tell mum.");
        msgResult.innerHTML = xmlHttp.responseText;
        msgResult.style.display = "block";
        msgResult.className = "msgResult-error";
        return false;
      } else {
        //alert("studyPOST, Error at server: xmlHttp.readyState: " + xmlHttp.readyState + ", xmlHttp.Status: " + xmlHttp.status);
      }
    };
  } catch (err) {
    msgResult.innerHTML = "<p>So here is the thing, we dont actually know what happened. Some kind of error I guess!!</p>";
    msgResult.style.display = "block";
    msgResult.className = "msgResult-error";
  }
}

