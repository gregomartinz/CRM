
var models = require('../models');
var Sequelize = require('sequelize');

//-----------------------------------------------------------


// Devuelve una promesa que al cumplirse devuelve un array con informacion
// de todos los tipos de objetivos.
// Devuelve su id y nombre.
exports.getAllTargetTypesInfo = function () {

    return models.TargetType.findAll({
        order: [['name']]
    })
    .then(function (targetTypes) {
        return targetTypes.map(function (targetType) {
            return {
                id: targetType.id,
                name: targetType.name
            };
        });
    });
};
