"use strict";
// require("@babel/polyfill");
require('jquery');
var sPath = "/ostm/manage";

/* not sure how I will use or delete this */
var setSizes = $("#setSizes");
var msgResult = $("#msgResult");
const TINYMCE_SETTINGS = {
  selector: "textarea",
  menubar: false,
  toolbar: "fullscreen",
  plugins: [
    'advlist autolink lists link image charmap print preview anchor textcolor ',
    'searchreplace visualblocks code fullscreen ',
    'insertdatetime media table paste wordcount'
  ],
  toolbar: 'fullscreen | undo redo | formatselect | fontselect fontsizeselect forecolor backcolor | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | paste code | removeformat',
  paste_as_text: true
}

/*
 *
 * DOM & JQUERY Functions
 *
 */
window.onerror = function (message, filename, linenumber) {
  var msg = message;
  alert(msg);
  console.log(msg + ", file: " + filename + ", line:" + linenumber);
  return true; // The exception is handled, don't show to the user.
};

$(document).ready(function () {
  let iRowCount = 1;
  tinymce.init(TINYMCE_SETTINGS);

  $("#pageCreate").click(function () {
    try {
      let pageCreate = {};
      pageCreate["studyName"] = rejectBlanks($("#studyName").val());
      pageCreate["pageName"] = rejectBlanks($("#pageName").val());

      tinyMCE.triggerSave();
      // let content = JSON.stringify(tinymce.get('pageContent').getContent());
      // console.log(content);
      pageCreate["pageContent"] = JSON.stringify(tinymce.get('pageContent').getContent());

      //POST Data to create Study
      let sPostPath = sPath + "/page/create";
      let request = $.ajax({
        method: "POST",
        url: sPostPath,
        contentType: "application/json",
        data: JSON.stringify(pageCreate)
      });

      request.done(function (msg) {
        alert("Page Created " + msg);
        return false;
      });

      request.fail(function (jqXHR, textStatus) {
        switch (jqXHR.status) {
          case 409:
            alert("This file already exists, it cannot be overwritten.");
            return false;
          default:
            alert("Operation Error:" + jqXHR.status + ", " + textStatus);
            return false;
        }
      });
    } catch (err) {
      alert(err);
    }
  });
});

/*
 *
 * Utility Functions
 *
 */
function rejectBlanks(element) {
  //console.log(element.id);
  switch (element) {
    case "":
    case null:
      throw "Error: " + element + ": is Null or empty string.";
    default:
      return element;
  }
}


$("#reject").on("click", function () {
  tinymce.EditorManager.execCommand('mceToggleEditor', true, textarea_id);
});

