"use strict";

//application state variables
var myTicker;
var blockCounter = 0;
var setCounter = 0;
var stimulusCounter = 0;

//document elements
var start_DIV = document.getElementById("start_DIV");
var start_DIV = document.getElementById("start_DIV");
var show_DIV = document.getElementById("show_DIV");
var answer_DIV = document.getElementById("answer_DIV");
var target = document.getElementById("target");
var answer = document.getElementById("answer");

$( document ).ready(function() {
  try {
    var result = loadStudy()
    .then(resolved => {
      // console.log(resolved);
      start_DIV.style.display = "block";
      show_DIV.style.display = "none";
      answer_DIV.style.display = "none";
      document.getElementById("start_btn").focus(); 

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
    //end switch case
    }
  //end block
  }
  document.body.style.backgroundColor = state.studyConfig.studybackgroundColor;
  document.body.style.color = state.studyConfig.studyTextColor;
  state.studyConfig.loadTime = getDate();

};


function startQuestions() {
  
  myTicker = setInterval(changeQuestion, state.studyConfig.blocks[blockCounter].refreshRateMS);
  start_DIV.style.display = "none";
  show_DIV.style.display = "block";
  answer_DIV.style.display = "none";
  
};


function changeQuestion() {

  if (stimulusCounter < state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli.length) {
    //hide the ticker 
    start_DIV.style.display = "none";
    show_DIV.style.display = "block";
    answer_DIV.style.display = "none";
    setProperties(
      target,
      state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[stimulusCounter].stimulus,
      state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[stimulusCounter].textcolor,
      state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[stimulusCounter].backgroundcolor
    );
    stimulusCounter++;

  } else {
    // clear the text area and stop the ticker
    clearInterval(myTicker);
 
    start_DIV.style.display = "none";
 
    show_DIV.style.display = "none";
    setProperties(target, "+", state.studyConfig.studyTextColor, state.studyConfig.studybackgroundColor);
 
    $( ".middle" ).css("background-color", state.studyConfig.studybackgroundColor);
    $( ".middle" ).css("color", state.studyConfig.studyTextColor);
    answer_DIV.style.display = "block";
 
 
    answer.focus();
  }
};

function updateAnswers() {
  let answerCounter = parseInt(answer.name);
  if (answer.name < stimulusCounter) {
    let timeStamp = Date.now();
    state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[answerCounter].timeStamp = timeStamp; //load answer into json
    state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[answerCounter].responseTime = getDate(timeStamp); //load answer into json
    state.studyConfig.blocks[blockCounter].sets[setCounter].stimuli[answerCounter].response = answer.value; //load answer into json
    answer.value = ""; //reset form for next answer
    answer.focus();
    answer.name++; //this is why study.ejs input id=answer, requires name to be 0 and nothing else.
  }

  //if we have reached the last stimulus in the set then increment the set
  $("#stimulusCounter").html(parseInt(answer.name) + 1);
  if (answer.name == stimulusCounter) {
    //reset answers
    stimulusCounter = 0;
    answer.name = 0;
    
    start_DIV.style.display = "block";
    show_DIV.style.display = "none";
    answer_DIV.style.display = "none";

    setCounter++;
    $("#stimulusCounter").html(1);
    document.getElementById("start_btn").focus();
  }

  //if we have reached the last set in the block?, then increment the block
  if (setCounter >= state.studyConfig.blocks[blockCounter].sets.length) {
    // alert("end of block:" + blockCounter);
    if ( state.studyConfig.blocks[blockCounter].blockPopUp.length > 1 ) {
      $("#modal-body").html(state.studyConfig.blocks[blockCounter].blockPopUp);
      toggleModal()

      start_DIV.style.display = "block";
      show_DIV.style.display = "none";
      answer_DIV.style.display = "none";
      document.getElementById("start_btn").focus();

    }
  
    blockCounter++;
    setCounter = 0; //new block new sets
  }

  //set focus on answer input box
  // document.getElementById("answer").focus();

  //if we have also reached the last stimulus bank then stop
  if (blockCounter >= state.studyConfig.blocks.length) {
    saveStudy();
  }


};




function saveStudy(){
  setProperties(target, "+", "white", "black");
  start_DIV.style.display = "none";
  show_DIV.style.display = "none";
  answer_DIV.style.display = "none";

  //Study is complete return to provider
  state.studyConfig.saveTime = getDate();

  //Update Page Form
  
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
 
  $( ".middle" ).css("background-color", textBackGroundColor);
  $( ".middle" ).css("color", textColor);
  
}


/*==========================================
* 
* Modal Javascript
*
*/
var modal = document.getElementById("modal");

document.getElementById("modal-close").addEventListener("click", event => {
  modalClose()
});
window.addEventListener("click", event => {
  if (event.target === modal) {
    modalClose();
  }
});

function modalClose(){
  /* needed to add btn disable because you can still press enter key activating the button with the modal open */
  document.getElementById("submit_btn").disabled = false; 
  document.getElementById("start_btn").disabled = false;
  modal.style.display = "none";
  $( "#modal-body" ).html("");
  $( "#buttonStart" ).focus();
}
function toggleModal() {
  document.getElementById("submit_btn").disabled = true;
  document.getElementById("start_btn").disabled = true;
  modal.style.display = 'flex';
  // $( "#modal-continue" ).focus();
}

