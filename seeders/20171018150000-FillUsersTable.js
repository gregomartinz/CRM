'use strict';

var crypto = require('crypto');


function encryptPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};


module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('Users', [
          {
              fullname: 'Administrador2',
              login: 'admin2',
              password: encryptPassword('1234', 'aaaa'),
              salt: 'aaaa',
              token: '1234567890',
              isAdmin: true,
              isSalesman: false,
              PhotoId: 0,
              createdAt: new Date(),
              updatedAt: new Date()
          }
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('Users', null, {});
  }
};


