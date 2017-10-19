var models = require('../models');


//-----------------------------------------------------------


// Autoload la fabrica  asociada a :companyId
exports.load = function (req, res, next, companyId) {

    models.Company.findById(companyId, {
        order: [['name', 'ASC']],
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    })
    .then(function (company) {
        if (company) {
            req.company = company;
            next();
        } else {
            throw new Error('No existe ninguna fábrica con Id=' + companyId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------


// GET /api/companies
exports.index = function (req, res, next) {

    var options = {
        order: [['name']],
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    };

    //----------------

    models.Company.findAll(options)
    .then(function (companies) {
        res.json(companies);
    })
    .catch(function (error) {
        next(error);
    });
};


//-----------------------------------------------------------

// GET /api/companies/:companyId
exports.show = function (req, res, next) {
    res.json(req.company);
};

//-----------------------------------------------------------
