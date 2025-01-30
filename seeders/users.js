'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert default leave types into users
    await queryInterface.bulkInsert('user', [
      { first_name: 'Admin', last_name: 'User', email: 'admin@admin.com', password: '$2b$10$z2cHCS9QA2rbAgdZOYfbA.QQbpOBW100wqdzql4Rqsbo.3Lyjbeu6', status: 1 },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove all entries from users
    await queryInterface.bulkDelete('user', null, {});
  },
};
