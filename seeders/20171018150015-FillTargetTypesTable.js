'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('TargetTypes', [ 
         { name: 'Entrega de documentación',
           createdAt: new Date(), updatedAt: new Date()  },
         { name: 'Presentación de novedades',
           createdAt: new Date(), updatedAt: new Date()  },
         { name: 'Control de existencias',
           createdAt: new Date(), updatedAt: new Date()  },
         { name: 'Reclamar impagados',
           createdAt: new Date(), updatedAt: new Date()  },
         { name: 'Tomar café',
           createdAt: new Date(), updatedAt: new Date()  },
         { name: 'Retirada de material',
           createdAt: new Date(), updatedAt: new Date()  },
         { name: 'Entrega de materias',
           createdAt: new Date(), updatedAt: new Date()  }
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('TargetTypes', null, {});
  }
};


