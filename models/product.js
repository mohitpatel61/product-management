'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User', // Refers to the 'users' table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_price: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      product_number: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE, // Add column for soft delete
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // True = Active, False = Inactive
      },
      thumbnail_image: {
        type: DataTypes.STRING,
        allowNull: true, // Allows NULL for users without a profile image
      },
      product_image: {
        type: DataTypes.STRING,
        allowNull: true,
      }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'product', // Explicitly define table name
    timestamps: true,   // Enable timestamps (created_at, updated_at)
    paranoid: true,     // Enable soft deletes
    deletedAt: 'deleted_at', // Use custom column name for deleted_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',

  });

  // Associations
  Product.associate = (models) => {
    // EmployeeLeave belongs to a User
    Product.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'user',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };
  
  return Product;
};
