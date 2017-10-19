var models = require('../models');
var Sequelize = require('sequelize');
var paginate = require('./paginate').paginate;
var cloudinary = require('cloudinary');

var moment = require('moment');

//-----------------------------------------------------------

// GET /trash
exports.index = function (req, res, next) {

    var options = {
        paranoid: false,
        where: {deletedAt: {$not: null}}
    };

    Sequelize.Promise.all([
        models.Customer.count(options),     // Contar clientes
        models.Visit.count(options),        // Contar visitas
        models.Company.count(options),      // Contar fabricas
        models.TargetType.count(options),   // Contar targettypes
        models.User.count(options),         // Contar usuarios
        models.Post.count(options)          // Contar posts
    ])
    .spread(function (customersCount,
                      visitsCount,
                      companiesCount,
                      targettypesCount,
                      usersCount,
                      postsCount) {

        res.render("trash/index", {
            customersCount: customersCount,
            visitsCount: visitsCount,
            companiesCount: companiesCount,
            targettypesCount: targettypesCount,
            usersCount: usersCount,
            postsCount: postsCount
        });
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// GET /trash/companies
exports.companies = function (req, res, next) {

    var options = {
        paranoid: false,
        where: {deletedAt: {$not: null}}
    };

    options.order = [['deletedAt', 'DESC']];

    //----------------

    models.Company.findAll(options)
    .then(function (companies) {
        res.render('trash/companies.ejs', {
            companies: companies,
            moment: moment
        });
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// POST /trash/companies/:companyId_wal
exports.companyRestore = function (req, res, next) {

    var companyId = req.params["companyId_wal"];

    var options = {where: {id: companyId}};

    // Restaurar (sacar de la papelera) la fabrica:
    models.Company.restore(options)
    .then(function () {
        req.flash('success', 'Fábrica restaurada con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al restaurar una fábrica: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

// DELETE /trash/companies/:companyId_wal
exports.companyDestroy = function (req, res, next) {

    var companyId = req.params["companyId_wal"];

    var options = {
        where: {id: companyId},
        force: true
    };

    // Destruir definitivamente (no se guarda en la papelera) la fabrica:
    models.Company.destroy(options)
    .then(function () {
        req.flash('success', 'Fábrica destruida con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al destruir una fábrica: ' + error.message);
        next(error);
    });
};


//-----------------------------------------------------------

// GET /trash/customers
//
// Lista los clientes existentes en la papelera.
exports.customers = function (req, res, next) {

    var options = {
        paranoid: false,
        where: {deletedAt: {$not: null}}
    };

    models.Customer.count(options)
    .then(function (count) {

        // Paginacion:
        var items_per_page = 50;

        // La pagina a mostrar viene en la query
        var pageno = parseInt(req.query.pageno) || 1;

        // Datos para obtener el rango de datos a buscar en la BBDD.
        var pagination = {
            offset: items_per_page * (pageno - 1),
            limit: items_per_page
        };

        // Crear un string con el HTML que pinta la botonera de paginacion.
        // Lo añado como una variable local de res para que lo pinte el layout de la aplicacion.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        return pagination;
    })
    .then(function (pagination) {

            options.offset = pagination.offset;
            options.limit = pagination.limit;

            options.order = [['deletedAt', 'DESC']];

            return models.Customer.findAll(options);
        }
    )
    .then(function (customers) {

        res.render(
            'trash/customers', {
                customers: customers,
                moment: moment
            });
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// POST /trash/customers/:customerId_wal
exports.customerRestore = function (req, res, next) {

    var customerId = req.params["customerId_wal"];

    var options = {where: {id: customerId}};

    // Restaurar (sacar de la papelera) el cliente:
    models.Customer.restore(options)
    .then(function () {
        req.flash('success', 'Cliente restaurado con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al restaurar un cliente: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

// DELETE /trash/customers/:customerId_wal
exports.customerDestroy = function (req, res, next) {

    var customerId = req.params["customerId_wal"];

    var options = {
        where: {id: customerId},
        force: true
    };

    // Destruir definitivamente (no se guarda en la papelera) el cliente:
    models.Customer.destroy(options)
    .then(function () {
        req.flash('success', 'Cliente destruido con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al destruir un cliente: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

// GET /trash/targettypes
exports.targettypes = function (req, res, next) {

    var options = {
        paranoid: false,
        where: {deletedAt: {$not: null}}
    };

    options.order = [['deletedAt', 'DESC']];

    //----------------


    models.TargetType.findAll(options)
    .then(function (targettypes) {
        res.render('trash/targettypes', {
            targettypes: targettypes,
            moment: moment
        });
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// POST /trash/targettypes/:targettypeId_wal
exports.targettypeRestore = function (req, res, next) {

    var targettypeId = req.params["targettypeId_wal"];

    var options = {where: {id: targettypeId}};

    // Restaurar (sacar de la papelera) el tipo de objetivo:
    models.TargetType.restore(options)
    .then(function () {
        req.flash('success', 'Tipo de objetivo restaurado con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al restaurar un tipo de objetivo: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

// DELETE /trash/targettypes/:targettypeId_wal
exports.targettypeDestroy = function (req, res, next) {

    var targettypeId = req.params["targettypeId_wal"];

    var options = {
        where: {id: targettypeId},
        force: true
    };

    // Destruir definitivamente (no se guarda en la papelera) un tipo de objetivo:
    models.TargetType.destroy(options)
    .then(function () {
        req.flash('success', 'Tipo de objetivo destruido con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al destruir un tipo de objetivo: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

// GET /trash/users
exports.users = function (req, res, next) {

    var options = {
        paranoid: false,
        where: {deletedAt: {$not: null}},
        include: [
            {model: models.Attachment, as: 'Photo'}
        ]
    };

    options.order = [['deletedAt', 'DESC']];

    //----------------

    models.User.findAll(options)
    .then(function (users) {
        res.render('trash/users', {
            users: users,
            moment: moment
        });
    })
    .catch(function (error) {
        next(error);
    });
};


//-----------------------------------------------------------

// POST /trash/users/:userId_wal
exports.userRestore = function (req, res, next) {

    var userId = req.params["userId_wal"];

    var options = {where: {id: userId}};

    // Restaurar (sacar de la papelera) un usuario:
    models.User.restore(options)
    .then(function () {
        req.flash('success', 'Usuario restaurado con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al restaurar un usuario: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

// DELETE /trash/users/:userId_wal
exports.userDestroy = function (req, res, next) {

    var userId = req.params["userId_wal"];

    // Buscar el usuario borrado y cargar tambien su foto:
    models.User.findById(userId, {
        include: [
            {model: models.Attachment, as: 'Photo'}
        ],
        paranoid: false,
    })
    .then(function (user) {
        if (!user) {
            throw new Error('No existe ningún usuario borrado con Id=' + userId);
        }

        // ¿Hay foto?
        if (!user.Photo) {
            return user;
        }

        // Borrar la foto en Cloudinary.
        cloudinary.api.delete_resources(user.Photo.public_id);

        // Borrar el attachment.
        return user.Photo.destroy()
        .then(function () {
            return user;
        });
    })
    .then(function (user) {
        // borrar el usuario:

        return user.destroy({force: true});
    })
    .then(function () {
        req.flash('success', 'Usuario destruido con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al destruir un usuario: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------


// GET /trash/visits
exports.visits = function (req, res, next) {

    var options = {
        paranoid: false,
        where: {deletedAt: {$not: null}}
    };

    //----------------

    models.Visit.count(options)
    .then(function (count) {

        // Paginacion:

        var items_per_page = 25;

        // La pagina a mostrar viene en la query
        var pageno = parseInt(req.query.pageno) || 1;


        // Crear un string con el HTML que pinta la botonera de paginacion.
        // Lo añado como una variable local de res para que lo pinte el layout de la aplicacion.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);


        options.offset = items_per_page * (pageno - 1);
        options.limit = items_per_page;

        options.include = [
            models.Target,
            models.Customer,
            {
                model: models.User,
                as: "Salesman",
                include: [{model: models.Attachment, as: 'Photo'}]
            }
        ];

        options.order = [['deletedAt', 'DESC']];

        return models.Visit.findAll(options)
    })
    .then(function (visits) {

        res.render('trash/visits', {
            visits: visits,
            moment: moment
        });
    })
    .catch(function (error) {
        next(error);
    });
};


//-----------------------------------------------------------

// POST /trash/visits/:visitId_wal
exports.visitRestore = function (req, res, next) {

    var visitId = req.params["visitId_wal"];

    var options = {where: {id: visitId}};

    // Restaurar (sacar de la papelera) la visita:
    models.Visit.restore(options)
    .then(function () {
        req.flash('success', 'Visita restaurada con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al restaurar una visita: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

// DELETE /trash/visits/:visitId_wal
exports.visitDestroy = function (req, res, next) {

    var visitId = req.params["visitId_wal"];

    var targetsOptions = {
        where: {VisitId: visitId},
        force: true
    };

    var visitOptions = {
        where: {id: visitId},
        force: true
    };

    // Destruir definitivamente (no se guarda en la papelera) los objetivos de la
    // visita y la visita:
    Promise.all([
        models.Target.destroy(targetsOptions),
        models.Visit.destroy(visitOptions)
    ])
    .then(function () {
        req.flash('success', 'Visita y sus objetivos destruidos con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al destruir una visita y sus objetivos: ' + error.message);
        next(error);
    });
};


//-----------------------------------------------------------


// GET /trash/posts
exports.posts = function (req, res, next) {

    var options = {
        paranoid: false,
        where: {deletedAt: {$not: null}}
    };

    //----------------

    models.Post.count(options)
    .then(function (count) {

        // Paginacion:

        var items_per_page = 25;

        // La pagina a mostrar viene en la query
        var pageno = parseInt(req.query.pageno) || 1;


        // Crear un string con el HTML que pinta la botonera de paginacion.
        // Lo añado como una variable local de res para que lo pinte el layout de la aplicacion.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);


        options.offset = items_per_page * (pageno - 1);
        options.limit = items_per_page;

        options.order = [['updatedAt', 'DESC']];
        options.include = [{model: models.User, as: 'Author'}];

        return models.Post.findAll(options);
    })
    .then(function (posts) {
        res.render('trash/posts', {posts: posts});
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------


// POST /trash/posts/:postId_wal
exports.postRestore = function (req, res, next) {

    var postId = req.params["postId_wal"];

    var options = {where: {id: postId}};

    // Restaurar (sacar de la papelera) el post:
    models.Post.restore(options)
    .then(function () {
        req.flash('success', 'Post restaurado con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al restaurar un post: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

// DELETE /trash/posts/:postId_wal
exports.postDestroy = function (req, res, next) {

    var postId = req.params["postId_wal"];

    // Buscar el post a destruir definiticamente:
    models.Post.findById(postId, {
        paranoid: false,
        where: {deletedAt: {$not: null}}
    })
    .then(function (post) {
        if (!post) {
            throw new Error('No existe ningún post con Id=' + postId);
        }

        // Obtener los ficheros adjuntos:
        return post.getAttachments()
        .each(function (attachment) {

            // Borrar el fichero en Cloudinary.
            cloudinary.api.delete_resources(attachment.public_id);

            // Borrar el attacment de la base de datos.
            return attachment.destroy({force: true});
        })
        .then(function () {
            // Desenganchar los ficheros adjuntos:
            return post.setAttachments([])
        })
        .then(function () {
            // Destruir definitivamente (no se guarda en la papelera) el post:
            return post.destroy({force: true});
        });
    })
    .then(function () {
        // Destruir definitivamente (no se guarda en la papelera) los comentarios del post:
        return models.Comment.destroy({
            where: {PostId: postId},
            force: true
        });
    })
    .then(function () {
        req.flash('success', 'Post, comentarios y adjuntos destruidos con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al destruir un post con sus comentarios y adjuntos: ' + error.message);
        next(error);
    });
}
;

//-----------------------------------------------------------

