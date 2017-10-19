
var models = require('../models');
var Sequelize = require('sequelize');

//-----------------------------------------------------------

// Autoload el objetivo asociado a :targetId
exports.load = function(req, res, next, targetId) {

    models.Target.findById(targetId,
                            { include: [ models.Visit,
                                         models.Company,
                                         models.TargetType ],
                              order: [[ 'CompanyId' ]]
                            }
    )
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


// GET /visits/:visitId/targets
exports.index = function(req, res, next) {

    var options = {
        include: [  models.Company,
                    models.TargetType 
                 ],
        order: [[ 'CompanyId' ]],
        where: { VisitId: req.visit.id }
    };

    models.Target.findAll(options)
    .then(function(targets) {
        res.render('targets/index.ejs', { targets: targets,
                                          visit: req.visit
                                        });
    })
    .catch(function(error) {
        next(error);
    });
};


// GET /visits/:visitId/targets/:targetId
exports.show = function(req, res, next) {

    res.render('targets/show', { target: req.target,
                                 visit: req.visit
                               });
};

//-------------------------------------


// Auxiliar
// Devuelve una promesa que al cumplirse devuelve un array con la informacion 
// sobre tipos de objetivos y fabricas necesaria para construir un formulario de seleccion.
function infoOfTargetTypesCompanies() {

    return Sequelize.Promise.all([
        models.TargetType.findAll({order: [['name']]}) // Obtener info de tipos
        .then(function(targettypes) {
            return targettypes.map(function(targettype) {
                                    return {id:   targettype.id,
                                            name: targettype.name };
            });
        }),
        models.Company.findAll({order: [['name']]}) // Obtener info de fabricas
        .then(function(companies) {
            return companies.map(function(company) {
                                    return {id:   company.id,
                                            name: company.name };
            });
        })    
    ]);
}



// GET /visits/:visitId/targets/new
exports.new = function(req, res, next) {

    var target = {
        success: null,
        notes: "",
        TargetTypeId: 0,
        CompanyId: 0
    };

    infoOfTargetTypesCompanies()
    .spread(function(targettypes, companies) {
        res.render('targets/new', { target:         target,
                                    visit:          req.visit,
                                    targettypes:    targettypes, 
                                    companies:      companies });
    })
    .catch(function(error) {
        req.flash('error', 'Error al crear un objetivo: ' + error.message);
        next(error);
    });
};


// POST /visits/:visitId/targets/create
exports.create = function(req, res, next) {

    var success = req.body.success === "nulo" ? null : req.body.success === "si";

    var target = {
        success: success,
        notes: req.body.notes.trim(),
        TargetTypeId: Number(req.body.targettypeId) || 0,
        CompanyId: Number(req.body.companyId) || 0,
        VisitId: req.visit.id
    };

    Sequelize.Promise.all([
        // Comprobar que existe ls fabrica seleccionada:
        models.Company.findById(req.body.companyId),
        // Comprobar que existe el tipo de objetivo seleccionado:
        models.TargetType.findById(req.body.targettypeId)
    ])
    .spread(function (company, targettype) {
        var errors = [];
        if (!company) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "company", 'No se ha especificado ninguna fábrica existente.'));
        }
        if (!targettype) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "targettype", 'No se ha especificado ningún tipo de objetivo existente.'));
        }
        if (errors.length) {
            throw new Sequelize.ValidationError("Errores de Validación personalizados", errors);
        }
    })
    .then(function () {
        // Guarda en la tabla Targets el nuevo objetivo.
        return models.Target.create(target)
        .then(function (target) {
            req.flash('success', 'Objetivo creado con éxito.');

            res.redirect("/visits/" + req.visit.id);
        });
    })
    .catch(Sequelize.ValidationError, function (error) {
        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        infoOfTargetTypesCompanies()
        .spread(function (targettypes, companies) {
            res.render('targets/new', {
                target: target,
                visit: req.visit,
                targettypes: targettypes,
                companies: companies
            });
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear un objetivo: ' + error.message);
        next(error);
    });
};




// GET /visits/:visitId/targets/:targetId/edit
exports.edit = function(req, res, next) {

    var visit  = req.visit;
    var target = req.target;

    infoOfTargetTypesCompanies()
    .spread(function(targettypes, companies) {
        res.render('targets/edit', { target:         target,
                                     visit:          visit,
                                     targettypes:    targettypes, 
                                     companies:      companies });
    })
    .catch(function(error) {
        req.flash('error', 'Error al editar un objetivo: ' + error.message);
        next(error);
    });
};



// PUT /visits/:visitId/targets/:targetId
exports.update = function(req, res, next) {

    var success = req.body.success === "nulo" ? null : req.body.success === "si";

    req.target.success      = success;
    req.target.notes        = req.body.notes.trim();
    req.target.TargetTypeId = Number(req.body.targettypeId) || 0;
    req.target.CompanyId    = Number(req.body.companyId) || 0;


    Sequelize.Promise.all([
        // Comprobar que existe ls fabrica seleccionada:
        models.Company.findById(req.body.companyId),
        // Comprobar que existe el tipo de objetivo seleccionado:
        models.TargetType.findById(req.body.targettypeId)
    ])
    .spread(function (company, targettype) {
        var errors = [];
        if (!company) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "company", 'No se ha especificado ninguna fábrica existente.'));
        }
        if (!targettype) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "targettype", 'No se ha especificado ningún tipo de objetivo existente.'));
        }
        if (errors.length) {
            throw new Sequelize.ValidationError("Errores de Validación personalizados", errors);
        }
    })
    .then(function () {
        // Guarda el target en la BBDD
        return req.target.save({fields: ["success", "notes", "TargetTypeId", "CompanyId"]})
        .then(function (target) {

            req.flash('success', 'Objetivo editado con éxito.');

            res.redirect("/visits/" + req.visit.id);
        });
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        infoOfTargetTypesCompanies()
        .spread(function (targettypes, companies) {
            res.render('targets/edit', {
                target: req.target,
                visit: req.visit,
                targettypes: targettypes,
                companies: companies
            });
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar un objetivo: ' + error.message);
        next(error);
    });
};


// DELETE /visits/:visitId/targets/:targetId
exports.destroy = function(req, res, next) {

    req.target.destroy({force: true})
    .then( function() {
        req.flash('success', 'Objetivo borrado con éxito.');

        res.redirect("/reload");
    })
    .catch(function(error){
        req.flash('error', 'Error al borrar un objetivo: ' + error.message);
        next(error);
    });
};
