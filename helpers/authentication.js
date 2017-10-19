
var crypto = require('crypto');

// Crea un token para el acceso usando el API REST
exports.createToken = function() {

    var salt = Math.round((new Date().valueOf() * Math.random())) + '';
    return crypto.createHmac('sha256', salt).update("UserCrmToken").digest('hex').substring(10,30);

}

