'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            'Customers',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                code: {
                    type: Sequelize.STRING,
                    unique: true,
                    validate: {notEmpty: {msg: "Falta el código del vendedor."}}
                },
                name: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Falta el nombre del vendedor."}}
                },
                cif: {
                    type: Sequelize.STRING
                },
                address1: {
                    type: Sequelize.STRING
                },
                address2: {
                    type: Sequelize.STRING
                },
                postalCode: {
                    type: Sequelize.STRING
                },
                city: {
                    type: Sequelize.STRING
                },
                phone1: {
                    type: Sequelize.STRING
                },
                phone2: {
                    type: Sequelize.STRING
                },
                phone3: {
                    type: Sequelize.STRING
                },
                phone4: {
                    type: Sequelize.STRING
                },
                email1: {
                    type: Sequelize.STRING
                },
                email2: {
                    type: Sequelize.STRING
                },
                web: {
                    type: Sequelize.STRING
                },
                notes: {
                    type: Sequelize.TEXT
                },
                archived: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                createdAt: {type: Sequelize.DATE, allowNull: false},
                updatedAt: {type: Sequelize.DATE, allowNull: false},
                deletedAt: { type: Sequelize.DATE }
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('Customers');
    }
};
