"use strict";
var stimuliTable = document.getElementById("stimuliTable");
var deckNewResult = document.getElementById("deckNewResult");
let iRowCount = 1;

function addRow(){
  let newRow = stimuliTable.insertRow(-1);
  var iRow = newRow.insertCell(0);
  var stimuli = newRow.insertCell(1);
  var textColor = newRow.insertCell(2);
  var bgColor = newRow.insertCell(3);

  iRow.innerHTML='<input type="text" class="form-control" id="row_' + iRowCount + '" name="row_' + iRowCount + '" value=' + iRowCount + ' readonly>';
  stimuli.innerHTML='<input type="text" class="form-control" id="stimulus_' + iRowCount + '" name="stimulus_' + iRowCount + '" required>';
  textColor.innerHTML='<input type="text" class="form-control" id="textColor_' + iRowCount + '" name="textColor_' + iRowCount + '" required>';
  bgColor.innerHTML='<input type="text" class="form-control" id="backgroundColor_' + iRowCount + '" name="backgroundColor_' + iRowCount + '" required>';
  iRowCount++;

}

function createDeck(){
var deckName = document.getElementById("deckName");
				
  //find table and iterate tbody, putting rows into JSON
  let jData = tableToJson(stimuliTable);
  var data = JSON.stringify(jData, null, 2);
  let xmlHttp = new XMLHttpRequest;
    xmlHttp.open("POST", "/manage/deck/create/" + deckName.value, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    //Save data to server
  try {
    xmlHttp.send(data);
    xmlHttp.onreadystatechange = function() {
      // console.log ('xmlHttp.readyState: ' + xmlHttp.readyState + ', xmlHttp.Status: ' + xmlHttp.status);
      if (xmlHttp.readyState == 4 && xmlHttp.status == 201) {
				// alert("studyPOST, Study Created");
        deckNewResult.innerHTML = '<p>' + deckName.value + ' created.</p>';
        deckNewResult.style.display = "block";
        deckNewResult.className = "deckNewResult-success";
        //return true
			} else if (xmlHttp.readyState == 4 && xmlHttp.status == 409){
				// alert("You must choose another deckName, this one is already in use");
        deckNewResult.innerHTML = '<p>You must choose another deckName, ' + deckName.value + ' is already in use.</p>';
        deckNewResult.style.display = "block";
        deckNewResult.className = "deckNewResult-error";
				return false;
			} else if (xmlHttp.readyState == 4 && xmlHttp.status == 500){
				alert("Server returned a general error state, go tell mum.");
				return false;
			} else {
				//alert("studyPOST, Error at server: xmlHttp.readyState: " + xmlHttp.readyState + ", xmlHttp.Status: " + xmlHttp.status);
			}
    };
  } catch (err) {
    console.log("error: " + err);
    alert("There has been a problem saving your study!, Please contact the researcher: " + err);
  }
}
function tableToJson(table) { 
  var data = []; // first row needs to be headers 
  var headers = []; 
  for (var i=0; i < table.tHead.rows[0].cells.length; i++) {
    headers[i] = table.tHead.rows[0].cells[i].innerText.toLowerCase().replace(/ /gi,''); 
  } 
  // go through cells 
  for (var j = 1; j < table.rows.length; i++) { 
    var tableRow = table.rows[j]; var rowData = {}; 
    for (var k = 0; k < tableRow.cells.length; k++) { 
      rowData[ headers[k] ] = tableRow.cells[k].children[0].value; 
    } data.push(rowData); 
  } 
  return data; 
}