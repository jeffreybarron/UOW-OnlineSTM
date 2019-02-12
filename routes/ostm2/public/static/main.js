// ostm2/public/static
"use strict";

// Application Settings
var sPath = '/ostm2'

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
var studyName = "test" //document.getElementById("studyName");
var studyID = document.getElementById("STUDY_ID");
var participantID = document.getElementById("PROLIFIC_PID");
var sessionID = document.getElementById("SESSION_ID");
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
        var state = response;

        /* ==================================== 
        * Here is where you clear old pageConent CSS and load the new page Css
        * Need to figure this out
        * I think what i'll do is put a css element placeholder above page content, and update that.?
        * http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
        */        
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
        var newDiv = document.createElement("div");
        newDiv.setAttribute("id", "pageContent");
        newDiv.innerHTML = state.pageContent;
        var contentContainer = document.getElementById("contentContainer");
        contentContainer.appendChild(newDiv);


        /* ====================================
        * Do any changes to the page
        */
        // $("#PROLIFIC_PID").val('wow');
        
    
       /* ====================================
        * Unload old pageConent Scripts and reload this page scripts
        */
        var newScript=document.createElement('script')
        newScript.setAttribute("type","text/javascript")
        newScript.setAttribute("src", state.stateFlowConfig.views[state.getView].script)
        
        
        var contentContainer = document.getElementById("scriptContainer");
        scriptContainer.appendChild(newScript);


        /* ====================================
        * Make pageContent Visibble
        */
        // $("#contentContainer").attr("style", "display:block");
      },
      error: function(xhr) {
        //Do Something to handle error
        $("#pageContent").html("there was an error");
        $("#pageContent").attr("style", "display:block");
      }
    });
  } catch (err) {
    alert(err);
  }

$("#contentContainer").attr("style", "display:block");

});
  
  // /*===============================================================
  // * Page Load Behaviour
  // */
  // try {
  //   var sPathName = window.location.pathname;
  //   // console.log("sPathName",sPathName);
  //   var n = sPathName.lastIndexOf("/");
  //   // console.log(n);
  //   var sourceURL = sPathName.substring(0, n);
  //   // console.log("SourceURL:", sourceURL);
  //   //switch
  //   switch (sPathName) {
  //     case sPath + "/base":
  //       alert("Base Loaded");
  //       loadConsentView();
  //       break;
  //     case sPath + "/consent":
  //       //Page 1 - Entry Page from Prolific
  //       //in: Prolific Paramater
  //       //out: Prolific Paramaters, GUID\cookie
  //       //console.log("entryPoint/consent Loading");
  //       loadConsent();
  //       break;
  //     case sPath + "/instructions":
  //       //Page 2 - Consent Recieved, Study Instructions
  //       //in: GUID\Cookie
  //       //out: GUID\Cookie
  //       //console.log("entryPoint/instructions Loading");
  //       loadInstructions();
  //       break;
  //     case sPath + "/study":
  //       //Page 3 - Consent Recieved GUID Created and Study
  //       //in: GUID\Cookie => Studytemplate.json => loadQuestions()
  //       //out: studyresult.json + GUID\Cookie => uploadAnswers(http.POST /results)
  //       //console.log("entryPoint/study Loading");
  //       loadStudy();
  //       break;
  //     case sPath + "/results":
  //       //Page
  //       //console.log("entryPoint/results Loading");
  //       break;
  //     default:
  //     //console.log("I have never heard of that fruit...");
  //   }
  // } catch (err) {
  //   console.log("loadPage Error: " + err);
  // } finally {
  //   //console.log("loadPage COMPLETE");
  // };




$( "#continue" ).on( "click", function( event ) {
  event.stopPropagation();
  try{
    alert("this");

    } catch (err) {
      alert(err);
    }

});


/*===============================================================
*
* Page Load Functions
*
*/
function loadConsent() {
  try {
    //console.log("ostm.js.loadConsent, studyID: " + studyName.getAttribute('value'))
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", sPath + "/resources/studies/" + studyName.getAttribute("value") + "_consent.html", true);
    xmlHttp.setRequestHeader("Content-Type", "text/html");
    xmlHttp.send();
    xmlHttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var researcherCopy = document.getElementById("researcherCopy");
        researcherCopy.innerHTML = this.responseText;
      }
    };
  } catch (err) {
    //alert("No Study ID specified in URL, cannot proceed!");
    setProperties(researcherCopy, err, "", "");
    return false;
  }
};
function loadInstructions() {
  try {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open(
      "GET",
      sPath + "/resources/studies/" + studyName.getAttribute("value") + "_instructions.html",
      true
    );
    xmlHttp.setRequestHeader("Content-Type", "text/html");
    xmlHttp.send();
    xmlHttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var researcherCopy = document.getElementById("researcherCopy");
        researcherCopy.innerHTML = this.responseText;
      }
    };
  } catch (err) {
    //alert("No Study ID specified in URL, cannot proceed!");
    setProperties(researcherCopy, err, "", "");
    return false;
  }
};
async function loadStudy() {
  //1- build the oStudyConfig variable for use by other functions
  //2-set the page initial state when loaded

  //NOTE: We setup the study on the client to offload the work from the server 

  //--------------------------------------------------------------
  //load config file
  var studyURL = sPath + "/resources/studies/" + studyName.getAttribute("value") + ".json";
  var configFile = await getFile(studyURL)
  oStudyConfig = configFile;
  oStudyConfig = configFile;
  oStudyConfig.PROLIFIC_PID = participantID.getAttribute("value");
  oStudyConfig.STUDY_ID = studyID.getAttribute("value");
  oStudyConfig.SESSION_ID = sessionID.getAttribute("value");
  oStudyConfig.checkConsent = checkConsent.getAttribute("value");
  oStudyConfig.checkInstructions = checkInstructions.getAttribute("value");
  
  //--------------------------------------------------------------
  //Shuffle the deck\ stimulusFiles if needed
  //
  if (oStudyConfig.shuffleDecks === true) {
    oStudyConfig.deckConfiguration = shuffleArray(oStudyConfig.deckConfiguration).splice(0);
  }

  //--------------------------------------------------------------
  //Build a JSON onbject with Decks and there parameters
  //
  //first make a list of files
  var stimulusFiles = []
  for (let i = 0; i < oStudyConfig.deckConfiguration.length; i++) {
    stimulusFiles.push(sPath + "/resources/decks/" + oStudyConfig.deckConfiguration[i].deckName);
  };
  //Call the getFile function on each of the items in stimulusFiles using map method
  var deckList = await Promise.all(stimulusFiles.map(getFile)) ;
  deckList.forEach(function(deck) {
    //At this point Im just going to add all decks to an allDecks object, so I
    //can use it once everything is loaded.
    allDecks.push(deck);
  });

  //--------------------------------------------------------------
  //Load all of the required cards from the decks into [sampledStimulus]
  //according to pickQty and sampleMode rules
  //
  let dealersDeck = [];
  for (let i = 0; i < allDecks.length; i++) {
    sampledStimulus.push(
      pickStimulus(
        allDecks[i],
        oStudyConfig.deckConfiguration[i].pickQty,
        oStudyConfig.deckConfiguration[i].sampleMode
      )
    );

    //--------------------------------------------------------------
    //shuffle Cards within Decks
    //
    // if (oStudyConfig.deckConfiguration[i].shuffleStimuli === true) {
    //   sampledStimulus[i].shuffleArray
    // }

    //--------------------------------------------------------------
    //Join each deck into a single deck for dealing into sets
    //https://davidwalsh.name/combining-js-arrays
    //
    // ***** see if you can do this to sampledStimulus without flattening the decks. ***
    for (let i = 0; i < allDecks.length; i++) {
      dealersDeck = sampledStimulus[i].reduce(function(coll, item) {
        coll.push(item);
        return coll;
      }, dealersDeck);
    };

  };

  //--------------------------------------------------------------
  //shuffle all Cards in the Dealers Deck (TOTALLY Scramble everything)
  //
  if (oStudyConfig.shuffleAll === true) {
    dealersDeck = shuffleArray(dealersDeck);
  };



  //--------------------------------------------------------------
  //setup sets in the config file
  //
  //for each set
  oStudyConfig["sets"] = [];
  for (let iSetNumber = 0; iSetNumber < oStudyConfig.setSizes.length; iSetNumber++) {
    //add set frame
    oStudyConfig.sets.push(JSON.parse('{"set":[]}'));
    let setSize = oStudyConfig.setSizes[iSetNumber];

    //dish out the number of cards required from the front of the deck
    for (let i = 0; i < setSize; i++) {
      //push first element of dealersDeck onto the end of config file sets.set
      //console.log("iSetNumber:" + iSetNumber + ", setSize:" + setSize + ", i:" + i);
      oStudyConfig.sets[iSetNumber].set.push(dealersDeck[0]); //because zero is always the front
      dealersDeck.shift(); //remove first element of dealersDeck
    };
  };

  //--------------------------------------------------------------
  //update page Settings
  //
  document.body.style.backgroundColor = oStudyConfig.studybackgroundColor;
  document.body.style.color = oStudyConfig.studyTextColor;
  oStudyConfig.loadTime = getDate();
  startDIV.style.display = "block";

};



function startQuestions() {
  myTicker = setInterval(changeQuestion, oStudyConfig.refreshRateMS);
  startDIV.style.display = "none";
};
function changeQuestion() {
  //console.log(oStudyConfig.sets[deckCounter].set.length);
  if (questionCounter < oStudyConfig.sets[deckCounter].set.length) {
    //console.log(oStudyConfig.sets[deckCounter].set[questionCounter].stimulus);
    setProperties(
      questionObj,
      oStudyConfig.sets[deckCounter].set[questionCounter].stimulus,
      oStudyConfig.sets[deckCounter].set[questionCounter].textColor,
      oStudyConfig.sets[deckCounter].set[questionCounter].backGroundColor
    );
    questionCounter++;
  } else {
    // clear the text area and stop the ticker
    clearInterval(myTicker);
    setProperties(questionObj, "+", oStudyConfig.studyTextColor, oStudyConfig.studybackgroundColor);
    answerDIV.style.display = "block";
  }
}
function updateAnswers() {
  if (answer.name < questionCounter) {
    oStudyConfig.sets[deckCounter].set[answer.name].responseTime = getDate(); //load answer into json
    oStudyConfig.sets[deckCounter].set[answer.name].response = answer.value; //load answer into json
    answer.value = ""; //reset form for next answer
    answer.focus();
    answer.name++; //this is why study.ejs input id=answer, requires name to be 0 and nothing else.

    if (answer.name == questionCounter) {
      //reset question counter for next questionBank and
      //reset answers
      questionCounter = 0;
      answer.name = 0;
      startDIV.style.display = "block";
      answerDIV.style.display = "none";
      deckCounter++;

      //if we have also reached the last question bank then stop
      if (deckCounter >= oStudyConfig.sets.length) {
        setProperties(questionObj, "+", "white", "black");
        answerDIV.style.display = "none";

        //Study is complete return to provider
        oStudyConfig.saveTime = getDate();

        //Update Page Form
        startDIV.style.display = "none";
        answerDIV.style.display = "none";

        //Write Study Result to Server
        //postData(questionBank);
        var data = JSON.stringify(oStudyConfig, null, 2);
        //console.dir(data);
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", sPath + "/results", true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        //Save data to server
        try {
          //console.log(data);
          xmlHttp.send(data);
          // console.log("sent now wait");
          xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 202) {
              completedStudy =
                "PROLIFIC_PID=" + oStudyConfig.PROLIFIC_PID +
                "&" + "STUDY_ID=" + oStudyConfig.STUDY_ID +
                "&" + "SESSION_ID=" + oStudyConfig.SESSION_ID;

              setProperties(questionObj, "", "white", "black");
              questionObj.style.display = "none";
              studyText.style.display = "block";
              studyText.outerHTML =
                '<p>You must click this <a href="' + sPath + '/sendCode/' + 
								studyName.getAttribute('value') + '?' + completedStudy +
                '">Complete Study</a> link, to complete the study and generate a Prolific.ac completion code.</p>';
            } else {
              // alert("readyState:" + xmlHttp.readyState + " Status:" + xmlHttp.status );
            }
          };
        } catch (err) {
          console.log("error: " + err);

        }
      }
    }
  }
}



function pickStimulus(deck, pickQty, sampleMode) {
  //console.log("PickStimulus Start");
  let privArray = [];
  let mode = sampleMode.toLowerCase();
  //console.log(sampleMode);
  try {
    switch (mode) {
      case "simple":
        /*
				random sample (without replacement)
				Based on Sunter (1977) paper we first shuffle deck then pick 0-to-Qty
				Sunter, A. B. (1977). "List Sequential Sampling with Equal or Unequal
				 Probabilities without Replacement". Applied Statistics. 26 (3). doi:10.2307/2346966.
				 JSTOR 10.2307/2346966
				*/
        deck = shuffleArray(deck);
        //let sampleIndex = getRandomIntInclusive(0,deck.length);
        for (let cardIndex = 0; cardIndex < pickQty; cardIndex++) {
          if (cardIndex > deck.length) {
            throw "pick quantity exceeds deck length";
          }
          privArray.push(deck[cardIndex]);
        }
        break;
      case "replace":
        //random sample (with replacement)
        //theory here is just to do a random pick from the unchanged array as many times as needed
        //the getRandomIntInclusive provides the randomness
        for (let cardIndex = 0; cardIndex < pickQty; cardIndex++) {
          if (cardIndex > deck.length) {
            throw "pick quantity exceeds deck length";
          }
          let rand = getRandomIntInclusive(0, deck.length - 1);
          privArray.push(deck[rand]);
        }
        break;
      case "sequential":
        //this is the same as the simple randomsample without the pre-shuffle, so cards are picked sequentially as
        //provided by the deckxx.json file
        for (let cardIndex = 0; cardIndex < pickQty; cardIndex++) {
          if (cardIndex > deck.length) {
            throw "pick quantity exceeds deck length";
          }
          privArray.push(deck[cardIndex]);
        }
        break;
      default:
        throw mode + " sampleMode not recognised. Try simple, replace or sequential";
    }
    return privArray;
  } catch (err) {
    privArray = "[" + err + "]";
    return privArray;
  }
};
function getFile(url) {
  //https://developers.google.com/web/fundamentals/primers/promises
  //console.log("url:" + url);
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    let req = new XMLHttpRequest();
    req.open("GET", url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        //console.dir(req.response);
        resolve(JSON.parse(req.response));
      } else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };
    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    // Make the request
    req.send();
  });
}
function shuffleArray(array) {
  // modern version of the Fisher–Yates shuffle algorithm:
  var j, x, i;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = array[i];
    array[i] = array[j];
    array[j] = x;
  }
  return array;
}
function setProperties(obj, textValue, textColor, textBackGroundColor) {
  //set properties on page
  obj.innerText = textValue;
  //obj.style.color = textColor;
  //obj.style.backgroundColor = textBackGroundColor;
  document.body.style.backgroundColor = textBackGroundColor;
  document.body.style.color = textColor;

  //console.log(obj.id + ": " + textValue);
}
function total(arr) {
  if (!Array.isArray(arr)) return;
  return arr.reduce((a, v) => a + v);
}
function getDate() {
  var d = new Date();
  return d.YYYYMMDDHHmmSSmsec();
}
function pad(number, length) {
  var str = "" + number;
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}
function getRandomIntInclusive(min, max) {
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}
function getGUID() {
  // then to call it, plus stitch in '4' in the third group
  var guid = (
    S4() +
    S4() +
    "-" +
    S4() +
    "-4" +
    S4().substr(0, 3) +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  ).toLowerCase();
  return guid;
}
function S4() {
  //work out what this does again
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
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
