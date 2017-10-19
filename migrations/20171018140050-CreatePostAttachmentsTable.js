'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            'PostAttachments',
            {
                PostId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    unique: "compositeIndex",
                    allowNull: false
                },
                AttachmentId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    unique: "compositeIndex",
                    allowNull: false
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('PostAttachments');
    }
};
