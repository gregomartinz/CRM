var models = require('../models');


//-----------------------------------------------------------


// Autoload el tipo de objetivo asociado a :targettypeId
exports.load = function (req, res, next, targettypeId) {

    models.TargetType.findById(targettypeId, {
        order: [['name', 'ASC']],
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    })
    .then(function (targettype) {
        if (targettype) {
            req.targettype = targettype;
            next();
        } else {
            throw new Error('No existe ningún tipo de onjetivo con Id=' + targettypeId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------


// GET /api/targetTypes
exports.index = function (req, res, next) {

    var options = {
        order: [['name']],
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    };

    //----------------

    models.TargetType.findAll(options)
    .then(function (targetTypes) {
        res.json(targetTypes);
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// GET /api/targetTypes/:targettypeId
exports.show = function (req, res, next) {
    res.json(req.targettype);
};

//-----------------------------------------------------------
