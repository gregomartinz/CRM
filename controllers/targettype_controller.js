
var models = require('../models');
var Sequelize = require('sequelize');

var moment = require('moment');

//-----------------------------------------------------------


// Autoload el tipo de objetivo asociado a :targettypeId
exports.load = function(req, res, next, targettypeId) {

    models.TargetType.findById(targettypeId, 
                          { order: [[ 'name' ]]
                          })
    .then(function(targettype) {
        if (targettype) {
            req.targettype = targettype;
            next();
        } else { 
            throw new Error('No existe ningún tipo de objetivo con Id=' + targettypeId);
        }
    })
    .catch(function(error) { next(error); });
};


//-----------------------------------------------------------

// GET /targettypes
exports.index = function(req, res, next) {

    var options = {};
    options.where = {};
    options.order = [['name']];

    models.TargetType.findAll(options)
    .then(function(targettypes) {
        res.render('targettypes/index.ejs', {targettypes: targettypes});
    })
    .catch(function(error) {
        next(error);
    });
};



// GET /targettypes/:targettypeId
exports.show = function(req, res, next) {

    res.render('targettypes/show', {targettype: req.targettype});
};


// GET /targettypes/new
exports.new = function(req, res, next) {

    var targettype = models.TargetType.build({ name: "" });
    res.render('targettypes/new', { targettype: targettype });
};


// POST /targettypes/create
exports.create = function(req, res, next) {

    var targettype = { name:  req.body.name.trim() };

    // Guarda en la tabla Companies la nueva fabrica.
    models.TargetType.create(targettype)
    .then(function(targettype) {
        req.flash('success', 'Tipo de objetivo creado con éxito.');   

        res.redirect("/targettypes/" + targettype.id);
    })
    .catch(Sequelize.ValidationError, function(error) {
        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        };
  
        res.render('targettypes/new', { targettype: targettype });
    })
    .catch(function(error) {
        req.flash('error', 'Error al crear un tipo de objetivo: ' + error.message);
        next(error);
    }); 
};




// GET /targettypes/:targettypeId/edit
exports.edit = function(req, res, next) {

    var targettype = req.targettype;  // autoload

    res.render('targettypes/edit', { targettype: targettype });
};



// PUT /targettypes/:targettypeId
exports.update = function(req, res, next) {

    req.targettype.name  = req.body.name.trim();

    req.targettype.save({fields: ["name"]})
    .then(function(targettype) {

        req.flash('success', 'Tipo de objetivo editado con éxito.'); 

        res.redirect("/targettypes/" + targettype.id);
    })
    .catch(Sequelize.ValidationError, function(error) {

      req.flash('error', 'Errores en el formulario:');
      for (var i in error.errors) {
          req.flash('error', error.errors[i].value);
      };

      res.render('targettypes/edit', { targettype: req.targettype });
    })
    .catch(function(error) {
      req.flash('error', 'Error al editar un tipo de objetivo: '+error.message);
      next(error);
    });
};

//-----------------------------------------------------------

// DELETE /targettypes/:targettypeId
exports.destroy = function(req, res, next) {

    // Borrar la fabricatipo:
    req.targettype.destroy()
    .then(function() {
        req.flash('success', 'Tipo de objetivo borrado con éxito.');
        res.redirect("/reload");
    })
    .catch(function(error){
        req.flash('error', 'Error al borrar un tipo de objetivo: ' + error.message);
        next(error);
    });
};



//-----------------------------------------------------------
