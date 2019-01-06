// routes/index.js

// create new Router instance for api routes
const express 	    = require('express'); //express module
const router        = express.Router();
const fs	        = require('fs');
const favicon 	    = require('serve-favicon');
const manage        = require('./manage');
const ostm           = require('./ostm')
const mDates        = require(appRoot + '/utils/mDates.js');
// const mUtils        = require(appRoot + '/utils/mUtils.js');
const bunyan        = require('bunyan');

const log = bunyan.createLogger({
  name: "UOW_CogLab",
  streams: [
    {
      level: 'debug',
      path: appRoot + '/data/logs/routes_logs.json'
    },
    {
      level: 'info',
      stream: process.stdout
    }
  ],
  src: true,
});

router.use('/manage',       manage);
router.use('/ostm',         ostm);

router.use('/static',       express.static(appRoot  + '/public/static'));
router.use('/data/studies', express.static(appRoot  + '/public/data/studies'));
router.use('/data/decks',   express.static(appRoot  + '/public/data/decks'));
router.use(favicon(appRoot                          + '/public/static/favicon.ico'));

router.get('/', function(request, response) {
    //Home Page
    response.render('index');
    log.info('home.rendered');
});



router.get('*', function(request, response) {
/*
    Catchall all other routes
    this route is placed last in the code, so it is read last.
    if it is placed before any other routes those routes wont be handled
    */

//Log these as they may show nefarious behaviour and their attack vectors
    var sLog = mDates.getDate() + 
        ", source:" + request.ip +
        ", URL:" + request.originalUrl

    fs.appendFile(appRoot + '/data/logs/UnhandledPageCalls.log', sLog + "\r\n", function (err) {
        if (err) console.log(err);
    });

    var readStudy = fs.readFileSync(appRoot + '/404.html', 'utf8');
    response.send(readStudy);
    response.end;
});



module.exports = router;
