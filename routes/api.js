
var express = require('express');
var router = express.Router();

var tokenApi = require('../api/token');
var customerApi = require('../api/customer');
var companyApi = require('../api/company');
var visitApi = require('../api/visit');
var targetApi = require('../api/target');
var targetTypeApi = require('../api/targetType');
var userApi = require('../api/user');

//-----------------------------------------------------------

router.all('*', function(req, res, next) {

    console.log("=== API ===>", req.url);
    next();
});

// El token de acceso es necesario para todas las llamadas.
router.all('*', tokenApi.tokenRequired);

//-----------------------------------------------------------

// Autoload de parametros
router.param('userId',       userApi.load);
router.param('customerId',   customerApi.load);
router.param('companyId',    companyApi.load);
router.param('visitId',      visitApi.load);
router.param('targetId',     targetApi.load);
router.param('targettypeId', targetTypeApi.load);

//-----------------------------------------------------------

// Definicion de rutas para los usuarios
router.get('/users',
    userApi.indexAll);

router.get('/salesmen',
    userApi.indexSalesmen);

router.get('/users/:userId(\\d+)',
    userApi.show);

//-----------------------------------------------------------

// Definicion de rutas para los clientes
router.get('/customers',
    customerApi.index);

router.get('/customers/:customerId(\\d+)',
    customerApi.show);

//-----------------------------------------------------------

// Definicion de rutas para las fabricas
router.get('/companies',
    companyApi.index);

router.get('/companies/:companyId(\\d+)',
    companyApi.show);

//-----------------------------------------------------------

// Definicion de rutas para las visitas
router.get('/visits/flattened',
    visitApi.indexFlattened);

router.get('/customers/:customerId(\\d+)/visits/flattened',
    visitApi.indexFlattened);

router.get('/users/:userId(\\d+)/visits/flattened',
    visitApi.indexFlattened);

router.get('/salesmen/:userId(\\d+)/visits/flattened',
    visitApi.indexFlattened);

router.get('/users/:userId(\\d+)/customers/:customerId(\\d+)/visits/flattened',
    visitApi.indexFlattened);

router.get('/salesmen/:userId(\\d+)/customers/:customerId(\\d+)/visits/flattened',
    visitApi.indexFlattened);

//-------

// Definicion de rutas para las visitas
router.get('/visits',
    visitApi.index);

router.get('/customers/:customerId(\\d+)/visits',
    visitApi.index);

router.get('/users/:userId(\\d+)/visits',
    visitApi.index);

router.get('/salesmen/:userId(\\d+)/visits',
    visitApi.index);

router.get('/users/:userId(\\d+)/customers/:customerId(\\d+)/visits',
    visitApi.index);

router.get('/salesmen/:userId(\\d+)/customers/:customerId(\\d+)/visits',
    visitApi.index);

//-----------------------------------------------------------

router.get('/visits/:visitId(\\d+)',
    visitApi.show);

router.get('/visits/:visitId(\\d+)/targets',
    targetApi.index);

//-----------------------------------------------------------

/*

router.put('/visits/:visitId(\\d+)',
    visitApi.salesmanIsLoggedUser_Required,
    visitApi.update);


router.put('/visits/:visitId(\\d+)/targets/:targetId(\\d+)',
    visitApi.salesmanIsLoggedUser_Required,
    targetApi.update);
*/

//-----------------------------------------------------------

// Definicion de rutas para los tipos de objetivo
router.get('/targetTypes',
    targetTypeApi.index);

router.get('/targetTypes/:targettypeId(\\d+)',
    targetTypeApi.show);

//-----------------------------------------------------------

// Si llego aqui, la ruta pedida no esta soportada.
router.all('*', function(req, res, next) {

    var err = new Error('Ruta API no encontrada');
    err.status = 404;
    next(err);
});

//----------------------------------------------------

// Error
router.use(function(err, req, res, next) {

    var emsg = err.message || "Error Interno";

    console.log(emsg);

    res.status(err.status || 500)
    .send({error: emsg})
    .end();
});

//----------------------------------------------------

module.exports = router;

//-----------------------------------------------------------
