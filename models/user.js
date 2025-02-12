'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // True = Active, False = Inactive
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE, // Add column for soft delete
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true, // Allows NULL for users without a profile image
    },
    thumbnail_image: {
      type: DataTypes.STRING,
      allowNull: true, // Allows NULL for users without a profile image
    },
  },  {
    sequelize,
    modelName: 'User',
    tableName: 'user', // Explicitly define table name
    timestamps: true,   // Enable timestamps (created_at, updated_at)
    paranoid: true,     // Enable soft deletes
    deletedAt: 'deleted_at', // Use custom column name for deleted_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',

  });

  // Hooks (Optional) - Automatically update the `updated_at` field
  User.beforeUpdate((user, options) => {
    user.updated_at = new Date();
  });

  User.associate = function(models) {
    User.hasMany(models.Product, { foreignKey: 'created_by', as: 'creator' });
  };
  return User;
};
