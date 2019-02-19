"use strict";
//application state variables
/* // var oStudyConfig;*/
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
// var checkConsent = document.getElementById("checkConsent");
// var checkInstructions = document.getElementById("checkInstructions");




$( document ).ready(function() {
  try {

    var result = loadStudy()
    .then(resolved => {
      console.log(resolved);
    })
    .catch(err => {
      console.log(err);
    });

  } catch (err) {
    alert(err);
  }

});

$( "#accept" ).on( "click", function() {
  //Participant has accepted the studyName and PROLIFIC_PID, increment view state and update page
  state.flow.views[state.getView].result = "accept";
  var result = next()
});
$( "#reject" ).on( "click", function() {
  //participant has rejected the study for some reason, pass them back to prolific without a completion code
  state.flow.views[state.getView].result = "reject";

  var result = redirect()
});
// $( "#back" ).on( "click", function() {
//   var result = back();
// });


async function loadStudy() {
  //1- build the oStudyConfig variable for use by other functions
  //2-set the page initial state when loaded

  //NOTE: We setup the study on the client to offload the work from the server 

  //--------------------------------------------------------------
  //load config file
  var studyURL = sPath + "/resources/studies/" + state.studyName + ".json";
  var configFile = await getFile(studyURL)
  state.studyConfig = configFile;
  
  //--------------------------------------------------------------
  //Shuffle the deck\ stimulusFiles if needed
  //
  if (state.studyConfig.shuffleDecks === true) {
    state.studyConfig.deckConfiguration = shuffleArray(state.studyConfig.deckConfiguration).splice(0);
  }

  //--------------------------------------------------------------
  //Build a JSON onbject with Decks and there parameters
  //
  //first make a list of files
  var stimulusFiles = []
  for (let i = 0; i < state.studyConfig.deckConfiguration.length; i++) {
    stimulusFiles.push(sPath + "/resources/decks/" + state.studyConfig.deckConfiguration[i].deckName);
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
        state.studyConfig.deckConfiguration[i].pickQty,
        state.studyConfig.deckConfiguration[i].sampleMode
      )
    );
  };

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

  //--------------------------------------------------------------
  //shuffle all Cards in the Dealers Deck (TOTALLY Scramble everything)
  //
  if (state.studyConfig.shuffleAll === true) {
    dealersDeck = shuffleArray(dealersDeck);
  };

  //--------------------------------------------------------------
  //setup sets in the config file
  //
  //for each set
  state.studyConfig["sets"] = [];
  for (let iSetNumber = 0; iSetNumber < state.studyConfig.setSizes.length; iSetNumber++) {
    //add set frame
    state.studyConfig.sets.push(JSON.parse('{"set":[]}'));
    let setSize = state.studyConfig.setSizes[iSetNumber];

    //dish out the number of cards required from the front of the deck
    for (let i = 0; i < setSize; i++) {
      //push first element of dealersDeck onto the end of config file sets.set
      //console.log("iSetNumber:" + iSetNumber + ", setSize:" + setSize + ", i:" + i);
      state.studyConfig.sets[iSetNumber].set.push(dealersDeck[0]); //because zero is always the front
      dealersDeck.shift(); //remove first element of dealersDeck
    };
  };

  //--------------------------------------------------------------
  //update page Settings
  //
  document.body.style.backgroundColor = state.studyConfig.studybackgroundColor;
  document.body.style.color = state.studyConfig.studyTextColor;
  state.studyConfig.loadTime = getDate();
  startDIV.style.display = "block";

};


function startQuestions() {
  myTicker = setInterval(changeQuestion, state.studyConfig.refreshRateMS);
  startDIV.style.display = "none";
};


function changeQuestion() {
  //console.log(oStudyConfig.sets[deckCounter].set.length);
  if (questionCounter < state.studyConfig.sets[deckCounter].set.length) {
    //console.log(oStudyConfig.sets[deckCounter].set[questionCounter].stimulus);
    setProperties(
      questionObj,
      state.studyConfig.sets[deckCounter].set[questionCounter].stimulus,
      state.studyConfig.sets[deckCounter].set[questionCounter].textColor,
      state.studyConfig.sets[deckCounter].set[questionCounter].backGroundColor
    );
    questionCounter++;
  } else {
    // clear the text area and stop the ticker
    clearInterval(myTicker);
    setProperties(questionObj, "+", state.studyConfig.studyTextColor, state.studyConfig.studybackgroundColor);
    answerDIV.style.display = "block";
  }
}

function updateAnswers() {
  if (answer.name < questionCounter) {
    state.studyConfig.sets[deckCounter].set[answer.name].responseTime = getDate(); //load answer into json
    state.studyConfig.sets[deckCounter].set[answer.name].response = answer.value; //load answer into json
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
      if (deckCounter >= state.studyConfig.sets.length) {
        setProperties(questionObj, "+", "white", "black");
        answerDIV.style.display = "none";

        //Study is complete return to provider
        state.studyConfig.saveTime = getDate();

        //Update Page Form
        startDIV.style.display = "none";
        answerDIV.style.display = "none";

        //Write Study Result to Server
        //postData(questionBank);
        var data = JSON.stringify(state, null, 2);
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

              $("body").removeAttr("style");
              state.flow.views[state.getView].response = "complete";
              state.flow.views[state.getView].responseTime = getDate();
              var result = next()

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



/* ================================================================
* 
* Utility Functions
*
*/
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



