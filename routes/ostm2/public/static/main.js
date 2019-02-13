// ostm2/public/static
"use strict";

// Application Settings, these propogate down to inner pages
const sPath = '/ostm2'; 
var state = {};


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
    /* 
    * If this is function has been called from document.ready then the state.getView will be 0
    * if not state.getView will have been incremented by next(), eitherway the getView value is used to 
    * request the page content from the API/page
    * there are two layered methods of working with state in this solution
    * First: Javascrit manipiulates 'state' object declared in main.js, then 
    * Secondly: this is 'state' object is saved locally to a script tag id='stateDate' on the main (outer) page
    *
    * When this function is called, a POST request to the server sends the innerHTML of
    * 'stateData' to the API/page, which returns us the page content appropriate for state.getView value (0,1,2,3,4)
    * 
    */
    
    /* 
    * Note: it may be possible to maintain application State by merely working with the 'state' variable and do away with
    * saving it to a script tag, this issue may be investigated at a later date. 
    * Issues:
    * 1) The main issue will be to go from initialisation of the of the outer-page into the application State flow model
    * 2) The use of stateData tag allows page initialisation using a templating engine to kickstart the state object 
    * from the server dynamically
    *  
    */

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
  $("#contentContainer").attr("style", "display:none");


  /* ==================================== 
  * Here is where you clear old pageConent CSS and load the new page Css
  * Need to figure this out
  * I think what i'll do is put a css element placeholder above page content, and update that.?
  * http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
  */        
  var cssContainer = document.getElementById("cssContainer");
  while (cssContainer.firstChild) {
      cssContainer.removeChild(cssContainer.firstChild);
  };
  var newLink=document.createElement("link");
    newLink.setAttribute("rel", "stylesheet");
    newLink.setAttribute("type", "text/css");
    newLink.setAttribute("href", state.stateFlowConfig.views[state.getView].style);
  cssContainer.appendChild(newLink);


  /* ====================================
  * Load the page.html into our wrapper Page
  */
  //document.getElementById("pageContent").innerHTML = state.pageContent;
  //following resolves the issue above that updating innerHTML doesnt add the elements to the DOM
  var contentContainer = document.getElementById("contentContainer");
  while (contentContainer.firstChild) {
    contentContainer.removeChild(contentContainer.firstChild);
  };
  var newContent = document.createElement("div");
    newContent.setAttribute("id", "pageContent");
    newContent.innerHTML = state.pageContent;
  contentContainer.appendChild(newContent);

  /* ====================================
  * Unload old stateData and reload updated stateData
  <script id="stateData" type="application/json"></script>
  */
  var result = updateStateLocal()


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
  var scriptContainer = document.getElementById("scriptContainer");
  scriptContainer.appendChild(newScript);


  $("#contentContainer").attr("style", "display:block");
}
function updateStateLocal(){
  var dataContainer = document.getElementById("dataContainer");
  while (dataContainer.firstChild) {
    dataContainer.removeChild(dataContainer.firstChild);
  };
  var newData=document.createElement('script')
    newData.setAttribute("id", "stateData");
    newData.setAttribute("type","application/json")
    newData.innerHTML = JSON.stringify(state);
  dataContainer.appendChild(newData);
};


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
 try {
          //console.log(data);
          xmlHttp.send(data);
          // console.log("sent now wait");
          xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 202) {
              completedStudy =
                "PROLIFIC_PID=" + state.studyConfig.PROLIFIC_PID +
                "&" + "STUDY_ID=" + state.studyConfig.STUDY_ID +
                "&" + "SESSION_ID=" + state.studyConfig.SESSION_ID;

              setProperties(questionObj, "", "white", "black");
              questionObj.style.display = "none";
              studyText.style.display = "block";
              studyText.outerHTML =
                '<p>You must click this <a href="' + sPath + '/sendCode/' + 
								studyName.getAttribute('value') + '?' + completedStudy +
                '">Complete Study</a> link, to complete the study and generate a Prolific.ac completion code.</p>';
            } else {
          console.log("error: " + err);
              // alert("readyState:" + xmlHttp.readyState + " Status:" + xmlHttp.status );
            }
          };
        } catch (err) {

        }
}

$( "#continue" ).on( "click", function( event ) {
  event.stopPropagation();
  try{
    alert("this");

    } catch (err) {
      alert(err);
    }

});


/* ====================================
* Date Functions
*/
function getDate() {
  var d = new Date();
  return d.YYYYMMDDHHmmSSmsec();
}
Date.prototype.YYYYMMDDHHmmSSmsec = function() {
  var YYYY = this.getFullYear().toString();
  var MM = pad(this.getMonth() + 1, 2);
  var DD = pad(this.getDate(), 2);
  var HH = pad(this.getHours(), 2);
  var mm = pad(this.getMinutes(), 2);
  var ss = pad(this.getSeconds(), 2);
  var msec = pad(this.getMilliseconds(), 4);
  return YYYY + MM + DD + "_" + HH + ":" + mm + ":" + ss + "." + msec;
};
function pad(number, length) {
  var str = "" + number;
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}
