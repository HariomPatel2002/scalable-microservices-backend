"use strict";

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.createTable(
      "auth_users",
      {

        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },

        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },

        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        role: {
          type: Sequelize.ENUM(
            "admin",
            "user"
          ),
          defaultValue: "user",
        },

        refreshToken: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        isVerified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },

        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },

        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      }
    );
  },

  async down(queryInterface) {

    await queryInterface.dropTable(
      "auth_users"
    );
  },
};