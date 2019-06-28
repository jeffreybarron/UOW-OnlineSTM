//=========================================
// Name: mUtils
// Description: General Uitilities
// Author: jeffreybarron.com
// Methods:
//  getDeckLength(url)
//  isTrue()
//  getGUID()
//=========================================
"use strict";
const fs			      = require('fs');

//=========================================
// Public Functions
module.exports = {

  getDeckLength : function (url) {
    var fDeck = fs.readFileSync(url, 'utf8');
    return Object.keys(JSON.parse(fDeck)).length;
  },
  isTrue : function(value) {
		//convert values to boolean type
		if (typeof(value) === 'string'){
        value = value.trim().toLowerCase();
    }
    switch(value){
        case true:
        case "true":
        case 1:
        case "1":
        case "on":
        case "yes":
            return true;
        default:
            return false;
    }
  },
  getGUID : function () {
  	// then to call it, plus stitch in '4' in the third group
  	var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
  	return guid;
  },
  clean : function (object) {
    //spent two days on this so far.. trying to figure out how to recurse
    //JSON structure and apply santize to it.
    //seem to be stuck on deckConfiguration.
    // if seen some very elegent methods but they all fall short on the
    //multiple key object of deckConfiguration
    // console.dir(object);
    if (Array.isArray(object)) {
      for (let n = 0; n < object.length;n++ ){
        let result = clean(object[n]);
        //object[n] = clean(object[n]);
      }
    } else if (typeof object === 'object'){
      for (let element in this.object ){
        object[element] = clean(object[element]);
      }
    } else {
      // its seems like we can recurse ok but it is putting the values
      // back into intact key:values within an object of an array we are stuck
      let wash = sanitizeHtml(object)
      return wash
    }
  }


}

//=========================================
// Private Functions
//***************************************************************
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
