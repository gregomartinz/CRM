'use strict';


module.exports = {
    up: function (queryInterface, Sequelize) {

        return queryInterface.bulkInsert('Companies', [
            {
                name: 'Fábrica A',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Fábrica B',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Fábrica C',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Companies', null, {});
    }
};


