'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            'Targets',
            {
                id: {
                    type: Sequelize.INTEGER, allowNull: false,
                    primaryKey: true, autoIncrement: true,
                    unique: true
                },
                VisitId: {type: Sequelize.INTEGER},
                TargetTypeId: {type: Sequelize.INTEGER},
                CompanyId: {type: Sequelize.INTEGER},
                success: {
                    type: Sequelize.BOOLEAN
                },
                notes: {
                    type: Sequelize.TEXT
                },
                createdAt: {type: Sequelize.DATE, allowNull: false},
                updatedAt: {type: Sequelize.DATE, allowNull: false},
                deletedAt: {type: Sequelize.DATE}
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('Targets');

    }
};
