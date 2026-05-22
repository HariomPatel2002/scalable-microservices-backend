const stripe = require("../services/stripeService");
const {Plan} = require("../../models");


// ======================================
// CREATE CHECKOUT SESSION
// ======================================

exports.createCheckoutSession = async (req,res,next) => {

    try {
      const {planId,userId,email} = req.body;
      const plan =await Plan.findByPk(planId);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message:
            "Plan not found",
        });
      }

      const customer =await stripe.customers.create({email});
      const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          payment_method_types: [
            "card",
          ],
          line_items: [
               {
              price: plan.stripePriceId,
              quantity: 1,
            },
          ],

          mode: "subscription",
          success_url: "http://localhost:3000/success",
          cancel_url: "http://localhost:3000/cancel",
          metadata: {
            userId,
            planId: plan.id,
          },
        });

      res.json({
        success: true,
        url: session.url,
      });
    } catch (error) {
      next(error);
    }
  };


exports.changeSubscriptionPlan = async (req,res,next) => {

    try {
      const {subscriptionId,newPlanId,} = req.body;

      const subscription = await Subscription.findByPk(subscriptionId);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "Subscription not found",
        });
      }

      const newPlan = await Plan.findByPk(newPlanId);

      if (!newPlan) {
        return res.status(404).json({
          success: false,
          message:
            "Plan not found",
        });
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

      const subscriptionItemId = stripeSubscription.items.data[0].id;

      const updatedSubscription = await stripe.subscriptions.update(
          subscription.stripeSubscriptionId,
          {
            items: [
              {
                id: subscriptionItemId,
                price: newPlan.stripePriceId,
              },
            ],
            proration_behavior: "create_prorations",
          }
        );

      await subscription.update({
        planId: newPlan.id,
        status: updatedSubscription.status,
        endDate:
          new Date(
            updatedSubscription.current_period_end *
              1000
          ),
      });

      res.json({
        success: true,
        message: "Subscription updated successfully",
        subscription,
      });
    } catch (error) {
      next(error);
    }
  };

exports.cancelSubscription = async (req,res,next) => {

    try {
      const {subscriptionId} = req.params;

      const subscription = await Subscription.findByPk(subscriptionId);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "Subscription not found",
        });
      }

      // ============================
      // CANCEL IN STRIPE
      // ============================

      await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end:
            true,
        }
      );

      // ============================
      // UPDATE DATABASE
      // ============================

      await subscription.update({
        cancelAtPeriodEnd:true,
      });

      res.json({
        success: true,
        message:
          "Subscription will cancel at period end",
      });

    } catch (error) {
      next(error);
    }
  };