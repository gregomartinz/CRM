// Definicion del modelo de objetivo: Target

module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Target',
        {
            success: {
                type: DataTypes.BOOLEAN
            },
            notes: {
                type: DataTypes.TEXT
            }
        },
        {
            timestamps: true,
            paranoid: true
        });
};
