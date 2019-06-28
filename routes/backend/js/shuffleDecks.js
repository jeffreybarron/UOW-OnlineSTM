"use strict";

/* ==========================================
* 
* Purpose: To create a shuffled version of all files in the decks[] array
* Usage: #>node shuffleDecks.js
*
*/

const fs = require("fs");
const sPath = "/Users/jeffbarron/dev/client/uow/OnlineSTM/bin/current/routes/ostm/data/resources/decks";
const decks = ["2-letters","3-letters","4-letters","4-letters","6-letters","7-letters","8-letters","9-letters","10-letters","11-letters"];


shuffleDecks();

async function shuffleDecks(){
  for (let i =0; i < decks.length; i++) {

    try {
  
      let deckURL = sPath + "/" + decks[i];
      console.log(deckURL);
      let deck = await readFile(deckURL + ".json");
      deck = JSON.parse(deck);
      deck.writable
      // console.dir(deck);
      let shuffled = shuffleArray(deck);
      
      let saved = await writeJSON(deckURL + "_shuffled.json", shuffled)

    } catch (err) {
      console.log(err);
    }
    

  };

}


function readFile(sURL) {
  return new Promise((resolve, reject) => {
    fs.readFile(sURL, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};
function writeJSON(sURL, data) {
  return new Promise((resolve, reject) => {
    var sFile = JSON.stringify(data, null, 2);
    fs.writeFile(sURL, sFile, "utf-8", function(err) {
      if (err) {
        //Deal with error
        return reject(err);
      } else {
        return resolve(data);
      }
    });
  });
};
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