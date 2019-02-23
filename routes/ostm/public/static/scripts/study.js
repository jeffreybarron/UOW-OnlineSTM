"use strict";

//application state variables
var myTicker;
var blockCounter = 0;
var setCounter = 0;
var stimulusCounter = 0;

var questionCounter = 0;
var deckCounter = 0;

//document elements
var stimulus = document.getElementById("stimulus");
var answerDIV = document.getElementById("answerDIV");
var answer = document.getElementById("answer");
var startDIV = document.getElementById("startDIV");


$( document ).ready(function() {
  try {
    var result = loadStudy()
    .then(resolved => {
      // console.log(resolved);
      document.getElementById("buttonStart").focus(); 
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

$( "#answer").on('keypress',function(e) {
    if(e.which == 13) {
        // alert(this.value);
        updateAnswers()
    }
});


async function loadStudy() {
  var studyURL = sPath + "/resources/studies/" + state.studyName + ".json";
  var configFile = await getFile(studyURL)
  state.studyConfig = configFile;
    // shuffle blocks in study
  if (state.studyConfig.shuffleBlocks === true) {
    // state.studyConfig.blocks = shuffleArray(state.studyConfig.blocks).splice(0);
    if (state.studyConfig.blocks.length > 0) {
      //use splice function to seperate item zero from the rest, and shuffle it at the same time
      let shuffled = shuffleArray(state.studyConfig.blocks.splice(1,state.studyConfig.blocks.length));
      /* now push each item in the shuffled list back on to the block (which at this point 
      * has only item remaining from the last operation) */
      for (let n = 0; n < shuffled.length; n++) {
        state.studyConfig.blocks.push(shuffled[n]);
      }
      //output to console if you want to check it..
      // console.dir(state.studyConfig.blocks);
    }
  }
  for ( let i = 0; i < state.studyConfig.blocks.length; i++ ){
    switch (state.studyConfig.blocks[i].shuffleMode) {
      case "sets": // shuffle sets in a block
        state.studyConfig.blocks[i].sets = shuffleArray(state.studyConfig.blocks[i].sets).splice(0);
        break;
      case "within": // shuffle cards within sets
        for ( let j = 0; j < state.studyConfig.blocks[i].sets.length; j++ ){
          // state.studyConfig.blocks[i].sets[j].set = shuffleArray(state.studyConfig.blocks[i].sets[j].set).splice(0);
          state.studyConfig.blocks[i].sets[j].stimuli = shuffleArray(state.studyConfig.blocks[i].sets[j].stimuli).splice(0);
        }
        break;
      case "across": //shuffle cards across sets
        //load all cards, from all sets (in this block) into an array
        let blockDeck = [];
        for ( let j = 0; j < state.studyConfig.blocks[i].sets.length; j++ ){
          for ( let k = 0; k < state.studyConfig.blocks[i].sets[j].stimuli.length; k++ ){
            blockDeck.push(state.studyConfig.blocks[i].sets[j].stimuli[k]);
          //end stimulus
          }
        //end set
        }
        //shuffle array
        blockDeck = shuffleArray(blockDeck).splice(0)
        //put shuffled cards into sets again
        for ( let j = 0; j < state.studyConfig.blocks[i].sets.length; j++ ){
          for ( let k = 0; k < state.studyConfig.blocks[i].sets[j].stimuli.length; k++ ){
            state.studyConfig.blocks[i].sets[j].stimuli[k] = blockDeck[0];
            blockDeck.shift();
          //end stimulus
          }
        //end set
        }         
        break;
      default:
        //shuffleMode = "no", so do nothing
    //end switch case
    }
  //end block
  }
  document.body.style.backgroundColor = state.studyConfig.studybackgroundColor;
  document.body.style.color = state.studyConfig.studyTextColor;
  state.studyConfig.loadTime = getDate();
  startDIV.style.display = "block";
};


function startQuestions() {
  myTicker = setInterval(changeQuestion, state.studyConfig.blocks[blockCounter].refreshRateMS);
  startDIV.style.display = "none";
};


function changeQuestion() {

  if (stimulusCounter < state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli.length) {
    //hide the ticker 
    
    setProperties(
      stimulus,
      state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[stimulusCounter].stimulus,
      state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[stimulusCounter].textColor,
      state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[stimulusCounter].backGroundColor
    );
    stimulusCounter++;

  } else {

    // clear the text area and stop the ticker
    clearInterval(myTicker);
    setProperties(stimulus, "+", state.studyConfig.studyTextColor, state.studyConfig.studybackgroundColor);
    answerDIV.style.display = "block";
    answer.focus();

  }
  
}

function updateAnswers() {
  let answerCounter = parseInt(answer.name);
  if (answer.name < stimulusCounter) {
    state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[answerCounter].responseTime = getDate(); //load answer into json
    state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[answerCounter].response = answer.value; //load answer into json
    answer.value = ""; //reset form for next answer
    answer.focus();
    answer.name++; //this is why study.ejs input id=answer, requires name to be 0 and nothing else.
  }

  //if we have reached the last stimulus in the set then increment the set
  $("#stimulusCounter").html(parseInt(answer.name) + 1);
  if (answer.name == stimulusCounter) {
    //reset answers
    // alert("end of set:" + setCounter);
    stimulusCounter = 0;
    answer.name = 0;
    answerDIV.style.display = "none";
    startDIV.style.display = "block";
    setCounter++;
    $("#stimulusCounter").html(1);
    document.getElementById("buttonStart").focus();
  }

  //if we have reached the last set in the block?, then increment the block
  if (setCounter >= state.studyConfig.blocks[blockCounter].sets.length) {
    // alert("end of block:" + blockCounter);
    if ( state.studyConfig.blocks[blockCounter].blockPopUp.length > 1 ) {
      $("#modal-body").html(state.studyConfig.blocks[blockCounter].blockPopUp);
      toggleModal()
    }
  
    blockCounter++;
    setCounter = 0; //new block new sets
  }

  //set focus on answer input box
  document.getElementById("answer").focus();

  //if we have also reached the last stimulus bank then stop
  if (blockCounter >= state.studyConfig.blocks.length) {
    saveStudy();
  }


};




function saveStudy(){
  setProperties(stimulus, "+", "white", "black");
  answerDIV.style.display = "none";

  //Study is complete return to provider
  state.studyConfig.saveTime = getDate();

  //Update Page Form
  startDIV.style.display = "none";
  answerDIV.style.display = "none";

  //Write Study Result to Server
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


/* ================================================================
* 
* Utility Functions
*
*/
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


/*==========================================
* 
* Modal Javascript
*
*/
var modal = document.getElementById("modal");
function toggleModal() {
  modal.style.display = 'flex';
  $( "#modal-continue" ).focus();
}
document.getElementById("modal-close").addEventListener("click", event => {
  modalClose()
});
function modalClose(){
  modal.style.display = "none";
  $( "#modal-body" ).html("");
  $( "#buttonStart" ).focus();
}

window.addEventListener("click", event => {
  if (event.target === modal) {
    modal.style.display = "none";
    $("#modal-body").html();
  }
});
