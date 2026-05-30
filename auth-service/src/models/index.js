const sequelize = require("../config/db");
const UserModel = require("./user");

const User = UserModel(sequelize, require("sequelize").DataTypes);

sequelize.sync();

module.exports = {
  User,
  sequelize,
};
