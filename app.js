// server/app.js


console.log("Load: app.js")
"use strict";
process.title = "UOW-CogLab";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const path = require("path");
global.appRoot = path.resolve(__dirname + '/routes/');

app.use('/', require('./routes'));

app.set("trust proxy", true); //https://expressjs.com/en/guide/behind-proxies.html
// app.set("view engine", "ejs");
// // app.set("views", [
// //   __dirname + "/routes",
// //   __dirname + "/routes/ostm",
// //   __dirname + "/routes/ostm/manage"
// // ]);


app.use("/public", express.static(path.join(__dirname, '/routes/frontend/public')));
app.use(favicon(appRoot + "/public/favicon.ico"));
app.use(bodyParser.json()); // for parsing application/json

// app.use((request, response, next) => {
//   //this is used as a sanitizer for sxx attacks
//   //needs to be tested again.
//   // for (let propName in request.body){
//   //    request.body[propName] = request.sanitize(request.body[propName]);
//   // }
//   // next();
// });

const server = app.listen(3000, () => {
  //Note: dont output logs here unless its COMPLETELY necessary, this called constantly and logging may crash app.
  //console.log('server is running at %s .', server.address().port);
});

module.exports = app;
