var models = require('../models');
var Sequelize = require('sequelize');

var moment = require('moment');

var paginate = require('./paginate').paginate;

var companyHelper = require("../helpers/company");
var customerHelper = require("../helpers/customer");
var userHelper = require("../helpers/user");

//-----------------------------------------------------------


// Autoload la visita asociada a :visitId
exports.load = function (req, res, next, visitId) {

    models.Visit.findById(visitId,
        {
            include: [
                {
                    model: models.Target,
                    include: [
                        models.Company,
                        models.TargetType
                    ]
                },
                models.Customer,
                {
                    model: models.User,
                    as: "Salesman",
                    include: [{model: models.Attachment, as: 'Photo'}]
                }
            ],
            order: [['plannedFor', 'DESC']]
        })
    .then(function (visit) {
        if (visit) {
            req.visit = visit;
            next();
        } else {
            throw new Error('No existe ninguna visita con Id=' + visitId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};


//-----------------------------------------------------------


// MW que permite el paso solamente si:
//   - el usuario logeado es admin,
//   - o el vendedor de la visita es el usuario logeado.
exports.admin_Or_SalesmanIsLoggedUser_Required = function (req, res, next) {

    if (req.session.user.isAdmin ||
        req.visit.SalesmanId === req.session.user.id) {
        next();
    } else {
        console.log('Ruta prohibida: el usuario logeado no es el vendedor referenciado, ni un administrador.');
        res.send(403);
    }
};

//-----------------------------------------------------------


// GET /visits
// GET /customers/:customerId/visits
// GET /users/:userId/visits
// GET /salesmen/:userId/visits
// GET /users/:userId/customers/:customerId/visits
// GET /salesmen/:userId/customers/:customerId/visits
exports.index = function (req, res, next) {

    var countOptions = {};
    countOptions.where = {};
    countOptions.include = [];
    countOptions.order = [];

    //----------------

    var searchdateafter = req.query.searchdateafter || '';
    var searchdatebefore = req.query.searchdatebefore || '';
    var searchcustomer = req.query.searchcustomer || '';
    var searchCompanyId = req.query.searchCompanyId || "";
    var searchsalesman = req.query.searchsalesman || '';
    var searchfavourites = req.query.searchfavourites || "";


    // Busquedas por fecha de planificacion: despues de una fecha
    if (searchdateafter) {
        var momentafter = moment(searchdateafter + " 08:00", "DD-MM-YYYY");
        if (!momentafter.isValid()) {
            req.flash("error", "La fecha " + searchdateafter + " no es válida.");
            momentafter = moment("01-01-1900 08:00", "DD-MM-YYYY");
        }
        countOptions.where.plannedFor = {$gte: momentafter.toDate()};
    }

    // Busquedas por fecha de planificacion: antes de una fecha
    if (searchdatebefore) {
        var momentbefore = moment(searchdatebefore + " 08:00", "DD-MM-YYYY");
        if (!momentbefore.isValid()) {
            req.flash("error", "La fecha " + searchdatebefore + " no es válida.");
            momentbefore = moment("31-12-9999 08:00", "DD-MM-YYYY");
        }
        countOptions.where.plannedFor = {$lte: momentbefore.toDate()};
    }


    // Visitas de un cliente especificado en la URL:
    if (!req.customer) {

        // Incluir los clientes no archivados:
        var customerInclude = {
            model: models.Customer,
            where: {
                $and: [{
                    archived: false
                }]
            }
        };

        // Filtrar: Clientes de la fabrica especificada en la query:
        if (searchCompanyId) {
            customerInclude.include = [{
                model: models.Company,
                as: "MainCompanies",
                attributes: ['id', 'name'],
                where: {id: searchCompanyId}
            }];
        }

        // Filtrar: Codigo y nombre del cliente.
        if (searchcustomer) {
            var search_like = "%" + searchcustomer.replace(/ +/g, "%") + "%";

            var likeCondition;
            if (!!process.env.DATABASE_URL && /^postgres:/.test(process.env.DATABASE_URL)) {
                // el operador $iLike solo funciona en pastgres
                likeCondition = {$iLike: search_like};
            } else {
                likeCondition = {$like: search_like};
            }

            customerInclude.where.$and.push({
                $or: [
                    {code: likeCondition},
                    {name: likeCondition}
                ]
            });
        }
        countOptions.include.push(customerInclude);

    } else {
        countOptions.include.push({
            model: models.Customer,
            where: {
                id: req.customer.id
            }
        });
    }


    // Visitas de un vendedor (:userid es una variable de la URL cargada con autoload):
    if (!req.user) {
        if (searchsalesman) {
            var search_like = "%" + searchsalesman.replace(/ +/g, "%") + "%";

            var likeCondition;
            if (!!process.env.DATABASE_URL && /^postgres:/.test(process.env.DATABASE_URL)) {
                // el operador $iLike solo funciona en pastgres
                likeCondition = {$iLike: search_like};
            } else {
                likeCondition = {$like: search_like};
            }

            // CUIDADO: Estoy retocando el include existente.
            countOptions.include.push({
                model: models.User,
                as: "Salesman",
                where: {fullname: likeCondition},
                include: [{model: models.Attachment, as: 'Photo'}]
            });
        } else {
            // CUIDADO: Estoy retocando el include existente.
            countOptions.include.push({
                model: models.User,
                as: "Salesman",
                include: [{model: models.Attachment, as: 'Photo'}]
            });
        }
    } else {
        // CUIDADO: Estoy retocando el include existente.
        countOptions.include.push({
            model: models.User,
            as: "Salesman",
            where: {id: req.user.id},
            include: [{model: models.Attachment, as: 'Photo'}]
        });
    }


    // Filtrar por mis visitas favoritas
    if (searchfavourites) {

        // CUIDADO: Estoy retocando el include existente.
        countOptions.include.push({
            model: models.User,
            as: "Fans",
            attributes: ['id', 'login'],
            where: {id: req.session.user.id}
        });
    } else {

        // CUIDADO: Estoy retocando el include existente.
        countOptions.include.push({
            model: models.User,
            as: "Fans",
            attributes: ['id', 'login']
        });
    }


    //----------------

    models.Visit.count(countOptions)
    .then(function (count) {

        // Paginacion:

        var items_per_page = 25;

        // La pagina a mostrar viene en la query
        var pageno = parseInt(req.query.pageno) || 1;

        // Crear un string con el HTML que pinta la botonera de paginacion.
        // Lo añado como una variable local de res para que lo pinte el layout de la aplicacion.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        var findOptions = countOptions;

        findOptions.offset = items_per_page * (pageno - 1);
        findOptions.limit = items_per_page;

        findOptions.include.push({
            model: models.Target,
            include: [
                models.Company,
                models.TargetType
            ]
        });

        findOptions.order.push(['plannedFor', 'DESC']);

        return models.Visit.findAll(findOptions)
    })
    .then(function (visits) {

        // Marcar las visitas que son favoritas
        visits.forEach(function (visit) {
            visit.favourite = visit.Fans.some(function (fan) {
                return fan.id == req.session.user.id;
            });
        });

        companyHelper.getAllCompaniesInfo()
        .then(function (companiesInfo) {

            res.render('visits/index.ejs', {
                visits: visits,
                companiesInfo: companiesInfo,
                moment: moment,
                searchdateafter: searchdateafter,
                searchdatebefore: searchdatebefore,
                searchcustomer: searchcustomer,
                searchsalesman: searchsalesman,
                searchfavourites: searchfavourites,
                searchCompanyId: searchCompanyId,
                customer: req.customer,
                salesman: req.user
            });
        });
    })
    .catch(function (error) {
        next(error);
    });
};


// GET /visits/:visitId
exports.show = function (req, res, next) {

    new Promise(function (resolve, reject) {

        // Para usuarios logeados:
        //   Si la visita es una de mis favoritas, creo un atributo llamado
        //   "favourite" con el valor true.
        if (req.session.user) {

            resolve(
                req.visit.getFans({where: {id: req.session.user.id}})
                .then(function (fans) {
                    if (fans.length > 0) {
                        req.visit.favourite = true
                    }
                })
            );
        } else {
            resolve();
        }
    })
    .then(function () {
        res.render('visits/show', {
            visit: req.visit,
            moment: moment
        });
    })
    .catch(function (error) {
        next(error);
    });
};

//-------------------------------------


// Auxiliar
// Devuelve una promesa que al cumplirse devuelve un array con la siguiente informacion:
//   - vendedores: id y nombre de todos los usuarios vendedores.
//   - clientes:  id, codigo y nombre de todos los clientes.
// Esta informacion se usa para construir formularios de seleccion, y seleccionar un valor
// en ellos.
function infoOfSalesmenCustomers() {

    return Sequelize.Promise.all([
        userHelper.getAllSalesmenInfo(),
        customerHelper.getUnarchivedCustomersInfo()
    ]);
}


// GET /visits/new
exports.new = function (req, res, next) {

    // En la query me pueden sugerir un cliente a usar.
    var customerId = Number(req.query.customerId) || 0;

    // Proponer al usuario logeado como vendedor.
    // Si el usuario logeado no es un vendedor, no hay propuesta.
    var salesmanId = req.session.user.isSalesman ? req.session.user.id : 0;

    infoOfSalesmenCustomers()
    .spread(function (salesmen, customers) {

        var visit = {
            plannedFor: moment(),
            fulfilledAt: null,
            notes: "",
            CustomerId: customerId,
            SalesmanId: salesmanId
        };

        res.render('visits/new', {
            visit: visit,
            customers: customers,
            salesmen: salesmen,
            moment: moment
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear una visita: ' + error.message);
        next(error);
    });
};


// POST /visits/create
exports.create = function (req, res, next) {

    var momentPlannedFor = moment(req.body.plannedFor + " 08:00", "DD-MM-YYYY");

    // Poner null si no hay fecha
    var momentFulfilledAt = null;
    if (req.body.fulfilledAt && req.body.fulfilledAt.trim()) {
        momentFulfilledAt = moment(req.body.fulfilledAt + " 08:00", "DD-MM-YYYY");
    }

    var visit = {
        plannedFor: momentPlannedFor,
        fulfilledAt: momentFulfilledAt,
        notes: req.body.notes.trim(),
        CustomerId: Number(req.body.customerId) || 0,
        SalesmanId: Number(req.body.salesmanId) || 0
    };

    Sequelize.Promise.all([
        // Comprobar que existe el cliente seleccionado:
        models.Customer.findById(req.body.customerId),
        // Comprobar que existe el vendedor seleccionado:
        models.User.findById(req.body.salesmanId)
    ])
    .spread(function (customer, salesman) {
        var errors = [];
        if (!customer) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "customer", 'No se ha especificado ningún cliente existente.'));
        }
        if (!salesman) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "salesman", 'No se ha especificado ningún vendedor existente.'));
        }
        if (errors.length) {
            throw new Sequelize.ValidationError("Errores de Validación personalizados", errors);
        }
    })
    .then(function () {
        // Guarda en la tabla Visits la nueva visita.
        return models.Visit.create(visit)
        .then(function (visit) {
            req.flash('success', 'Visita creada con éxito.');

            res.redirect("/visits/" + visit.id);
        });
    })
    .catch(Sequelize.ValidationError, function (error) {
        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        return infoOfSalesmenCustomers()
        .spread(function (salesmen, customers) {
            res.render('visits/new', {
                visit: visit,
                customers: customers,
                salesmen: salesmen,
                moment: moment
            });
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear una visita: ' + error.message);
        next(error);
    });
};


// GET /visits/:visitId/edit
exports.edit = function (req, res, next) {

    infoOfSalesmenCustomers()
    .spread(function (salesmen, customers) {

        res.render('visits/edit', {
            visit: req.visit,
            customers: customers,
            salesmen: salesmen,
            moment: moment
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar una visita: ' + error.message);
        next(error);
    });
};


// PUT /visits/:visitId
exports.update = function (req, res, next) {

    var momentPlannedFor = moment(req.body.plannedFor + " 08:00", "DD-MM-YYYY");

    // Poner null si no hay fecha
    var momentFulfilledAt = null;
    if (req.body.fulfilledAt && req.body.fulfilledAt.trim()) {
        momentFulfilledAt = moment(req.body.fulfilledAt + " 08:00", "DD-MM-YYYY");
    }

    req.visit.plannedFor = momentPlannedFor;
    req.visit.fulfilledAt = momentFulfilledAt;
    req.visit.notes = req.body.notes.trim();
    req.visit.CustomerId = Number(req.body.customerId) || 0;
    req.visit.SalesmanId = Number(req.body.salesmanId) || 0;

    Sequelize.Promise.all([
        // Comprobar que existe el cliente seleccionado:
        models.Customer.findById(req.body.customerId),
        // Comprobar que existe el vendedor seleccionado:
        models.User.findById(req.body.salesmanId)
    ])
    .spread(function (customer, salesman) {
        var errors = [];
        if (!customer) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "customer", 'El cliente especificado no existe.'));
        }
        if (!salesman) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "salesman", 'El vendedor especificado no existe.'));
        }
        if (errors.length) {
            throw new Sequelize.ValidationError("Errores de Validación personalizados", errors);
        }
    })
    .then(function () {
        // Guarda en la tabla Visits la visita.
        return req.visit.save({fields: ["plannedFor", "fulfilledAt", "notes", "CustomerId", "SalesmanId"]})
        .then(function (visit) {

            req.flash('success', 'Visita editada con éxito.');

            res.redirect("/visits/" + visit.id);
        });
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        return infoOfSalesmenCustomers()
        .spread(function (salesmen, customers) {

            res.render('visits/edit', {
                visit: req.visit,
                customers: customers,
                salesmen: salesmen,
                moment: moment
            });
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar una visita: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------


// DELETE /visits/:visitId
exports.destroy = function (req, res, next) {

    // Borrar la visita:
    req.visit.destroy()
    .then(function () {
        req.flash('success', 'Visita borrada con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al borrar una visita: ' + error.message);
        next(error);
    });
};


//-----------------------------------------------------------

// GET /visits/print
// GET /customers/:customerId/visits/print
// GET /users/:userId/visits/print
// GET /salesmen/:userId/visits/print
// GET /users/:userId/customers/:customerId/visits/print
// GET /salesmen/:userId/customers/:customerId/visits/print
exports.printIndex = function (req, res, next) {

    var options = {};
    options.where = {};
    options.include = [];
    options.order = [];

    //----------------

    var searchdateafter = req.query.searchdateafter || '';
    var searchdatebefore = req.query.searchdatebefore || '';
    var searchcustomer = req.query.searchcustomer || '';
    var searchCompanyId = req.query.searchCompanyId || "";
    var searchsalesman = req.query.searchsalesman || '';
    var searchfavourites = req.query.searchfavourites || "";


    // Busquedas por fecha de planificacion: entre dos fechas
    var momentafter = moment(searchdateafter + " 08:00", "DD-MM-YYYY");
    if (searchdateafter && !momentafter.isValid()) {
        req.flash("error", "La fecha " + searchdateafter + " no es válida.");
        momentafter = moment("01-01-1900 08:00", "DD-MM-YYYY");
    }
    var searchmomentafter = momentafter.toDate();

    var momentbefore = moment(searchdatebefore + " 08:00", "DD-MM-YYYY");
    if (searchdatebefore && !momentbefore.isValid()) {
        req.flash("error", "La fecha " + searchdatebefore + " no es válida.");
        var momentbefore = moment("31-12-9999 08:00", "DD-MM-YYYY");
    }
    var searchmomentbefore = momentbefore.toDate();

    if (searchdateafter !== "") {
        if (searchdatebefore !== "") {
            options.where.plannedFor = {$between: [searchmomentafter, searchmomentbefore]};
        } else {
            options.where.plannedFor = {$gte: searchmomentafter};
        }
    } else {
        if (searchdatebefore !== "") {
            options.where.plannedFor = {$lte: searchmomentbefore};
        }
    }



    // Visitas de un cliente:
    if (!req.customer) {

        // Filtrar: Clientes de una fabrica:
        var customerCompanyInclude = [];
        if (searchCompanyId) {
            customerCompanyInclude = [{
                model: models.Company,
                as: "MainCompanies",
                attributes: ['id', 'name'],
                where: {id: searchCompanyId}
            }];
        }

        // Filtrar: Codigo y nombre del cliente.
        var customeInclude = {
            model: models.Customer,
            where: {
                $and: [{
                    archived: false
                }]
            },
            include: customerCompanyInclude
        };
        if (searchcustomer) {
            var search_like = "%" + searchcustomer.replace(/ +/g, "%") + "%";

            var likeCondition;
            if (!!process.env.DATABASE_URL && /^postgres:/.test(process.env.DATABASE_URL)) {
                // el operador $iLike solo funciona en pastgres
                likeCondition = {$iLike: search_like};
            } else {
                likeCondition = {$like: search_like};
            }

            customeInclude.where.$and.push({
                $or: [
                    {code: likeCondition},
                    {name: likeCondition}
                ]
            });
        }
        options.include.push(customeInclude);

    } else {
        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.Customer,
            where: {id: req.customer.id}
        });
    }


    // Visitas de un vendedor (:userId es una variable de la ruta cargada con autoload):
    if (!req.user) {
        if (searchsalesman) {
            var search_like = "%" + searchsalesman.replace(/ +/g, "%") + "%";

            var likeCondition;
            if (!!process.env.DATABASE_URL && /^postgres:/.test(process.env.DATABASE_URL)) {
                // el operador $iLike solo funciona en pastgres
                likeCondition = {$iLike: search_like};
            } else {
                likeCondition = {$like: search_like};
            }

            // CUIDADO: Estoy retocando el include existente.
            options.include.push({
                model: models.User,
                as: "Salesman",
                where: {name: likeCondition},
                include: [{model: models.Attachment, as: 'Photo'}]
            });
        } else {
            // CUIDADO: Estoy retocando el include existente.
            options.include.push({
                model: models.User,
                as: "Salesman",
                include: [{model: models.Attachment, as: 'Photo'}]
            });
        }
    } else {
        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.User,
            as: "Salesman",
            where: {id: req.user.id},
            include: [{model: models.Attachment, as: 'Photo'}]
        });
    }


    // Filtrar por mis visitas favoritas
    if (searchfavourites) {

        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.User,
            as: "Fans",
            attributes: ['id', 'login'],
            where: {id: req.session.user.id}
        });
    } else {

        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.User,
            as: "Fans",
            attributes: ['id', 'login']
        });
    }



    //----------------

        options.include.push({
            model: models.Target,
            include: [
                models.Company,
                models.TargetType
            ]
        });

    options.order.push(['plannedFor', 'DESC']);

    models.Visit.findAll(options)
    .then(function (visits) {

        companyHelper.getAllCompaniesInfo()
        .then(function (companiesInfo) {

            res.render('visits/print.ejs', {
                layout: false,
                visits: visits,
                companiesInfo: companiesInfo,
                moment: moment,
                searchdateafter: searchdateafter,
                searchdatebefore: searchdatebefore,
                searchcustomer: searchcustomer,
                searchsalesman: searchsalesman,
                searchfavourites: searchfavourites,
                searchCompanyId: searchCompanyId,
                customer: req.customer,
                salesman: req.user
            });
        });
    })
    .catch(function (error) {
        next(error);
    });
};


//-----------------------------------------------------------
