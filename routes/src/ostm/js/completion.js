"use strict";
//require("@babel/polyfill");
require('jquery');
$(document).ready(function () {
  console.log("Completion Page Loaded");
  $("#accept").focus();

  try {

    $.ajax({
      method: "POST",
      url: "/ostm/API/issuecode",
      contentType: "application/json", //request data i.e. POSTed
      data: JSON.stringify(state),
      async: true,
      cache: false,
      dataType: "json", //response data, recieved from server
      success: function (response) {

        console.dir(response);
        $("#prolificCode").html(response.completionCode);

        state.completionCode = response.completionCode;
        state.completionURL = response.completionURL;
        state.redirectTimer = response.redirectTimer;
        state.flow.views[state.getView].pageRedirect = response.completionURL;
        state.rendered = getDate();

        saveState();
        if (response.redirectTimer <= "600000") {
          let myTicker = setInterval(() => {
            window.location.href = state.flow.views[state.getView].pageRedirect;
          }, parseInt(response.redirectTimer));
        }
        //stick timer event here

      },
      error: function (xhr) {
        //Do Something to handle error

        $(prolificCode).html("<p>Your study submission was invalid, a Prolific Completion Code could not be issued</p> ")

      }
    });

  } catch (err) {
    //alert("No Study ID specified in URL, cannot proceed!");
    // setProperties(researcherCopy, err, "", "");
    $("#researcherCopy").html(err)
    return false;
  }
});


$("#accept").on("click", function () {
  //participant has rejected the study for some reason, pass them back to prolific without a completion code
  window.location.replace(state.flow.views[state.getView].pageRedirect);

});
