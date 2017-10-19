var models = require('../models');
var Sequelize = require('sequelize');

//-----------------------------------------------------------


// Devuelve una promesa que al cumplirse devuelve un array con la informacion
// de todas las fabricas existentes.
// Devuelve el id y el nombre de todas las fabricas.
exports.getAllCompaniesInfo = function () {

    return models.Company.findAll({
        order: [['name']]
    })
    .then(function (companies) {
        return companies.map(function (company) {
            return {
                id: company.id,
                name: company.name
            };
        });
    });
};

