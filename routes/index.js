var express = require('express');
var router = express.Router();


var crmRouter = require('./crm');
var apiRouter = require('./api');


router.use('/api', apiRouter);

// Rutas que no empiezan por /api/
router.use(/^(?!\/api\/)/, crmRouter);

//-----------------------------------------------------------

module.exports = router;
