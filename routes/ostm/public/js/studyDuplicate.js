/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./routes/src/ostm/js/studyDuplicate.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./routes/src/ostm/js/studyDuplicate.js":
/*!**********************************************!*\
  !*** ./routes/src/ostm/js/studyDuplicate.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n// require(\"@babel/polyfill\");\n\nvar sPath = '/ostm/manage'\nconst siteAssets = '/public/'\n\nvar currentStudyName = document.getElementById(\"currentStudyName\");\nvar new_studyName = document.getElementById(\"new_studyName\");\n\nvar studybackgroundColor = document.getElementById(\"studybackgroundColor\");\nvar studyTextColor = document.getElementById(\"studyTextColor\");\nvar shuffleDecks = document.getElementById(\"shuffleDecks\");\nvar shuffleAll = document.getElementById(\"shuffleAll\");\nvar setSizes = document.getElementById(\"setSizes\");\nvar refreshRateMS = document.getElementById(\"refreshRateMS\");\nvar deckConfiguration = document.getElementById(\"deckConfiguration\");\nvar msgResult = document.getElementById(\"msgResult\");\n\nvar oStudyConfig = {};\nvar pageHandler = main();\n\nwindow.updateOnChange = function () {\n  // console.log(\"Selected: \", document.getElementById(\"source_studyName\").value);\n  var oData = upDateTable(document.getElementById(\"source_studyName\").value);\n}\nwindow.studyDuplicate = function () {\n  try {\n    let data = {\n      \"currentStudyName\": currentStudyName.innerText,\n      \"source_studyName\": document.getElementById(\"source_studyName\").value,\n      \"new_studyName\": new_studyName.value\n    };\n    let sUrl = sPath + \"/study/duplicate\";\n    let xmlHttp = new XMLHttpRequest();\n\n    xmlHttp.open(\"POST\", sUrl, true);\n    xmlHttp.setRequestHeader(\"Content-Type\", \"application/json\");\n    //Save data to server\n\n    xmlHttp.send(JSON.stringify(data, null, 2));\n    xmlHttp.onreadystatechange = function () {\n      if (xmlHttp.readyState == 4 && xmlHttp.status == 201) {\n        // alert(\"Study Created!\\n\\nWe suggest you, click ok, and leave this page open until you've finished setting up.\");\n        msgResult.innerHTML =\n          \"<p>Study Created!</><p>We suggest you:<ul><li>leave this page open</li><li>open a new browser tab</li><li>Do any other setup on the new tab</li></ul></p>\";\n        msgResult.style.display = \"block\";\n        msgResult.className = \"msgResult-success\";\n        return true;\n      } else if (xmlHttp.readyState == 4 && xmlHttp.status == 404) {\n        // alert(\"A required file on the server was not found, contact your supervisor\");\n        msgResult.innerHTML =\n          \"<p>A required file on the server was not found, contact your supervisor</p>\";\n        msgResult.style.display = \"block\";\n        msgResult.className = \"msgResult-error\";\n        return false;\n      } else if (xmlHttp.readyState == 4 && xmlHttp.status == 409) {\n        // alert(\"You must choose another studyName, this one is already in use\");\n        msgResult.innerHTML =\n          \"<p>You must choose another studyName, this one is already in use</p>\";\n        msgResult.style.display = \"block\";\n        msgResult.className = \"msgResult-error\";\n        return false;\n      } else if (xmlHttp.readyState == 4 && xmlHttp.status == 412) {\n        // alert(\"You must choose another studyName, this one is already in use\");\n        msgResult.innerHTML = xmlHttp.responseText;\n        msgResult.style.display = \"block\";\n        msgResult.className = \"msgResult-error\";\n        return false;\n      } else if (xmlHttp.readyState == 4 && xmlHttp.status == 500) {\n        // alert(\"Server returned a general error state, go tell mum.\");\n        msgResult.innerHTML = xmlHttp.responseText;\n        msgResult.style.display = \"block\";\n        msgResult.className = \"msgResult-error\";\n        return false;\n      } else {\n        //alert(\"studyPOST, Error at server: xmlHttp.readyState: \" + xmlHttp.readyState + \", xmlHttp.Status: \" + xmlHttp.status);\n      }\n    };\n  } catch (err) {\n    msgResult.innerHTML = \"<p>So here is the thing, we dont actually know what happened. Some kind of error I guess!!</p>\";\n    msgResult.style.display = \"block\";\n    msgResult.className = \"msgResult-error\";\n  }\n}\n\n\n// purpose of the following code is only to fill in the details in the table.\nfunction main() {\n  //console.log(\"main on load function\");\n  var oData = upDateTable(document.getElementById(\"source_studyName\").firstElementChild.text);\n}\nfunction upDateTable(studyName) {\n  //get study details, but ignore copy\n  getFile(\"/ostm/manage/studies/\" + studyName)\n    .then(function (configFile) {\n      var oStudyConfig = configFile;\n      studybackgroundColor.innerText = oStudyConfig.studybackgroundColor;\n      currentStudyName.innerText = oStudyConfig.studyName;\n      studyTextColor.innerText = oStudyConfig.studyTextColor;\n      shuffleBlocks.innerText = oStudyConfig.shuffleBlocks;\n      // deckConfiguration.innerHTML = JSON.stringify(oStudyConfig.blocks, undefined, 2);\n    })\n    .catch(function (err) {\n      // catch any error that happened so far\n      currentStudyName.innerText = \"Error: \" + err.message;\n      studybackgroundColor.innerText = \"Something went wrong!\";\n      studyTextColor.innerText = \"It is likely your file no longer exists.\";\n      console.log(\"Error: \" + err.message);\n    });\n  return true;\n}\n\n\nfunction getFile(url) {\n  return new Promise(function (resolve, reject) {\n    let req = new XMLHttpRequest();\n    req.open(\"GET\", url);\n    req.onload = function () {\n      if (req.status == 200) {\n        resolve(JSON.parse(req.response));\n      } else {\n        reject(Error(req.statusText));\n      }\n    };\n    // Handle network errors\n    req.onerror = function () {\n      reject(Error(\"Network Error\"));\n    };\n    // Make the request\n    req.send();\n  });\n}\n\n//# sourceURL=webpack:///./routes/src/ostm/js/studyDuplicate.js?");

/***/ })

/******/ });