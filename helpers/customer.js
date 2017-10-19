
var models = require('../models');
var Sequelize = require('sequelize');

//-----------------------------------------------------------

// Devuelve una promesa que al cumplirse devuelve un array con la informacion
// de todos los clientes existentes.
// Devuelve el id, el code y el name de todos los clientes.
exports.getUnarchivedCustomersInfo = function() {

    return models.Customer.findAll({
        order: [['name']],
        where: {archived: false}
    }) // Obtener info de clientes
    .then(function (customers) {
        return customers.map(function (customers) {
            return {
                id: customers.id,
                code: customers.code,
                name: customers.name
            };
        });
    });
};


