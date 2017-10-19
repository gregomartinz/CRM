
var models = require('../models');
var Sequelize = require('sequelize');

// GET /reports
exports.index = function (req, res, next) {

    var companies = [];

    // Obtener todas las fabricas:
    models.Company.findAll({order: [['name']]})
    .then(function (_companies) {
        companies = _companies;
    })
    .then(function () {
        res.render('reports/index.ejs',
            {
                companies: companies
            });
    })
    .catch(function (error) {
        next(error);
    });
};
