$( document ).ready(function() {
    $ ("#studyName").val(state.studyName);
    $ ("#PROLIFIC_PID").val(state.PROLIFIC_PID);

  try {
    //console.log("ostm.js.loadConsent, studyID: " + studyName.getAttribute('value'))
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", sPath + "/resources/studies/" + state.studyName + "_instructions.html", true);
    xmlHttp.setRequestHeader("Content-Type", "text/html");
    xmlHttp.send();
    xmlHttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        $ ("#researcherCopy").html(this.responseText)
        // var researcherCopy = document.getElementById("researcherCopy");
        // researcherCopy.innerHTML = this.responseText;
      }
    };
  } catch (err) {
    //alert("No Study ID specified in URL, cannot proceed!");
    // setProperties(researcherCopy, err, "", "");
    $ ("#researcherCopy").html(err)
    return false;
  }



});

$( "#accept" ).on( "click", function() {
  //Participant has accepted the studyName and PROLIFIC_PID, increment view state and update page
  state.stateFlowConfig.views[state.getView].result = "accept";
  var result = next()
});

$( "#reject" ).on( "click", function() {
  //participant has rejected the study for some reason, pass them back to prolific without a completion code
  state.stateFlowConfig.views[state.getView].result = "reject";

  var result = redirect()
});

$( "#back" ).on( "click", function() {
  var result = back();
});

