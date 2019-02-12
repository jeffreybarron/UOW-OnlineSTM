// ostm2/public/static
"use strict";

// Application Settings
const sPath = '/ostm2';
var state = {};

//application state variables
var oStudyConfig;
var questionBank;
var myTicker;
var questionCounter = 0;
var deckCounter = 0;
var completedStudy = "";
var allDecks = [];
var sampledStimulus = [];

//document elements
var questionObj = document.getElementById("question");
var answerDIV = document.getElementById("answerDIV");
var answer = document.getElementById("answer");
var startDIV = document.getElementById("startDIV");
var participantID = document.getElementById("PROLIFIC_PID");
var pageTitle = document.getElementById("pageTitle");
var studyText = document.getElementById("studyText");
var checkConsent = document.getElementById("checkConsent");
var checkInstructions = document.getElementById("checkInstructions");

Window.onerror = function (message, filename, linenumber) {
		var msg = message;
		alert(msg);
		console.log(msg + ", file: " + filename + ", line:" + linenumber);
    return true; 
}

$(document).ready(function(){
 
  var result
  result = updateDOMState()


  /* ====================================
  * Make pageContent Visibble
  */
  $("#contentContainer").attr("style", "display:block");

});

function updateDOMState(){
  try{
    //load StateData from page <script id="stateData"> innerHTML
    //var stateData = JSON.parse($('#stateData').html()); //just checking
    // var stateData = JSON.stringify($('#stateData').html());
    var stateData = $('#stateData').html();
    $.ajax({
      method: "POST",
      url: "/ostm2/API/page",
      contentType: "application/json", //request data i.e. POSTed
      data: stateData,
      async: true,
      cache: false,
      dataType: "json", //response data, recieved from server
      statusCode: {
        404: function() {
          alert( "page not found" );
        }
      },
      success: function(response) {
        state = response;
        let result = updateDOM();

      },
      error: function(xhr) {
        //Do Something to handle error
        $("#contentContainer").html("there was an error");
        $("#contentContainer").attr("style", "display:block");

      }
    });
  } catch (err) {
    alert(err);
  }

}
function updateDOM(){

  /* ==================================== 
  * Here is where you clear old pageConent CSS and load the new page Css
  * Need to figure this out
  * I think what i'll do is put a css element placeholder above page content, and update that.?
  * http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
  */        
  var deleteNodes = document.getElementById("cssContainer");
  while (deleteNodes.firstChild) {
      deleteNodes.removeChild(deleteNodes.firstChild);
  };
  var newLink=document.createElement("link");
  newLink.setAttribute("rel", "stylesheet");
  newLink.setAttribute("type", "text/css");
  newLink.setAttribute("href", state.stateFlowConfig.views[state.getView].style);
  var cssContainer = document.getElementById("cssContainer");
  cssContainer.appendChild(newLink);

  /* ====================================
  * Load the page.html into our wrapper Page
  */
  //document.getElementById("pageContent").innerHTML = state.pageContent;
  //following resolves the issue above that updating innerHTML doesnt add the elements to the DOM
  var deleteNodes = document.getElementById("contentContainer");
  while (deleteNodes.firstChild) {
    deleteNodes.removeChild(deleteNodes.firstChild);
  };
  var newDiv = document.createElement("div");
  newDiv.setAttribute("id", "pageContent");
  newDiv.innerHTML = state.pageContent;
  var contentContainer = document.getElementById("contentContainer");
  contentContainer.appendChild(newDiv);

  /* ====================================
  * Unload old pageConent Scripts and reload this page scripts
  */
  var deleteNodes = document.getElementById("scriptContainer");
  while (deleteNodes.firstChild) {
    deleteNodes.removeChild(deleteNodes.firstChild);
  };
  var newScript=document.createElement('script')
  newScript.setAttribute("type","text/javascript")
  newScript.setAttribute("src", state.stateFlowConfig.views[state.getView].script)
  
  var contentContainer = document.getElementById("scriptContainer");
  scriptContainer.appendChild(newScript);
}

function next() {
  //make the page Visible
  $("#contentContainer").attr("style", "display:none");

  //first check if this is the last then we cant go forward
  state.getView++
  let sState = JSON.stringify(state);
  document.getElementById('stateData').innerHTML = sState;
  let result = updateDOMState()//state is a document level variable so we dont need to pass it.
  //make the page Visible
  $("#contentContainer").attr("style", "display:block");
  return true

}
function redirect(){
  //abandon ship the end has come.
  $('#stateData').html(state);
  window.location.replace(state.stateFlowConfig.views[state.getView].pageRedirect);
  return true
}
function back(){
  //make the page Visible
  $("#contentContainer").attr("style", "display:none");

  //first check if this is the last then we cant go forward
  state.getView--
  $('#stateData').html(state);
  let result = updateDOMState(state.getView)

  //make the page Visible
  $("#contentContainer").attr("style", "display:block");
  return true
}

async function saveState(){
  alert("hey code my save state!!")
}

$( "#continue" ).on( "click", function( event ) {
  event.stopPropagation();
  try{
    alert("this");

    } catch (err) {
      alert(err);
    }

});