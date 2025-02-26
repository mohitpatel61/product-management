'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.changeColumn("product", "product_number", {
      type: Sequelize.STRING, // Update the data type (change as needed)
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.changeColumn("product", "product_number", {
      type: Sequelize.INTEGER, // Revert to original type in case of rollback
      allowNull: true,
    });
  }
};
