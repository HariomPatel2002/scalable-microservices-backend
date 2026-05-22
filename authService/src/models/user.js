"use strict";

const { Model } = require("sequelize");

module.exports = (
  sequelize,
  DataTypes
) => {

  class User extends Model {

    static associate(models) {

    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM(
          "admin",
          "user"
        ),
        defaultValue: "user",
      },

      refreshToken: {
        type: DataTypes.TEXT,
      },

      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },

    {
      sequelize,
      modelName: "User",
      tableName: "auth_users",
    }
  );

  return User;
};