"use strict";
var sPath = '/ostm/manage'


/* not sure how I will use or delete this */
var setSizes = $("#setSizes");
var msgResult = $("#msgResult");

/*
*
* DOM & JQUERY Functions
*
*/
window.onerror = function (message, filename, linenumber) {
		var msg = message;
		alert(msg);
		console.log(msg + ", file: " + filename + ", line:" + linenumber);
    return true; // The exception is handled, don't show to the user.
}

$(document).ready(function(){
	let iRowCount = 1;
	console.log("Document Ready");
	
	$("#addRow").click(function(){
		try{
			var pickCards_table = $("#pickCards_table tbody")
			var clonedRow = pickCards_table.find('tr:last').clone();
			// clonedRow.find('input:not([readonly])').val(''); //empty the values
			clonedRow.find('input:read-only').val(iRowCount); //increment Order
			// pickCards_table.append(markup);
			pickCards_table.append(clonedRow);
			iRowCount++;
			$("#pickCards_table tbody tr:last").find('input:first').focus();
		} catch (err) {
			alert(err);
		}
  });

	$("#studyCreate").click(function(){
		let oStudyConfig = {};

		/**** for inside shuffle to work the cards need to picked into their sets at study creation
		 * it will not work in done at runtime per participant.
		 */
		$( "input[type=radio][name=shuffleBlocks]:checked" ).val();
		
    oStudyConfig["studyName"] = rejectBlanks($("#studyName").val());
    oStudyConfig["studybackgroundColor"] = rejectBlanks($("#studybackgroundColor").val());
    oStudyConfig["studyTextColor"] = rejectBlanks($("#studyTextColor").val());
    oStudyConfig["shuffleBlocks"] = $( "input[type=radio][name=shuffleBlocks]:checked" ).val();
    oStudyConfig["consentCopy"] = rejectBlanks( $("#consentCopy").val() );
    oStudyConfig["instructionCopy"] = rejectBlanks( $("#instructionCopy").val() );
    oStudyConfig["completionCode"] = rejectBlanks( $("#completionCode").val() );

		let dataArr = [];
		oStudyConfig["blocks"] = []
    //for each row\block
		$("#pickCards_table tbody tr").each(function(){
				//create column object and name:value\key:value pairs  
				let col = {}
				col[$(this.cells[0]).find('input')[0].name] = $(this.cells[0]).find('input')[0].value; //Block
				col[$(this.cells[1]).find('select')[0].name] = $(this.cells[1]).find('select')[0].value; //stimulusFile
				col[$(this.cells[2]).find('input')[0].name] = cleanSetsArray($(this.cells[2]).find('input')[0].value); //setSizes
				col[$(this.cells[3]).find('input')[0].name] = $(this.cells[3]).find('input')[0].value; //refreshRateMS
				col[$(this.cells[4]).find('select')[0].name] = $(this.cells[4]).find('select')[0].value; //shuffleMode
				col[$(this.cells[5]).find('input')[0].name] = $(this.cells[5]).find('input')[0].value; //pageafterblock
				//block.push(col); //add columns to a block
				oStudyConfig["blocks"].push(col); //add the block to blocks
    });


		//POST Data to create Study
		let sPostPath = sPath + "/study/create";
		let request = $.ajax({
			method: "POST",
			url: sPostPath,
			contentType: "application/json",
			data: JSON.stringify(oStudyConfig)
		});
		request.done(function( msg ) {
				alert( "Data Saved: " + msg );
		});
		request.fail(function( jqXHR, textStatus ) {
  		alert( "Request failed: " + textStatus );
		});
  });

});


/*
*
* Utility Functions
*
*/
function rejectBlanks(element)	{
	//console.log(element.id);
	switch(element){
			case "":
			case null:
					throw "Error: " + element.id + ": is Null or empty string.";
			default:
					return element;
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
