'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            'Visits',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                CustomerId: {type: Sequelize.INTEGER},
                SalesmanId: {type: Sequelize.INTEGER},
                plannedFor: {
                    type: Sequelize.DATE,
                    validate: {notEmpty: {msg: "La fecha planificada no es una fecha válida."}}
                },
                fulfilledAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    validate: {notEmpty: {msg: "La fecha de realización no es una fecha válida."}}
                },
                notes: {
                    type: Sequelize.TEXT
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                deletedAt: {type: Sequelize.DATE}
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('Visits');
    }
};
