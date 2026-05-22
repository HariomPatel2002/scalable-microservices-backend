'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(
        models.Subscription,
        {
          foreignKey:
            "subscriptionId",

          as: "subscription",
        }
      );
    }
  }
  Payment.init({
    userId: DataTypes.INTEGER,
    subscriptionId: DataTypes.INTEGER,
    stripePaymentIntentId: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    currency: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};