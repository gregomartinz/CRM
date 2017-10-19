'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('Users',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                fullname: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Falta el nombre y apellidos del usuario."}}

                },
                login: {
                    type: Sequelize.STRING,
                    unique: true,
                    validate: {
                        notEmpty: {msg: "Falta login"}
                    }
                },
                password: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Falta password"}}
                },
                salt: {type: Sequelize.STRING},
                token: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Falta token"}}
                },
                isAdmin: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                isSalesman: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                PhotoId: {
                    type: Sequelize.INTEGER
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
        return queryInterface.dropTable('Users');
    }
};
