
var models = require('../models');
var Sequelize = require('sequelize');

//-----------------------------------------------------------

// Autoload el user asociado a :userId
exports.load = function(req, res, next, userId) {

    models.User.findById(userId, {
        include: [
            {
                model: models.Attachment,
                as: 'Photo',
                attributes: ['id', 'url', 'mime']
            }
        ],
        order: [['fullname']],
        attributes: {
            exclude: ['token', 'password', 'salt', 'createdAt', 'updatedAt', 'deletedAt']
        }
    })
    .then(function (user) {
        if (user) {
            req.user = user;
            next();
        } else {
            req.flash('error', 'No existe el usuario con id=' + userId + '.');
            throw new Error('No existe userId=' + userId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};


//-----------------------------------------------------------

// GET /api/salesmen
exports.indexSalesmen = function (req, res, next) {

    index(req, res, next, {isSalesman: true});
}

// GET /api/users
exports.indexAll = function (req, res, next) {

    index(req, res, next, {});
}

// GET /api/users
function index(req, res, next, where) {

    var options = {};
    options.where = where;
    options.order = [['fullname']];
    options.include = [
        {
            model: models.Attachment,
            as: 'Photo',
            attributes: ['id', 'url', 'mime']
        }
    ];
    options.attributes = { exclude: ['token', 'password', 'salt', 'createdAt', 'updatedAt', 'deletedAt'] };


    models.User.findAll(options)
    .then(function (salesmen) {
        res.json(salesmen);
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// GET /api/users/:userId
exports.show = function (req, res, next) {
    res.json(req.user);
};


//-----------------------------------------------------------

