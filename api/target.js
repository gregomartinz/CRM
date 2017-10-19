var models = require('../models');
var Sequelize = require('sequelize');

//-----------------------------------------------------------

// Autoload el objetivo asociado a :targetId
exports.load = function(req, res, next, targetId) {

    models.Target.findById(targetId)
    .then(function(target) {
        if (target) {
            req.target = target;
            next();
        } else {
            throw new Error('No existe ningún objetivo con Id=' + targetId);
        }
    })
    .catch(function(error) { next(error); });
};


//-----------------------------------------------------------


// GET /api/visits/:visitId/targets
exports.index = function (req, res, next) {

    var options = {
        include: [
            {
                model: models.Company,
                attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
            },
            {
                model: models.TargetType,
                attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
            }
        ],
        order: [['CompanyId']],
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
        where: {VisitId: req.visit.id}
    };

    //----------------

    models.Target.findAll(options)
    .then(function (targets) {
        res.json(targets);
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------


// PUT /visits/:visitId/targets/:targetId
exports.update = function(req, res, next) {

    // Comprobar que el objetivo targetId es de la visita visitId
    if (req.target.VisitId !== req.visit.id) {
        console.log('API error: El objetivo ' + req.target.id + ' no pertenece a la visita ' + req.visit.id + '.');
        res.sendStatus(409);
        return;
    }


    // Coger el valor de success del body
    if (req.body.success) {
        var success = req.body.success === "nulo" ? null : req.body.success === "si";
        req.target.success = success;
    }

    // Coger el valor de notes del body
    if (req.body.notes) {
        req.target.notes = req.body.notes.trim();
    }

    req.target.save({fields: ["success", "notes"]})
    .then(function(target) {

        console.log('API: Objetivo ' + target.id + ' editado con éxito.');

        res.sendStatus(200);
    })
    .catch(Sequelize.ValidationError, function(error) {

        console.log('API: Errores en actualizacion:');
        for (var i in error.errors) {
            console.log('API error: ', error.errors[i].value);
        }

        res.sendStatus(409);
    })
    .catch(function(error) {
        console.log('API error: ' + error.message);
        next(error);
    });
};
