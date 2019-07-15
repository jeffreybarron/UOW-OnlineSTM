In Progress
==========================================================


Known ISSUES
==========================================================
* make change to code issue pack prevent from hit back button

Feature Requests
==========================================================
* Documentation 
  * (1) List of folders for steve (file structure dependent)
* Study run-time 
  * (2) Preflight – Redirect to non-prolific source, when it iniated by the launch page 
* (4) study URL would be nice to change to /ostm/study/[studyName]?[Params...]

* save after every set completion
* add open event for csv writestream
* change to MIT license???
* save particpant SQLOutput to combined out for [study, allTime] : Jeff
* update the manage/guide page to accept a tinyMCE.html page into a DIV

* Feature: Participation Log file
  rowID, IP, Date\Time, studyName, ProlificID, STUDYID, SESSIONID, A/B Test

* Major Feature: A/B testing, (actually ABCD).
  * log Particpation to studyName_log.json
  * id, prolificID, StudyID, sessionID, DateTime, eventType(nameCheckRender, consentRender, instructionRemder, blockStart(blockID), blockEnd(blockID), studyComplete, studySaved, codeIssued)
  * Use Particpation Log File to determine last issued AB test then issue next in list, in rotation.
  * i.e each new participant is assigned a test A, B or C 
  * this will need to work for A Only and A* Z
  * use 2 dimensional Array to configure, persist and to present

Test | Sets 
---- | ----
A | 1,2,3
B | 3,2,1
C | 2,3,1

* line up the logs so they are all in the same order
  * IP, file, function, task, msg, data
* implement some security protocols
* Add user basic management
* port to AWS Serverless
  * this may require moving to mongoDB? due data persistance changes with services
* add deck analysis? use R!
  * See bin/CSV Output Template.xlsx


============================
VERSION History
============================


1.3.x-master
============================

## changes in 1.3.1
* all the errors created by merging 1.2.6 and 1.1.8 have been resolved
* moved study buttons down away from stimulus prompt
* changed colour or start button to green
* arranged button layout so start and submit buttons are in roughly the same spot
 when they appear, this make the UI experience smoother

## changes in 1.3.2
* remove <h2>You are finished</h2> from completion screen because the participant
must still click the link and this text may confuse them into closing the
browser. if this happens their study will not be saved to the server.
* removed studyText key:value which is now redundant in the configuration file.


1.3.3-StudyCreator
============================
## changes in 1.3.3-StudyCreator
labour time: 40hrs
Added Study Setup Feature http://uowcoglab.com/study/new
Note this still requires sence and significant amount of checking from researcher
also this is an alpha release so UI feedback when stuff goes wrong is lacking
and its a bit buggy. (like the rest of the solution)

## changes in 1.3.4-StudyCreator
* added available cards counter to study/new page to help researchers

## changes in 1.3.5-StudyCreator
* Removed studyTitle
* set background colour and font to change with every card for study
* set start and between set colours
* UI feedback that the study has been created, or there was a problem
* Code Clean up kind of

## changes in 1.3.6-StudyCreator
* implemented SXX sanitization,
  * but deckConfiguration is not cleaning. **
* handle if consent\instructions are not ticked
* add another page at the start to confirm prolific ID
* also box copy text in a white box with round edges

## changes in 1.3.8-workingcopy
* modularise code for maintainability (HALF)
  * have completed the management module and utils modules
  * figured out problem of module paths and roots
  * plan is to add another layer in here so we can use other providers.. (later)
  * current module structure
    \routes\index.js
    \-\routes\manage\index.js
    \-\-\routes\manage\create
    \-\-\routes\manage\list (future)
    \-\-\routes\manage\export (future)
    \-\-\routes\manage\delete (future)
    \-\lab\index.js
    \-\-\lab\index.js
    \-\-\-\lab\participant
    \-\-\-\lab\consent
    \-\-\-\lab\instructions
    \-\-\-\lab\study
    \-\-\-\lab\complete

## changes in 1.3.9-workingcopy
* completed modularisation

## changes in 1.3.10-workingcopy
* move public accessible files into public folder
* fixed error url catchall and home page response*  moved to routes
* Feature add, manage/study/list

## changes in 1.3.11-workingcopy
* make a manage home page with links to functions - use a GUID for access

## changes in 1.3.12-workingcopy
* Trying to add duplicate feature. stuck with await functions... Arrggg

## changes in 1.3.13-workingcopy_v3
* Duplicate and error handling is for duplicate is working, its not very elegant but it mostly works.
* Feature add, duplicate study for prolific test fire adherants


1.4.0-master
============================
## changes in 1.4.1-workingcopy
* implement BUNYAN logging\ debuggings
* change lab route to OSTM
* Changed package.json name from OSTM to CogLab

## changes in 1.4.2-workingcopy
* feature add, Deck Creator pages

## changes in 1.4.3-Jeffcopy
* improved logging

## changes in 1.4.5-workingcopy
* improved logging
* fixed letterbox menu on manage pages
* cleaned up some javascript

## changes in 1.4.5-workingcopy
* fixed errors arising from code cleanup

## changes in 1.4.6-workingcopy
* copy colour from previous stimulus on newDeck Tool

## changes in 1.4.7
* get rid of syncronous code
  * added promise/await aysnc code to OSTM
  * add recheck logging for OSTM
  * add promise/await to management features
* rename client js files to standard
* remove alert boxs and replaced with on page notifications
  * deckNew
  * studyNew
  * studyDuplicate


1.5.0-master
============================
## changes in 1.5.0
* Major Release

## changes in 1.5.1
*  add more detailed logging

## changes in 1.5.2
* fix deckNew txbackgroundcolour incorrectly copied


1.6.0-master
============================
## changes in 1.6.0
* move manage under OSTM - used modular app pattern for routing instead of express.router() as Router didnt allow the level of seperation I wanted, particullay with views and filepaths

## changes in 1.6.1
* remove commenting from javascript on redirecting pages

## changes in 1.6.2
* tidyup ostm.js loadstudy() function


2.0.0-workingcopy
============================
Comment: Major Structural Change, from here on we will be building decks at design time and shuffle at run time.
## changes upto 2.0.0-workingcopy
* further module Setup
* creating new study create form

EDIT: introduced JQUERY to some of the code section, replacing older code with more parsimonious version
will begin rewriting code blocks with JQUERY from this point as it reads better and is much simpler to use than vanilla javascript

Note: learn Vanilla Javascript first then JQUERY.

## changes upto 2.0.1-workingcopy
* Added pageCreate for New Blocks design- run-time module
  *  pageCreate implements 
* updated EJS Structure on OSTM2
* modules are now working effectively so we have ostm and ostm2 versions which can be accessed at the same time, this provides a methology to add completly new tests later.
* have completely re-writter studyCreate.js and the route to match
  *  new page/create POST route picks the cards from BLOCKS into sets and saves them in the config file at design time only shuffling will take place at run-time for ostm2

Note: OSTM remains on the old model and ostm2 is fork where new development is taking place. once excepted ostm will be removed and ostm2 renamed to ostm.

## changes upto 2.0.2-workingcopy
* got custom state and template engine working /ostm2/data/config/statFlow.json
  I probably should have gone with REACT and REDUX though

* User browses to /ostm2/study?studyName=20190101-jb957-stroop01&PROLIFIC_PID=GUID01.... etc
Base.ejs page is rendered and original query string is passed along to the client by rending a script tag containing data stored in the footer withing <script>, and a default view of 0 is issued.
if the post is success then the pageContent will be updated with the pageView just requested
an ajax call is made to /API/page to collect the page content
finally an ajax script get will activate this pages load functions if needed

## changes upto 2.0.3-workingcopy
* Refering to notes on 2.0.2-workingcopy about going with REACT\Redux, I've spent a few days on React Crash course, and while React looks good, it is overkill for this site and requires running both a nodejs and react server, meaning a config change on NGINX and basically excessive re-achiterure.
* bouyed by the fact that react, vue, and angular are all able to update the client DOM at managed to figure out that mearly injecting html with innerHTML wont work and that I need to add HTML elements to bind them to the DOM as anything more than dumb text (not able to work with)

#### IMPORTANTLY
1. I have managed to be able to create initiate a state data structure, open a html template page, then 
add content to the page based on the state.
2. I have therefore created a bespoke singlepage website, with simple state management, using only nodejs\express\ejs, 
  * ostm2/base.ejs                         renders wrapper HTML Template /ostm2/study
  * ostm2/index.js                         express routering for 
  * ostm2/data/config/stateflow.json       State Management Object
  * ostm2/pages/*.html                     pageContent files, contain each rendered pages content
  * ostm2/public/static/main.css           css for base.ejs wrapper
  * ostm/public/static/main.js             main Javascript that controls pageContent\css\script Loading\unloading

* in the next version, I'll work on page transition to the next item in the stateflow and unload the old script\css before loading the new.
* Converted this document from .txt to .md Markdown

## changes upto 2.0.4-workingcopy
* added consent and instructions page
  * Need to work on saving results from these
* started adding study page

## changes upto 2.0.5-workingcopy
* making the stateflow work, there are a lot of structural changes in this update that will need to be examined to understand... thats my lazy way of saying, im tied and a lot has changed but Im getting closerto to it working under the new model.

## changes upto 2.0.6-workingcopy
* views through to study(3) inclusive are working but study view needs to be coded now 
* css is handled, I can start the major job of re-working the study into this new model

## changes upto 2.0.7-workingcopy - 18th Feb 2019
* Now working on the old structure (no between set pages) again, but with the new page layout and view model implement.
* This now needs a fair bit of testing, to debug and apply appropriate error handling, and logging, however that will be deferred and implemented once the new study structure is implemented —coming up next— which will include between set pages.

## changes upto 2.0.8-workingcopy - 19th Feb 2019
* coded loadStudy()
* and also make sure shuffling at run time functions are updated.
  * shuffle cards within sets
  * shuffle cards across sets
  * shuffle sets in a block
  * shuffle blocks in study

# Changes upto 2.1.0-workingcopy - 19th Feb 2019
* setup block and set structure
  * change refresh rate per block
  * shuffling -> blocks, sets per block, stimulus within sets, and across sets per block.
  * Per Block -> changes to refresh rate and insert post-block pages if configured
  * removed ostm original and renamed ostm2 to ostm

# Changes upto 2.1.1-master - 19th Feb 2019
* No Changes, just adding some data and test result to work with and tested it all works after removing legacy files
* workingcopy will now merged to master

# Changes upto 2.1.2-workingcopy - 22nd Feb 2019
* made participant ID changeable on study entry, this is to facilitate student and classrooms
* Popup displayed after each block if supplied.
* Put comment on studyCreate to show that 0 is always a practice block
* Fixation cross in centre
* Counter id on top of enter box
* Block shuffle don’t shuffle 0 because 0 is a practice
* Move and rename preflight to /ostm/launch

# Changes upto 2.1.3-workingcopy - 23rd Feb 2019
* set focus to input box for each offer of input box
* submit on [enter] keypress
* fix study creation for python output
..* Made sure it flows through all code.
..added stimuli array to each set and gave each set an id
* update study create to select pre-written tinyMCE conset page
* update study create to select pre-written tinyMCE instruction page
* Feature: Differentiate build time settings from run time settings with colour change
* Feature: Add Shuffle Cards within Deck for each Participant
* re-add logging to express routes

# Changes upto 2.1.4-workingcopy - 24rd Feb 2019
* Added output to 3 CSV Layouts [wide, wide_grouped, forSQL]
* Added timestamp to studyoutput to make date time analysis easier.

# Changes upto 2.1.5-workingcopy - 25rd Feb 2019
* need to fix position of input box to be in the same location as the stimulus

## Release Version 2.1.5-master
* Handover to Client

# Release Version 2.1.6-workingcopy
* contains merge conflicts

# Release Version 2.1.7-master
* merge conflicts resolved in master

# change-history-2.1.8
* update createDeck, swapped background colour and text defaults
* Added tool to shuffle stimulus files (decks), creating a new file_shuffled.json
  * /utils/shuffleDecks.js
* ran /utils/shuffleDecks.js creatin the new shuffled stimulus files.
* changed naming pattern of this version file, as changing name according to branch was a bit problematic
* removed stop eventpropogation code from each of the event blocks in \routes\ostm\public\static\sripts
* delete Jeff's practice.json file
* update studyCreate default stimulus file to prac3letter12.json

# change-history-2.1.9
* (1) Fix backgroundcolor, and text color not updating properly on white background, black text
* Management page 
  * (1) Make preflight menu item open new tab 
* (1) Put buttons on top of table to allow multiple quick row creation 
* Create Decks 
  * (3) Add delete stimulus rows (medium) 
  * (5) Add insert stimulus row (low priority) 
* Create study 
  * (2) Put note on prolific ID, that if using prolific for study you must go get the code now (before saving the study) 
* Study run-time 
  * (1) Participant page, not saving participant id and passing to consent etc 

# change-history-2.1.10
* (1) entry box for 6 showing after modal closure.. need to fix show/hide
  * added button disabler on modal open to prevent enter key starting next section while modal still open
* Result 
  * (1) Wide_grouped 
    * New row per block and new row per set 

# change-history-2.1.11
* File structure 
  * (1) Move code directory to Public  

# change-history-2.1.12
* firefox raises error, check email from st - Unable to Re-produce?
* File structure 
  * (1) Move config flow directory elsewhere 
    * Ie we are keeping concerns isolated 
      * Study files 
      * Result files 
      * And codesrc

# change-history-2.1.13
* Added better error checking for studyCreate, when sum setSizes > file.length
* study Create
  * sets cannot exceed stimuli in file
* Code File (jeff)
  * add redirect timer configuration, > 600000 = Disabled
  * add redirect path and redirect timer to studyCreate page
* Completion Page
  * configure redirect path and timer from code file.

## change-history-2.1.14 - Release Candidate 28th Feb 2019
* added stream.on("open") for better file handling
* added second output file for a consolidation of all participants in CSV\SQL Format

## change-history-2.1.15 - Release Candidate 27 June 2019
* update syncronised with changes made directly on production server

2.2.0-workingcopy - 28 June 2019
============================
This version adds webpack and bable to uglify production code and make suitable for older browsers
## change-history
* Re-arranged file and routing structures
* all ejs files are now in folders named views for their relevant route
* NB there is only one module at present in the routes it is called 'ostm'
* all assets that are published publically are in the 'public' folder for its module
e.g. 
/routes/public/
/routes/public/css
/routes/public/js
/routes/public/tinymce/       (this level only)
/routes/ostm/
/routes/ostm/public/
routes/ostm/manage/
routes/ostm/manage/public/
* private data for each module goes in 'data' folder directly under the module level folder
eg.
/routes/ostm/data/
/routes/ostm/data/resources/...
/routes/ostm/data/results/...
* NB. each layer of the routing folders has one (1) index.js, I prefer this to be the only FILE in this folder, its the file where the expressjs routing takes place (serving up web urls)

## change-history-2.2.1 - 28 June 2019
* consolidate public folders and create new /src reader for adding webpack/babel
* is this structure /routes/src/<modulename>/ contains css, js, etc for each module and this webpack will need to be setup to handle each module seperately, in addition to the root which is simply <routes> 
* next version will be adding webpack
* also in the this iteration, im intending to process each js seperately, and plan to combine later

## change-history-2.2.2 - 28 June 2019
* Adding webpack and Babel
  "devDependencies": {
    "babel-core": "^6.26.3",
    "babel-loader": "^8.0.6",
    "babel-preset-env": "^1.7.0",
    "webpack": "^4.35.0"
  }
  
## change-history-2.2.3
* Progress update on webpack implementation

## change-history-2.2.4 - 2 July 2019
* webpack implementation complete, no loaders added
* npm run-scripts created for webpack
* The webpack implementation required a lot of re-architecting, due to webpack runing code from within eval()
* this change ment that jquery needed to be added to webpack config and some previously public variables and functions needed to be made global by prepending adding windows or document
* any major re-write should re-achitect the public js for each page to be within modules 

## change-history-2.2.5 - 3 July 2019
* fixed last block modal popup doesnt wait. - added timer event (hack) to keep open for 6 seconds 
* Installed Babel 7 via Webpack

## change-history-2.2.6 - 3 July 2019 - Jeff Barron
* updated browser warnings on first page of ostm study
* FIXED manage.createStudy: Add Row btn doesnt work on firefox and ie
Error: Syntax error, unrecognized expression: unsupported pseudo: read-only
* FIXED launch doesnt work on non-chrome
* FIXED manage.createStudy: when creating a study and you click on “add a row” it duplicates the row above for most settings but not the shuffle mode.  Can you change it so that the shuffle mode is carried over from the row above as well, please? Steve.

## change-history-2.2.7 - 15 July 2019 - Jeff Barron
* shortened last modal popup wait timer from 6 seconds to 3.5s as Im concerned the long timer causes user confusion and increases likelyhood of user hitting refresh or the back button which currently destroys there results
* Cleaned up log creation so log files are more managable

## change-history-2.2.8 - 15 - Jeff Barron
* previous version introduced file saving with .JSON instead of json.. dont forget linux is cap sensative, recompiled and rerelease