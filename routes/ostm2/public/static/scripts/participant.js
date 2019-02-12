$( document ).ready(function() {
    $ ("#studyName").val(state.studyName);
    $ ("#PROLIFIC_PID").val(state.PROLIFIC_PID);
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

// $( "#back" ).on( "click", function() {
//   var result = back();
// });

