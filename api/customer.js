var models = require('../models');

//-----------------------------------------------------------


// Autoload el cliente asociado a :customerId
exports.load = function (req, res, next, customerId) {

    models.Customer.findById(customerId, {
        include: [
            {
                model: models.Company,
                as: "MainCompanies",
                attributes: ['id', 'name'],
                through: {attributes: ['CustomerId']}
            }
        ],
        order: [[{model: models.Company, as: "MainCompanies"}, 'name', 'ASC']],
        attributes: {exclude: ['archived', 'createdAt', 'updatedAt', 'deletedAt']}
    })
    .then(function (customer) {
        if (customer) {
            req.customer = customer;
            next();
        } else {
            throw new Error('No existe ningún cliente con Id=' + customerId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};


//-----------------------------------------------------------


// GET /api/customers
exports.index = function (req, res, next) {

    var options = {
        where: {archived: false},
        order: [['name']],
        attributes: { exclude: ['archived', 'createdAt', 'updatedAt', 'deletedAt'] }
};

    models.Customer.findAll(options)
    .then(function (customers) {

        res.json(customers);

    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// GET /api/customers/:customerId
exports.show = function (req, res, next) {
    res.json(req.customer);
};


//-----------------------------------------------------------
