var models = require('../models');
var Sequelize = require('sequelize');


exports.load = function (req, res, next, commentId) {
    models.Comment.findById(
        commentId,
        {
            include: [
                {model: models.User, as: 'Author'}
            ]
        }
    )
    .then(function (comment) {
        if (comment) {
            req.comment = comment;
            next();
        } else {
            throw new Error('No existe ningún comentario con Id=' + postId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};


//-----------------------------------------------------------


// MW que permite el paso solamente si:
//   - el usuario logeado es admin,
//   - el usuario logeado es el autor del comentario.
exports.loggedUserIsAuthorOrAdmin = function (req, res, next) {

    if (req.session.user.isAdmin ||
        req.session.user.id === req.comment.AuthorId) {
        next();
    } else {
        console.log('Ruta prohibida: el usuario logeado no es el autor del comentario, ni es un administrador.');
        res.send(403);
    }
};

/*
 * Comprueba que el usuario logeado es el author.
 */
exports.loggedUserIsAuthor = function (req, res, next) {

    if (req.session.user && req.session.user.id == req.comment.AuthorId) {
        next();
    } else {
        console.log('Operación prohibida: El usuario logeado no es el autor del comentario.');
        res.send(403);
    }
};


//-----------------------------------------------------------


exports.index = function (req, res, next) {
    throw new Error('TO BE DONE');
};


exports.show = function (req, res, next) {
    throw new Error('TO BE DONE');
};


// GET /posts/:postId/comments/new
exports.new = function (req, res, next) {

    var comment = {
        body: ''
        };

    res.render('comments/new', {
        comment: comment,
        post: req.post
    });
};


// POST /posts/:postId/comments
exports.create = function (req, res, next) {

    var comment = {
        body: req.body.body,
        AuthorId: req.session.user.id,
        PostId: req.post.id
    };

    // Guarda en la tabla Comments el nuevo comentario.
    models.Comment.create(comment)
    .then(function (comment) {
        req.flash('success', 'Comentario creado con éxito.');

        res.redirect('/posts/' + req.post.id);
    })
    .catch(Sequelize.ValidationError, function (error) {
        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        res.render('comments/new', {
            comment: comment,
            post: req.post
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear un comentario: ' + error.message);
        next(error);
    });
};


// GET /posts/:postId/comments/:commentId/edit
exports.edit = function (req, res, next) {

    res.render('comments/edit', {
        comment: req.comment,
        post: req.post
    });
};


// PUT /posts/:postId/comments/:commentId
exports.update = function (req, res, next) {

    req.comment.body = req.body.body;

    req.comment.save(['body'])
    .then(function (comment) {
        req.flash('success', 'Commentario actualizado con éxito.');
        res.redirect('/posts/' + req.post.id);
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        res.render('comment/edit', {
            comment: req.comment
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar un comentario: ' + error.message);
        next(error);
    });
};


// DELETE /posts/:postId/comments/:commentId
exports.destroy = function (req, res, next) {
    // Borrar el comentario:
    req.comment.destroy({force: true})
    .then(function () {
        req.flash('success', 'Comentario borrado con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al borrar un comentario: ' + error.message);
        next(error);
    });};
