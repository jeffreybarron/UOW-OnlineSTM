"use strict";
// require("@babel/polyfill");
require('jquery');
const sPath = '/ostm/manage'
// const siteAssets = '/public/'

//note here I've chosen to use vanilla JS, beause I can pass the whole element when needed, such as when checking for blanks
var studyName = document.getElementById("studyName");
var completionCode = document.getElementById("completionCode");
var redirectTimer = document.getElementById("redirectTimer");
var completionURL = document.getElementById("completionURL");
var studybackgroundColor = document.getElementById("studybackgroundColor");
var studyTextColor = document.getElementById("studyTextColor");
var shuffleBlocks = document.getElementById("shuffleDecks");
var deckConfiguration = document.getElementById("deckConfiguration");
var msgResult = document.getElementById("msgResult");

const TINYMCE_SETTINGS = {
  selector: "textarea",
  toolbar_items_size: 'small',
  menubar: false,
  toolbar: "fullscreen",
  plugins: [
    'advlist autolink lists link image charmap print preview anchor',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table paste code help wordcount'
  ],
  toolbar: 'fullscreen code removeformat| undo redo | link image | bold italic underline | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | fontselect | fontsizeselect | formatselect'
}

/* not sure how I will use or delete this */
var setSizes = $("#setSizes");


/*
*
* DOM & JQUERY Functions
*
*/
window.onerror = function (message, filename, linenumber) {

  msgResult.innerHTML = '<p>' + message + '</p>' + '<p>File: ' + filename + '</p>' + '<p>Line:' + linenumber + '</p>';
  msgResult.style.display = "block";
  msgResult.className = "msgResult-error";
  return true; // The exception is handled, don't show to the user.
}

$(document).ready(function () {
  let iRowCount = 1;
  console.log("Document Ready");

  tinymce.init(TINYMCE_SETTINGS);

  $("#addRow").click(function () {
    try {
      tinymce.remove();

      var pickCards_table = $("#pickCards_table tbody")
      var clonedRow = pickCards_table.find('tr:last').clone();
      clonedRow.find('input:read-only').val(iRowCount); //increment block value
      clonedRow.find('textarea').attr('id', iRowCount); //increment blockPopup id.value, for tinyMCE

      pickCards_table.append(clonedRow);
      iRowCount++;
      $("#pickCards_table tbody tr:last").find('input:first').focus();

      tinymce.init(TINYMCE_SETTINGS);

    } catch (err) {
      alert(err);
    }
  });

  $("#studyCreate").click(function () {

    try {
      tinymce.triggerSave();

      let oStudyConfig = {};
      /**** for inside shuffle to work the cards need to picked into their sets at study creation
       * it will not work in done at runtime per participant.
       */
      $("input[type=radio][name=shuffleBlocks]:checked").val();

      oStudyConfig["studyName"] = rejectBlanks(studyName);
      oStudyConfig["completionCode"] = completionCode.value; //rejectBlanks(completionCode);
      oStudyConfig["redirectTimer"] = redirectTimer.value; //rejectBlanks(redirectTimer);
      oStudyConfig["completionURL"] = completionURL.value; //rejectBlanks(completionURL);
      oStudyConfig["studybackgroundColor"] = rejectBlanks(studybackgroundColor);
      oStudyConfig["studyTextColor"] = rejectBlanks(studyTextColor);
      oStudyConfig["consentCopy"] = rejectBlanks(consentCopy);
      oStudyConfig["instructionCopy"] = rejectBlanks(instructionCopy);
      // Get Block config
      let dataArr = [];
      oStudyConfig["blocks"] = []
      //for each row\block
      $("#pickCards_table tbody tr").each(function () {
        //create column object and name:value\key:value pairs  
        if (!$(this.cells[2]).find('input')[0].value) {
          throw "Study stimuli are picked at design-time. Therefore, 'Stimuli Configation' must have at least one block configured with at least one set of stimuli. Note: sets cannot exceed number of stimuli in the chosen stimulus file."
        };

        let col = {}
        col[$(this.cells[0]).find('input')[0].name] = $(this.cells[0]).find('input')[0].value; //Block
        col[$(this.cells[1]).find('select')[0].name] = $(this.cells[1]).find('select')[0].value; //stimulusFile
        col[$(this.cells[2]).find('input')[0].name] = cleanSetsArray($(this.cells[2]).find('input')[0].value); //setSizes
        col[$(this.cells[3]).find('input')[0].name] = $(this.cells[3]).find('input')[0].value; //refreshRateMS
        col[$(this.cells[4]).find('select')[0].name] = $(this.cells[4]).find('select')[0].value; //shuffleMode
        col[$(this.cells[5]).find('textarea')[0].name] = $(this.cells[5]).find('textarea').val(); //blockPopUp
        //block.push(col); //add columns to a block
        oStudyConfig["blocks"].push(col); //add the block to blocks
      });
      oStudyConfig["shuffleBlocks"] = isTrue(getRadioValue(document.getElementById('studyForm'), 'shuffleBlocks'));

      //POST Data to create Study
      let sPostPath = sPath + "/study/create";
      let request = $.ajax({
        method: "POST",
        url: sPostPath,
        contentType: "application/json",
        data: JSON.stringify(oStudyConfig)
      });
      request.done(function (msg) {
        msgResult.innerHTML = '<p>Study Created!</p><hr><p>We suggest you:<ul><li>leave this page open</li><li>open a new browser tab</li><li>Do any other setup on the new tab</li></ul></p>';
        msgResult.style.display = "block";
        msgResult.className = "msgResult-success";
      });
      request.fail(function (jqXHR, textStatus) {
        if (jqXHR.responseText === "This file already exists!") {
          msgResult.innerHTML = '<p><em>Study Creation Failed:</em> ' +
            'You have tried to use a studyName that is already in use, try a different studyName.' + '<br />';
        } else {
          msgResult.innerHTML = '<p><em>Study Creation Failed:</em> ' +
            jqXHR.responseText + '<br />';
        }
        msgResult.style.display = "block";
        msgResult.className = "msgResult-error";
        console.log("Request Failed: " + jqXHR);
      });

    } catch (err) {

      msgResult.innerHTML = '<p>' + err + '</p>';
      msgResult.style.display = "block";
      msgResult.className = "msgResult-error";

      return false; // The exception is handled, don't show to the user.

    }// end catch block

  });// end studyCreate.Click

});// end document.ready


/*
*
* Utility Functions
*
*/
function rejectBlanks(element) {
  //console.log(element.id);
  switch (element.value) {
    case "":
    case null:
      throw element.id + ": must contain valid data, blank or empty fields are not permitted.";
    default:
      return element.value;
  }
}
function isTrue(value) {
  //convert values to boolean type
  if (typeof (value) === 'string') {
    value = value.trim().toLowerCase();
  }
  switch (value) {
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
function getDeckArray(form, setSizes) {
  let newArray = [];
  let deckNames = form.elements["deckConfiguration[deckName]"];

  // loop through list of radio buttons, build an array of decks chosen
  for (let i = 0, len = deckNames.length; i < len; i++) {
    var pickQty = form.elements["deckConfiguration[pickQty]"];
    let sampleMode = form.elements["deckConfiguration[sampleMode]"];

    if (isNaN(pickQty[i].value)) {
      continue;
    } else if (pickQty[i].value === null) {
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
  if (sumDeckSize < 1) {
    throw "Wait! What? You can't do a study with no cards?! ";
  }

  //does the number of cards selected in all decks equal the setSizes total?
  let sumSetSizes = setSizes.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  if (sumDeckSize != sumSetSizes) {
    throw "Mate, Mate, Maaaate! hold up cobba!\n\n (Sum of picked cards) needs to equal (sum of setSizes)!";
  }

  return newArray;


}
function cleanSetsArray(sText) {
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
  for (let i = 0, len = radios.length; i < len; i++) {
    if (radios[i].checked) { // radio checked?
      // val = radios[i].value; // if so, hold its value in val
      // break; // and break out of for loop
      return radios[i].value; // if so, hold its value in val
    }
  }
  // return val; // return value of checked radio or undefined if none checked
  return ''; // return value of checked radio or undefined if none checked
}


