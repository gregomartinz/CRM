'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            'TargetTypes',
            {
                id: {
                    type: Sequelize.INTEGER, allowNull: false,
                    primaryKey: true, autoIncrement: true,
                    unique: true
                },
                name: {
                    type: Sequelize.STRING,
                    unique: true,
                    validate: {notEmpty: {msg: "Falta el nombre del tipo de objetivo."}}
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
        return queryInterface.dropTable('TargetTypes');
    }
};
