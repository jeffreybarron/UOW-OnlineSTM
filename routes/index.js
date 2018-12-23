// routes/index.js

// create new Router instance for api routes
const express 	    = require('express'); //express module
const router        = express.Router();

const manage        = require('./manage');
const lab           = require('./lab')

router.use('/manage', manage);
router.use('/lab', lab);



module.exports = router;
