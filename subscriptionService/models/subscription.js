'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(
        models.Plan,
        {
          foreignKey: "planId",
          as: "plan",
        }
      );

      this.hasMany(
        models.Payment,
        {
          foreignKey:
            "subscriptionId",

          as: "payments",
        }
      );
    }
  }
  Subscription.init({
    userId: DataTypes.INTEGER,
    planId: DataTypes.INTEGER,
    stripeSubscriptionId: DataTypes.STRING,
    status: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    cancelAtPeriodEnd: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Subscription',
  });
  return Subscription;
};