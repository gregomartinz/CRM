var models = require('../models');
var Sequelize = require('sequelize');

var moment = require('moment');

//-----------------------------------------------------------


// Autoload la visita asociada a :visitId
exports.load = function (req, res, next, visitId) {

    models.Visit.findById(visitId, {
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
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


// MW que permite el paso solamente si el vendedor de la visita esta asociado al token usado.
exports.salesmanIsLoggedUser_Required = function (req, res, next) {

    var tokenUserId = req.token.userId;

    models.Salesman.findOne({
        where: {UserId: tokenUserId}
    })
    .then(function (salesman) {
        if (salesman) {
            next();
        } else {
            console.log('Ruta prohibida: el token usado no es el del vendedor.');
            res.send(403);
        }
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// GET /visits/flattened
// GET /customers/:customerId/visits/flattened
// GET /users/:userId/visits/flattened
// GET /salesmen/:userId/visits/flattened
// GET /users/:userId/customers/:customerId/visits/flattened
// GET /salesmen/:userId/customers/:customerId/visits/flattened
exports.indexFlattened = function (req, res, next) {

    var options = {};
    options.where = {$and: []};
    options.include = [];
    options.order = [];

    //----------------


    var searchdateafter = req.query.searchdateafter || '';
    var searchdatebefore = req.query.searchdatebefore || '';
    var searchcustomer = req.query.searchcustomer || '';
    var searchCompanyId = req.query.searchCompanyId || "";
    var searchsalesman = req.query.searchsalesman || '';
    var searchfavourites = req.query.searchfavourites || "";


    // Busquedas por fecha de planificacion: despues de una fecha
    if (searchdateafter !== "") {
        var momentafter = moment(searchdateafter + " 08:00", "YYYY-MM-DD");
        if (!momentafter.isValid()) {
            console.log("Error: La fecha " + searchdateafter + " no es válida.");
            momentafter = moment("01-01-1900 08:00", "YYYY-MM-DD");
        }
        options.where.$and.push({plannedFor: {$gte: momentafter.toDate()}});
    }

    // Busquedas por fecha de planificacion: antes de una fecha
    if (searchdatebefore !== "") {
        var momentbefore = moment(searchdatebefore + " 08:00", "YYYY-MM-DD");
        if (!momentbefore.isValid()) {
            console.log("Error: La fecha " + searchdatebefore + " no es válida.");
            momentbefore = moment("31-12-9999 08:00", "YYYY-MM-DD");
        }
        options.where.$and.push({plannedFor: {$lte: momentbefore.toDate()}});
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
            },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        };

        // Filtrar: Clientes de la fabrica especificada en la query:
        if (searchCompanyId) {
            customerInclude.include = [{
                model: models.Company,
                as: "MainCompanies",
                where: {id: searchCompanyId},
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                through: {attributes: ['CustomerId']}
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
        options.include.push(customerInclude);

    } else {
        options.include.push({
            model: models.Customer,
            where: {
                id: req.customer.id
            },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });
    }


    // Visitas de un vendedor especificado en la URL:
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
                where: {fullname: likeCondition},
                attributes: { exclude: ['token', 'password', 'salt', 'createdAt', 'updatedAt', 'deletedAt'] },
                include: [{
                    model: models.Attachment,
                    as: "Photo",
                    attributes: ['id', 'url', 'mime']
                }]
            });
        } else {
            // CUIDADO: Estoy retocando el include existente.
            options.include.push({
                model: models.User,
                as: "Salesman",
                attributes: { exclude: ['token', 'password', 'salt', 'createdAt', 'updatedAt', 'deletedAt'] },
                include: [{
                    model: models.Attachment,
                    as: "Photo",
                    attributes: ['id', 'url', 'mime']
                }]
            });
        }
    } else {
        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.User,
            as: "Salesman",
            where: {id: req.user.id},
            attributes: { exclude: ['token', 'password', 'salt', 'createdAt', 'updatedAt', 'deletedAt'] },
            include: [{
                model: models.Attachment,
                as: "Photo",
                attributes: ['id', 'url', 'mime']
            }]
        });
    }


    // Filtrar por mis visitas favoritas
    if (searchfavourites) {

        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.User,
            as: "Fans",
            where: {id: req.token.userId},
            attributes: ['id', 'fullname'],
            through: {attributes: ['UserId']}
        });
    } else {

        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.User,
            as: "Fans",
            attributes: ['id', 'fullname'],
            through: {attributes: ['UserId']}
        });
    }

    //----------------


    options.include.push({
        model: models.Target,
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        include: [
            {
                model: models.Company,
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
            },
            {
                model: models.TargetType,
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
            }
        ]
    });

    options.order.push(['plannedFor', 'DESC']);
    options.attributes = { exclude: ['createdAt', 'updatedAt', 'deletedAt'] };

    models.Visit.findAll(options)
    .then(function (visits) {

        console.log("Num Visitas =", visits.length);

        // Marcar las visitas que son favoritas
        visits.forEach(function (visit) {
            visit.set("favourite", visit.Fans.some(function (fan) {
                return fan.id == req.token.userId;
            }), {
                raw: true
            });
        });

        res.json(visits);
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// GET /visits
// GET /customers/:customerId/visits
// GET /users/:userId/visits
// GET /salesmen/:userId/visits
// GET /users/:userId/customers/:customerId/visits
// GET /salesmen/:userId/customers/:customerId/visits
exports.index = function (req, res, next) {

    var options = {};
    options.where = {$and: []};
    options.include = [];
    options.order = [];

    //----------------

    var searchdateafter = req.query.searchdateafter || '';
    var searchdatebefore = req.query.searchdatebefore || '';
    var searchcustomer = req.query.searchcustomer || '';
    var searchCompanyId = req.query.searchCompanyId || "";
    var searchsalesman = req.query.searchsalesman || '';
    var searchfavourites = req.query.searchfavourites || "";


    // Busquedas por fecha de planificacion: despues de una fecha
    if (searchdateafter !== "") {
        var momentafter = moment(searchdateafter + " 08:00", "YYYY-MM-DD");
        if (!momentafter.isValid()) {
            console.log("Error: La fecha " + searchdateafter + " no es válida.");
            momentafter = moment("01-01-1900 08:00", "YYYY-MM-DD");
        }
        options.where.$and.push({plannedFor: {$gte: momentafter.toDate()}});
    }

    // Busquedas por fecha de planificacion: antes de una fecha
    if (searchdatebefore !== "") {
        var momentbefore = moment(searchdatebefore + " 08:00", "YYYY-MM-DD");
        if (!momentbefore.isValid()) {
            console.log("Error: La fecha " + searchdatebefore + " no es válida.");
            momentbefore = moment("31-12-9999 08:00", "YYYY-MM-DD");
        }
        options.where.$and.push({plannedFor: {$lte: momentbefore.toDate()}});
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
            },
            attributes: []
        };

        // Filtrar: Clientes de la fabrica especificada en la query:
        if (searchCompanyId) {
            customerInclude.include = [{
                model: models.Company,
                as: "MainCompanies",
                where: {id: searchCompanyId},
                attributes: []
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
        options.include.push(customerInclude);

    } else {
        options.where.$and.push({CustomerId: req.customer.id});
    }


    // Visitas de un vendedor especificado en la URL:
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
                where: {fullname: likeCondition},
                attributes: []
            });
        }
    } else {
        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.User,
            as: "Salesman",
            where: {id: req.user.id},
            attributes: []
        });
    }


    // Filtrar por mis visitas favoritas
    if (searchfavourites) {

        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.User,
            as: "Fans",
            where: {id: req.token.userId},
            attributes: [['id', 'SalesmanId']],
            through: {attributes: ['UserId']}
        });
    } else {

        // CUIDADO: Estoy retocando el include existente.
        options.include.push({
            model: models.User,
            as: "Fans",
            where: {id: req.token.userId},
            required: false,  // Para que incluya todas las visitas, aunque no sean mis favoritas.
            attributes: [['id', 'SalesmanId']],
            through: {attributes: ['UserId']}
        });
    }



    //----------------

    options.order.push(['plannedFor', 'DESC']);
    options.attributes = { exclude: ['createdAt', 'updatedAt', 'deletedAt'] };

    models.Visit.findAll(options)
    .then(function (visits) {

        console.log("Num Visitas =", visits.length);

        // Marcar las visitas que son favoritas
        visits.forEach(function (visit) {

            visit.set("favourite", visit.Fans.some(function (fan) {

                return fan.get("SalesmanId") == req.token.userId;
            }), {
                raw: true
            });
           delete visit.dataValues.Fans;

        });

        res.json(visits);
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------

// GET /visits/:visitId
exports.show = function (req, res, next) {
    res.json(req.visit);
};

//-----------------------------------------------------------

// PUT /visits/:visitId
//
// Solo se actualizan los campos fulfilledAt y notes.
exports.update = function (req, res, next) {

    // Poner null si no hay fecha de realizacion
    var momentFulfilledAt = null;
    if (req.body.fulfilledAt && req.body.fulfilledAt.trim()) {
        momentFulfilledAt = moment(req.body.fulfilledAt + " 08:00", "YYYY-MM-DD");
    }
    req.visit.fulfilledAt = momentFulfilledAt;

    // Hay notas?
    if (req.body.notes) {
        req.visit.notes = req.body.notes.trim();
    }

    req.visit.save({fields: ["fulfilledAt", "notes"]})
    .then(function (visit) {

        console.log('API: Visita ' + visit.id + ' editada con éxito.');

        res.sendStatus(200);
    })
    .catch(Sequelize.ValidationError, function (error) {

        console.log('API: Errores en actualizacion:');
        for (var i in error.errors) {
            console.log('API error: ', error.errors[i].value);
        }

        res.sendStatus(409);
    })
    .catch(function (error) {
        console.log('API error: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

