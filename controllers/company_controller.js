var models = require('../models');
var Sequelize = require('sequelize');

var moment = require('moment');

var customerHelper = require("../helpers/customer");
var userHelper = require("../helpers/user");
var targetTypeHelper = require("../helpers/targettype");

//-----------------------------------------------------------


// Autoload la fabrica asociado a :companyId
exports.load = function (req, res, next, companyId) {

    models.Company.findById(
        companyId,
        {
            include: [
                {
                    model: models.Customer,
                    as: "AllCustomers",
                    attributes: ['id', 'code', 'name', 'archived']
                }
            ],
            order: [[{model: models.Customer, as: "AllCustomers"}, 'name']]
        }
    )
    .then(function (company) {
        if (company) {
            req.company = company;
            next();
        } else {
            throw new Error('No existe ninguna fábrica con Id=' + companyId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};


//-----------------------------------------------------------

// GET /companies
exports.index = function (req, res, next) {

    var options = {};
    options.where = {};
    options.order = [['name']];

    //----------------
    models.Company.findAll(options)
    .then(function (companies) {
        res.render('companies/index.ejs', {companies: companies});
    })
    .catch(function (error) {
        next(error);
    });
};

//-----------------------------------------------------------


// GET /companies/:companyId
exports.show = function (req, res, next) {

    res.render('companies/show', {
        company: req.company,
        allCustomers: req.company.AllCustomers
    });
};


//-----------------------------------------------------------


// GET /companies/new
exports.new = function (req, res, next) {

    var company = models.Company.build({name: ""});

    customerHelper.getUnarchivedCustomersInfo()
    .then(function (allCustomers) {

        res.render('companies/new', {
            company: company,
            customerIds: [],
            allCustomers: allCustomers
        });
    })
    .catch(function (error) {
        next(error);
    });
};


// POST /companies/create
exports.create = function (req, res, next) {

    var company = {name: req.body.name.trim()};

    // Ids de los clientes de la fabrica
    var customerIds = req.body.customerIds || [];

    // Guarda en la tabla Companies la nueva fabrica.
    models.Company.create(company)
    .then(function (company) {
        req.flash('success', 'Fábrica creada con éxito.');

        return company.setAllCustomers(customerIds)
        .then(function () {

            req.flash('success', 'Clientes de la fábrica marcados con éxito.');

            res.redirect("/companies/" + company.id);
        });
    })
    .catch(Sequelize.ValidationError, function (error) {
        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        return customerHelper.getUnarchivedCustomersInfo()
        .then(function (allCustomers) {

            res.render('companies/new', {
                company: company,
                customerIds: customerIds,
                allCustomers: allCustomers
            });
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear una fábrica: ' + error.message);
        next(error);
    });
};


// GET /companies/:companyId/edit
exports.edit = function (req, res, next) {

    customerHelper.getUnarchivedCustomersInfo()
    .then(function (allCustomers) {

        var customerIds = req.company.AllCustomers
        .filter(function (customer) {
            return !customer.archived;
        })
        .map(function (customer) {
            return customer.id;
        });

        res.render('companies/edit', {
            company: req.company,
            customerIds: customerIds,
            allCustomers: allCustomers
        });
    })
    .catch(function (error) {
        next(error);
    });
};


// PUT /companies/:companyId
exports.update = function (req, res, next) {

    req.company.name = req.body.name.trim();

    var customerIds = req.body.customerIds || [];

    req.company.save({fields: ["name"]})
    .then(function (company) {

        req.flash('success', 'Fábrica editada con éxito.');

        return company.setAllCustomers(customerIds)
        .then(function () {

            req.flash('success', 'Clientes de la fábrica editados con éxito.');

            res.redirect("/companies/" + company.id);
        });
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        return getUnarchivedCustomersInfo()
        .then(function (allCustomers) {

            res.render('companies/edit', {
                company: req.company,
                customerIds: customerIds,
                allCustomers: allCustomers
            });
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar una fábrica: ' + error.message);
        next(error);
    });
};

//-----------------------------------------------------------

// DELETE /companies/:companyId
exports.destroy = function (req, res, next) {

    // Borrar la fabrica:
    req.company.destroy()
    .then(function () {
        req.flash('success', 'Fábrica borrada con éxito.');
        res.redirect("/reload");
    })
    .catch(function (error) {
        req.flash('error', 'Error al borrar una fábrica: ' + error.message);
        next(error);
    });
};


//-----------------------------------------------------------


// GET /companies/:companyId/statistics
exports.statistics = function (req, res, next) {

    var company = req.company;  // autoload

    Sequelize.Promise.all([

        models.Target.findAll({
            where: {CompanyId: company.id},
            include: [{
                model: models.Visit,
                include: [
                    {model: models.User, as: "Salesman"}]
            }]
        })
        .then(function (targets) {
            var counters = {};
            targets.forEach(function (target) {

                if (!target.Visit) return;

                var salesmanId = target.Visit.SalesmanId || 0;
                var customerId = target.Visit.CustomerId || 0;

                counters[salesmanId] = counters[salesmanId] || {};
                counters[salesmanId][customerId] = counters[salesmanId][customerId] || {
                        total: 0,
                        pending: 0,
                        done: 0,
                        fail: 0
                    };

                if (target.success === null) {
                    counters[salesmanId][customerId].pending++;
                } else if (target.success === true) {
                    counters[salesmanId][customerId].done++;
                } else {
                    counters[salesmanId][customerId].fail++;
                }
                counters[salesmanId][customerId].total++;

            });
            return counters;
        }),

        company.AllCustomers
        .filter(function (customer) {
            return !customer.archived;
        })
        .map(function (customer) {
            return {
                id: customer.id,
                name: customer.name,
                address1: customer.address1,
                address2: customer.address2,
                postalCode: customer.postalCode,
                city: customer.city
            };
        }),

        models.User.findAll({where: {isSalesman: true}})
        .then(function (salesmen) {
            return salesmen.map(function (salesman) {
                return {id: salesman.id, fullname: salesman.fullname};
            });
        })
    ])
    .spread(function (counters, customers, salesmen) {

        res.render('companies/statistics', {
            customers: customers,
            salesmen: salesmen,
            counters: counters,
            company: company
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al calcular las estadísticas de una fábrica: ' + error.message);

        next(error);
    });
};


//-----------------------------------------------------------


// GET /companies/:companyId/visits/new
exports.visitsNew = function (req, res, next) {

    var salesmanId = "";
    var salesmenInfo = [];
    var plannedFor = moment();
    var visitsNotes = "";
    var targetTypeId = "";
    var targetTypesInfo = [];
    var targetTypesNotes = "";

    // Proponer al usuario logeado como vendedor.
    // Aunque el usuario logeado puede que no sea un vendedor.
    models.User.findById(req.session.user.id)
    .then(function (salesman) {
        salesmanId = salesman && salesman.isSalesman && salesman.id || 0;
    })
    .then(function () {
        return userHelper.getAllSalesmenInfo()
        .then(function (info) {
            salesmenInfo = info;
        });
    })
    .then(function () {
        return targetTypeHelper.getAllTargetTypesInfo()
        .then(function (info) {
            targetTypesInfo = info;
        });
    })
    .then(function () {

        res.render('companies/visits_new', {
            company: req.company,
            salesmanId: salesmanId,
            salesmenInfo: salesmenInfo,
            plannedFor: plannedFor,
            visitsNotes: visitsNotes,
            targetTypeId: targetTypeId,
            targetTypesInfo: targetTypesInfo,
            targetTypesNotes: targetTypesNotes,
            moment: moment
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear las visitas: ' + error.message);
        next(error);
    });
};


// POST /companies/:companyId/visits
exports.visitsCreate = function (req, res, next) {

    var momentPlannedFor = moment(req.body.plannedFor + " 08:00", "DD-MM-YYYY");

    Sequelize.Promise.all([
        // Comprobar que existe el tipo de objetivo seleccionado:
        models.TargetType.findById(req.body.targetTypeId),
        // Comprobar que existe el vendedor seleccionado:
        models.User.findById(req.body.salesmanId)
    ])
    .spread(function (targettype, salesman) {
        var errors = [];
        if (!targettype) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "targettype", 'No se ha especificado ningún tipo de objetivo existente.'));
        }
        if (!salesman) {
            errors.push(new Sequelize.ValidationErrorItem("Formulario incompleto.", "Validation Error", "salesman", 'No se ha especificado ningún vendedor existente.'));
        }
        if (errors.length) {
            throw new Sequelize.ValidationError("Errores de Validación personalizados", errors);
        }
    })
    .then(function () {

        return Sequelize.Promise.all(
            req.company.AllCustomers
            .filter(function (customer) {
                return !customer.archived;
            })
        )
        .each(function (customerInfo) {

            var visit = {
                plannedFor: momentPlannedFor,
                fulfilledAt: null,
                notes: req.body.visitsNotes.trim(),
                CustomerId: customerInfo.id,
                SalesmanId: Number(req.body.salesmanId) || 0,
                Targets: [
                    {
                        success: null,
                        notes: req.body.targetTypesNotes.trim(),
                        TargetTypeId: req.body.targetTypeId,
                        CompanyId: req.company.id
                    }
                ]
            };

            // Guarda en la tabla Visits la nueva visita para el cliente que toca.
            return models.Visit.create(visit,
                {
                    include: models.Target
                }
            )
            .then(function (visit) {
                req.flash('success', 'Visita creada con éxito para ' + customerInfo.name + '.');
            })
            .catch(Sequelize.ValidationError, function (error) {
                req.flash('error', 'Errores al crear una visita para formulario ' + customerInfo.name + '.');
                for (var i in error.errors) {
                    req.flash('error', error.errors[i].message);
                }
            });
        });
    })
    .then(function () {
        res.redirect("/reload");
    })
    .catch(Sequelize.ValidationError, function (error) {
        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        return Sequelize.Promise.all([
            userHelper.getAllSalesmenInfo(),
            targetTypeHelper.getAllTargetTypesInfo()
        ])
        .spread(function (salesmenInfo, targetTypesInfo) {

            res.render('companies/visits_new', {
                company: req.company,
                salesmanId: req.body.salesmanId,
                salesmenInfo: salesmenInfo,
                plannedFor: momentPlannedFor,
                visitsNotes: req.body.visitsNotes,
                targetTypeId: req.body.targetTypeId,
                targetTypesInfo: targetTypesInfo,
                targetTypesNotes: req.body.targetTypesNotes,
                moment: moment
            });
        });
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear visitas para una fabrica: ' + error.message);
        next(error);
    });
};

