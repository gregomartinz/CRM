// Definicion del modelo de visitas: Visit

module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Visit',
        {
            plannedFor: {
                type: DataTypes.DATE,
                validate: {
                    isDate: {
                        msg: "La fecha planificada no es una fecha válida."
                    }
                }
            },
            fulfilledAt: {
                type: DataTypes.DATE,
                allowNull: true,
                validate: {
                    isDate: {
                        msg: "La fecha de realización no es una fecha válida."
                    }
                }
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
