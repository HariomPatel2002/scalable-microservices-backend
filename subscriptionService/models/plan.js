'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(
        models.Subscription,
        {
          foreignKey: "planId",
          as: "subscriptions",
          }
        );
      }
  }
  Plan.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    billingCycle: DataTypes.STRING,
    stripePriceId: DataTypes.STRING,
    features: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Plan',
  });
  return Plan;
};