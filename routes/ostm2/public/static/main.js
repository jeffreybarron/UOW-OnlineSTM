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
  state = QueryStringToJSON();
  state.getView = "0";
  try{
    /* 
    * Initialise state
    * 1-get state object
    * 2-set getView to 0
    * 3-call updateDOM
    */
    var result = initialisePage(state)
    .then(resolved => {
      //wrap the file in JSON and set some other data with it
      // let returnData = resolved;
      console.log(resolved);
    })
    .catch(err => {
      console.log(err);
    });
  } catch (err) {
    alert(err);
  }
});

async function initialisePage(){
  let flowModel = await getFlowModel(state);
    state = flowModel;
  let pageBody = await getView(state);
    state = pageBody;
  let theDOM = updateDOM(state);
  // return [flowModel,pageBody,theDOM];
  return true;
};
function getFlowModel(state){
  return new Promise((resolve, reject) => {
    //load StateData from page <script id="stateData"> innerHTML
    $.ajax({
      method: "POST",
      url: "/ostm2/API/flow",
      contentType: "application/json", //request data i.e. POSTed
      data: JSON.stringify(state),
      async: true,
      cache: false,
      dataType: "json", //response data, recieved from server
      success: function(response) {
        return resolve(response)
      },
      error: function(xhr) {
        //Do Something to handle error
        return reject(xhr);
      }
    });

  });
};
async function updatePage(){
  let pageBody = await getView(state);
    state = pageBody;
  let theDOM = updateDOM(state);
  return true;
};
function getView(state){
  return new Promise((resolve, reject) => {
    //load StateData from page <script id="stateData"> innerHTML
    $.ajax({
      method: "POST",
      url: "/ostm2/API/view",
      contentType: "application/json", //request data i.e. POSTed
      data: JSON.stringify(state),
      async: true,
      cache: false,
      dataType: "json", //response data, recieved from server
      success: function(response) {
        return resolve(response)
      },
      error: function(xhr) {
        //Do Something to handle error
        return reject(xhr);
      }
    });

  });
};
function updateDOM(state){
    $("#contentContainer").attr("style", "display:none");

    /* ==================================== 
    * http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
    * load Page Styles
    */        
    var pageStyles = document.getElementById("pageStyles");
    while (pageStyles.firstChild) {
        pageStyles.removeChild(pageStyles.firstChild);
    };
    for (const pageStyle of state.flow.views[state.getView].pageStyles){
      let newLink = document.createElement("link");
        newLink.setAttribute("rel", "stylesheet");
        newLink.setAttribute("type", "text/css");
        newLink.setAttribute("href", pageStyle);
      pageStyles.appendChild(newLink);
    };
    
    /* ====================================
    * Load the viewStyle and viewContent into our Page container
    */
    var contentContainer = document.getElementById("contentContainer");
    while (contentContainer.firstChild) {
      contentContainer.removeChild(contentContainer.firstChild);
    };
    //first load viewStyles
    for (const viewStyle of state.flow.views[state.getView].viewStyles){
      let newLink = document.createElement("link");
        newLink.setAttribute("rel", "stylesheet");
        newLink.setAttribute("type", "text/css");
        newLink.setAttribute("href", viewStyle);
      contentContainer.appendChild(newLink);
    };  
    //then load pageContent
    var newContent = document.createElement("div");
      newContent.setAttribute("id", "pageContent");
      newContent.innerHTML = state.pageContent;
    contentContainer.appendChild(newContent);


    /* ====================================
    * Load the Footer into our Page container
    */
    var footerContainer = document.getElementById("footerContainer");
    while (footerContainer.firstChild) {
      footerContainer.removeChild(footerContainer.firstChild);
    };
    //then load pageContent
    var newFooter = document.createElement("div");
      newFooter.setAttribute("id", "pageContent");
      newFooter.innerHTML = state.flow.views[state.getView].footer;
    footerContainer.appendChild(newFooter);


    /* ====================================
    * Unload old scripst and reload updated scripts
    */
    var scriptContainer = document.getElementById("scriptsCustom");
    while (scriptContainer.firstChild) {
      scriptContainer.removeChild(scriptContainer.firstChild);
    };
    for (const script of state.flow.views[state.getView].scripts){
      var newScript=document.createElement('script')
        newScript.setAttribute("type","text/javascript")
        newScript.setAttribute("src", script)
      scriptContainer.appendChild(newScript);
    };  


    $("#contentContainer").attr("style", "display:block");
    return true;
};
function saveState(){
  return new Promise((resolve, reject) => {
    //load StateData from page <script id="stateData"> innerHTML
    $.ajax({
      method: "POST",
      url: "/ostm2/API/save",
      contentType: "application/json", //request data i.e. POSTed
      data: JSON.stringify(state),
      async: true,
      cache: false,
      dataType: "json", //response data, recieved from server
      success: function(response) {
        return resolve(response)
      },
      error: function(xhr) {
        //Do Something to handle error
        return reject(xhr);
      }
    });

  });
};



function next() {
  //first check if this is the last then we cant go forward
 
  state.getView++;
  let save = saveState(); // save the previous state before updating
  let update = updatePage();

  return true;
};
function redirect(){
  //abandon ship the end has come.
  state.flow.views[state.getView].response = "redirect"
  let save = saveState(); // save the previous state before redirecting

  window.location.replace(state.flow.views[state.getView].pageRedirect);
  return true
};
function back(){
  // first check if this is the first then we cant go back
  
  state.getView--;
  let save = saveState(); // save the previous state before updating
  let update = updatePage();

  return true;
  
};



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
  return YYYY + MM + DD + "T" + HH + ":" + mm + ":" + ss + "." + msec;
};
function pad(number, length) {
  var str = "" + number;
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}




function QueryStringToJSON() {            
    var pairs = location.search.slice(1).split('&');
    
    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        // result['"' + pair[0] + '"'] = decodeURIComponent(pair[1] || '');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result));
}

