'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('Customers', [ 
         { code: 'c1',
           name: 'Cliente 1',
           createdAt: new Date(), updatedAt: new Date() 
         },
         { code: 'c2',
           name: 'Cliente 2',
           createdAt: new Date(), updatedAt: new Date() 
         },
         { code: 'c3',
           name: 'Cliente 3',
           createdAt: new Date(), updatedAt: new Date()  
         }
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('Customers', null, {});
  }
};


