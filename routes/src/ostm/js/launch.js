// ostm/public
"use strict";
require("@babel/polyfill");;
require('jquery');

$(document).ready = function () {
  let params = new URLSearchParams(document.location.search.substring(1));
  if (params.get("studyName") !== 'undefined') {
    document.getElementById("studyName").value = params.get("studyName");
  };
};

window.create_UUID = function () {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};
window.executePreFlight = function () {
  var studyName = document.getElementById("studyName").value;
  var STUDY_ID = document.getElementById("STUDY_ID").value;
  var SESSION_ID = document.getElementById("SESSION_ID").value;


  var sTestFlightParams = `PROLIFIC_PID=${create_UUID()}&STUDY_ID=${STUDY_ID || 'Classroom'}&SESSION_ID=${SESSION_ID || 'study'}`;
  // console.log(sTestFlightParams);
  try {
    var sURL = '/ostm/study?studyName=' + studyName + "&" + sTestFlightParams;
    console.log(sURL);
    window.location.href = sURL
  } catch (err) {
    consol.log("err" + err);
    return false;
  }
};