"use strict";

$( document ).ready(function() {

  try {
  
      $.ajax({
      method: "POST",
      url: "/ostm2/API/issuecode",
      contentType: "application/json", //request data i.e. POSTed
      data: JSON.stringify(state),
      async: true,
      cache: false,
      dataType: "json", //response data, recieved from server
      success: function(response) {
        
        console.dir(response);
        $("#prolificCode").html(response.completionCode);
        state.completionCode = response.completionCode;
        state.flow.views[state.getView].pageRedirect = response.completionURL;
        state.rendered = getDate();
        saveState();
        let myTicker = setInterval(() => {
          window.location.replace(state.flow.views[state.getView].pageRedirect)
        }, 30000);

        //stick timer event here

      },
      error: function(xhr) {
        //Do Something to handle error

        $(prolificCode).html("<p>Your study submission was invalid, a Prolific Completion Code could not be issued</p> ")

      }
    });

  } catch (err) {
    //alert("No Study ID specified in URL, cannot proceed!");
    // setProperties(researcherCopy, err, "", "");
    $ ("#researcherCopy").html(err)
    return false;
  }
});


$( "#accept" ).on( "click", function() {
  event.stopPropagation();
  //participant has rejected the study for some reason, pass them back to prolific without a completion code
  window.location.replace(state.flow.views[state.getView].pageRedirect);

});
