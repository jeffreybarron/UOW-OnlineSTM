"use strict";

$( document ).ready(function() {
    $( "#studyName" ).val(state.studyName);
    $( "#PROLIFIC_PID" ).val(state.PROLIFIC_PID);
    $( "#accept" ).focus();
});

$( "#accept" ).on( "click", function() {
  event.stopPropagation();
  //Participant has accepted the studyName and PROLIFIC_PID, increment view state and update page
  state.flow.views[state.getView].response = "accept";
  state.flow.views[state.getView].responseTime = getDate();
  var result = next()
});

$( "#reject" ).on( "click", function() {
  event.stopPropagation();
  //participant has rejected the study for some reason, pass them back to prolific without a completion code
  state.flow.views[state.getView].response = "reject";
  state.flow.views[state.getView].responseTime = getDate();
  var result = redirect()
});

// $( "#back" ).on( "click", function() {
  // event.stopPropagation();
  // var result = back();
// });


