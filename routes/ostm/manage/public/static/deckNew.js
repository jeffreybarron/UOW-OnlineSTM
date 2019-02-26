"use strict";
var sPath = '/ostm/manage'
var stimuliTable = document.getElementById("stimuliTable");
var msgResult = document.getElementById("msgResult");
let iRowCount = 1;

function addRow(){

  let n = stimuliTable.rows.length - 1;
  let lastRow = stimuliTable.rows[ stimuliTable.rows.length - 1 ];
  let lastTextColor = lastRow.getElementsByClassName("form-control")[2].value
  let lastbackgroundColor = lastRow.getElementsByClassName("form-control")[3].value

  let newRow = stimuliTable.insertRow(-1);
  let iRow = newRow.insertCell(0);
  let stimuli = newRow.insertCell(1);
  let textColor = newRow.insertCell(2);
  let bgColor = newRow.insertCell(3);
  let del = newRow.insertCell(4);

  iRow.innerHTML=`
    <input type="text" class="form-control" id="row_${n}" name="row_${n}" value="${n}" readonly>`;
  stimuli.innerHTML=`
    <input type="text" class="form-control" id="stimulus_${n}" name="stimulus_${n}" required>`;
  textColor.innerHTML=`
    <input type="text" class="form-control" id="textColor_${n}" name="textColor_${n}" value="${lastTextColor}" required>`;
    bgColor.innerHTML=`<input type="text" class="form-control" id="backgroundColor_${n}" name="backgroundColor_${n}" value="${lastbackgroundColor}" required>`;
  del.innerHTML = `
    <img class="icons insert" alt="insert" src="/static/iconfinder_table_row_insert_64776.png">
    <img class="icons trash" alt="trash-can" src="/static/trash_can_PNG18444.png">`;

  iRowCount++;

}

function createDeck(){
var deckName = document.getElementById("deckName");
				
  //find table and iterate tbody, putting rows into JSON
  let jData = tableToJson(stimuliTable);
  var data = JSON.stringify(jData, null, 2);
  let xmlHttp = new XMLHttpRequest;
    xmlHttp.open("POST", sPath + "/deck/create/" + deckName.value, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    //Save data to server
  try {
    xmlHttp.send(data);
    xmlHttp.onreadystatechange = function() {
      // console.log ('xmlHttp.readyState: ' + xmlHttp.readyState + ', xmlHttp.Status: ' + xmlHttp.status);
      if (xmlHttp.readyState == 4 && xmlHttp.status == 201) {
				// alert("studyPOST, Study Created");
        msgResult.innerHTML = '<p>' + deckName.value + ' created.</p>';
        msgResult.style.display = "block";
        msgResult.className = "msgResult-success";
        //return true
			} else if (xmlHttp.readyState == 4 && xmlHttp.status == 409){
				// alert("You must choose another deckName, this one is already in use");
        msgResult.innerHTML = '<p>You must choose another deckName, ' + deckName.value + ' is already in use.</p>';
        msgResult.style.display = "block";
        msgResult.className = "msgResult-error";
				return false;
			} else if (xmlHttp.readyState == 4 && xmlHttp.status == 500){
				//alert("Server returned a general error state, go tell mum.");
        msgResult.innerHTML = '<p>Server returned a general error state (500), your deck was not created.</p>';
        msgResult.style.display = "block";
        msgResult.className = "msgResult-error";
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
  for (var n=0; n < table.tHead.rows[0].cells.length; n++) {
    headers[n] = table.tHead.rows[0].cells[n].innerText.toLowerCase().replace(/ /gi,''); 
  } 
  // go through cells 
  for (var i = 1; i < table.rows.length; i++) { 
    var tableRow = table.rows[i]; var rowData = {}; 
    for (var j = 0; j < tableRow.cells.length; j++) { 
      rowData[ headers[j] ] = tableRow.cells[j].children[0].value; 
    } data.push(rowData); 
  } 
  return data; 
}

$(document).on('click', 'img.trash', function () {
  
    $(this).closest('tr').remove();
    Array.prototype.forEach.call(document.querySelectorAll('td:first-child'), function (elem, idx) {
        elem.innerHTML = `<input type="text" class="form-control" id="row_${idx}" name="row_${idx}" value="${idx}" readonly>`;
    });

});

$(document).on('click', 'img.insert', function () {
  
  let n = $(this).closest('tr')[0].rowIndex;
  
  let lastRow = stimuliTable.rows[ n ];

  let lastTextColor = lastRow.getElementsByClassName("form-control")[2].value
  let lastbackgroundColor = lastRow.getElementsByClassName("form-control")[3].value
    
  let sNewRow = `
    <tr>
      <td><input type="text" class="form-control" id="row_${n}" name="row_${n}" value="${n}" readonly></td> 
      <td><input type="text" class="form-control" id="stimulus_${n}" name="stimulus_${n}" required></td> 
      <td><input type="text" class="form-control" id="textColor_${n}" name="textColor_${n}" value="${lastTextColor}" required></td>
      <td><input type="text" class="form-control" id="backgroundColor_${n}" name="backgroundColor_${n}" value="${lastbackgroundColor}" required></td>
      <td><img class="icons insert" alt="insert" src="/static/iconfinder_table_row_insert_64776.png"><img class="icons trash" alt="trash-can" src="/static/trash_can_PNG18444.png"></td>
    </tr>`

  $(this).closest('tr').before(sNewRow);


    Array.prototype.forEach.call(document.querySelectorAll('td:first-child'), function (elem, idx) {
        elem.innerHTML = `<input type="text" class="form-control" id="row_${idx}" name="row_${idx}" value="${idx}" readonly>`;
    });

});