// Definicion del modelo de cliente: Customer:

module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Customer',
        {
            code: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Falta el código del vendedor."}}
            },
            name: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Falta el nombre del vendedor."}}
            },
            cif: {
                type: DataTypes.STRING
            },
            address1: {
                type: DataTypes.STRING
            },
            address2: {
                type: DataTypes.STRING
            },
            postalCode: {
                type: DataTypes.STRING
            },
            city: {
                type: DataTypes.STRING
            },
            phone1: {
                type: DataTypes.STRING
            },
            phone2: {
                type: DataTypes.STRING
            },
            phone3: {
                type: DataTypes.STRING
            },
            phone4: {
                type: DataTypes.STRING
            },
            email1: {
                type: DataTypes.STRING
            },
            email2: {
                type: DataTypes.STRING
            },
            web: {
                type: DataTypes.STRING
            },
            notes: {
                type: DataTypes.TEXT
            },
            archived: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            timestamps: true,
            paranoid: true
        });
};
