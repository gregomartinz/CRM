// Definicion del modelo fabrica: Company

module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Company',
        {
            name: {
                type: DataTypes.STRING,
                unique: true,
                validate: {notEmpty: {msg: "Falta el nombre de la fábrica."}}
            }
        },
        {
            timestamps: true,
            paranoid: true
        });
};
