var crypto = require('crypto');

// Definicion de la clase User:

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('User',
        {
            login: {
                type: DataTypes.STRING,
                unique: true,
                validate: {notEmpty: {msg: "Falta login"}}
            },
            token: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Falta token"}}
            },
            password: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Falta password"}},
                set: function (password) {
                    // String aleatorio usado como salt.
                    this.salt = Math.round((new Date().valueOf() * Math.random())) + '';
                    this.setDataValue('password', encryptPassword(password, this.salt));
                }
            },
            salt: {
                type: DataTypes.STRING
            },
            fullname: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Falta el nombre y apellidos del usuario."}}
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            isSalesman: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            timestamps: true,
            paranoid: true,
            instanceMethods: {
                verifyPassword: function (password) {
                    return encryptPassword(password, this.salt) === this.password;
                }
            }
        });
};


/*
 * Encripta un password en claro.
 * Mezcla un password en claro con el salt proporcionado, ejecuta un SHA1 digest, 
 * y devuelve 40 caracteres hexadecimales.
 */
function encryptPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};

