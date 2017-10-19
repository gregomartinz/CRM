// Definicion del modelo fabrica: Company

module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'TargetType',
        {
            name: {
                type: DataTypes.STRING,
                unique: true,
                validate: {notEmpty: {msg: "Falta el nombre del tipo de objetivo."}}
            }
        },
        {
            timestamps: true,
            paranoid: true
        });
};
