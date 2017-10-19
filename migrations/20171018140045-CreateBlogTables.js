'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return Sequelize.Promise.all([

            queryInterface.createTable(
                'Posts',
                {
                    id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        primaryKey: true,
                        autoIncrement: true,
                        unique: true
                    },
                    AuthorId: {
                        type: Sequelize.INTEGER
                    },
                    title: {
                        type: Sequelize.STRING,
                        allowNull: false,
                        defaultValue: 'Título del Posts'
                    },
                    body: {
                        type: Sequelize.TEXT,
                        allowNull: false
                    },
                    createdAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    updatedAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    deletedAt: {
                        type: Sequelize.DATE
                    }
                },
                {
                    sync: {
                        force: true
                    }
                }
            ),

            queryInterface.createTable(
                'Comments',
                {
                    id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        primaryKey: true,
                        autoIncrement: true,
                        unique: true
                    },
                    AuthorId: {
                        type: Sequelize.INTEGER
                    },
                    PostId: {
                        type: Sequelize.INTEGER
                    },
                    body: {
                        type: Sequelize.TEXT,
                        allowNull: false
                    },
                    createdAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    updatedAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    deletedAt: {
                        type: Sequelize.DATE
                    }
                },
                {
                    sync: {
                        force: true
                    }
                }
            )
        ]);
    },

    down: function (queryInterface, Sequelize) {
        return Sequelize.Promise.all([
            queryInterface.dropTable('Posts'),
            queryInterface.dropTable('Comments')
        ]);
    }
};
