

var models = require('../models');
var Sequelize = require('sequelize');

//-----------------------------------------------------------


// Devuelve una promesa que al cumplirse devuelve un array con informacion
// de todos los vendedores.
// Devuelve su id y nombre.
exports.getAllSalesmenInfo = function () {

    return models.User.findAll({
        where: {isSalesman: true},
        order: [['fullname']]
    })
    .then(function (salesmen) {
        return salesmen.map(function (salesman) {
            return {
                id: salesman.id,
                fullname: salesman.fullname
            };
        });
    });
};
