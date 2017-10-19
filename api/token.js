
var models = require('../models');


// Middleware: Se requiere pasar el token de acceso en la query de la peticion.
//
// Si se ha pasado el token, se busca al usuario asociado al token pasado en la query
// y se crea el objeto req.token con los valores:
//     userId: <id del usuario>
//
exports.tokenRequired = function (req, res, next) {

    var token = req.query.token || "";

    if (token) {

        models.User.findOne({where: {token: token}})
        .then(function(user) {
            if (user) {
                req.token = {
                    userId: user.id
                };
                next();
            } else {
                // Autenticación ha fallado
                res.sendStatus(401);
            }
        });
    } else {
        // Se necesita autenticación.
        res.sendStatus(401);
    }
};
