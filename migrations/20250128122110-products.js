  'use strict';

  /** @type {import('sequelize-cli').Migration} */
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      /**
       * Add altering commands here.
       *
       * Example:
       */
      await queryInterface.createTable('product',
        {
          id:
          {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          title:
          {
            type: Sequelize.STRING,
            allowNull: false,

          },
          product_price: {
            type: Sequelize.DECIMAL,
            allowNull: true,
          },
          product_number: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          description:
          {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          created_by:
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'user',
              key: 'id',
            },
          },
          status: {
            type: Sequelize.BOOLEAN,
            defaultValue: true, // True = Active, False = Inactive
          },
          created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
          },
          updated_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
          },
          deleted_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          thumbnail_image: {
            type: Sequelize.STRING,
            allowNull: true, // Allows NULL for users without a profile image
          },
          product_image: {
            type: Sequelize.STRING,
            allowNull: true,
          }

        });

    },

    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('product');

    }
  };