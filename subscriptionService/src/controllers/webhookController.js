const stripe = require(
  "../services/stripeService"
);

const {
  Subscription,
  Payment,
  Plan,
} = require("../../models");


// ======================================================
// STRIPE WEBHOOK
// ======================================================

exports.handleStripeWebhook =
  async (req, res) => {

    const sig =
      req.headers[
        "stripe-signature"
      ];

    let event;

    try {

      event =
        stripe.webhooks.constructEvent(
          req.body,
          sig,
          require("../config")
            .STRIPE_WEBHOOK_SECRET
        );

    } catch (err) {

      return res.status(400).send(
        `Webhook Error: ${err.message}`
      );
    }

    try {

      // ======================================================
      // CHECKOUT COMPLETED
      // ======================================================

      if (
        event.type ===
        "checkout.session.completed"
      ) {

        const session =
          event.data.object;

        const stripeSubscriptionId =
          session.subscription;

        // ==========================================
        // PREVENT DUPLICATE SUBSCRIPTIONS
        // ==========================================

        const existingSubscription =
          await Subscription.findOne({
            where: {
              stripeSubscriptionId,
            },
          });

        if (existingSubscription) {

          return res.json({
            received: true,
          });
        }

        // ==========================================
        // GET METADATA
        // ==========================================

        const userId =
          session.metadata.userId;

        const planId =
          session.metadata.planId;

        // ==========================================
        // FETCH STRIPE SUBSCRIPTION
        // ==========================================

        const stripeSubscription =
          await stripe.subscriptions.retrieve(
            stripeSubscriptionId
          );

        // ==========================================
        // CREATE SUBSCRIPTION
        // ==========================================

        const subscription =
          await Subscription.create({

            userId,

            planId,

            stripeSubscriptionId,

            status:
              stripeSubscription.status,

            startDate:
              new Date(
                stripeSubscription.current_period_start *
                  1000
              ),

            endDate:
              new Date(
                stripeSubscription.current_period_end *
                  1000
              ),
          });

        // ==========================================
        // CREATE PAYMENT
        // ==========================================

        await Payment.create({

          userId,

          subscriptionId:
            subscription.id,

          stripePaymentIntentId:
            session.payment_intent,

          amount:
            session.amount_total,

          currency:
            session.currency,

          status: "paid",
        });
      }

      // ======================================================
      // RECURRING PAYMENT SUCCESS
      // ======================================================

      if (
        event.type ===
        "invoice.paid"
      ) {

        const invoice =
          event.data.object;

        const subscription =
          await Subscription.findOne({
            where: {
              stripeSubscriptionId:
                invoice.subscription,
            },
          });

        if (subscription) {

          const existingPayment =
            await Payment.findOne({
              where: {
                stripePaymentIntentId:
                  invoice.payment_intent,
              },
            });

          if (!existingPayment) {

            await Payment.create({

              userId:
                subscription.userId,

              subscriptionId:
                subscription.id,

              stripePaymentIntentId:
                invoice.payment_intent,

              amount:
                invoice.amount_paid,

              currency:
                invoice.currency,

              status: "paid",
            });
          }
        }
      }

      // ======================================================
      // PAYMENT FAILED
      // ======================================================

      if (
        event.type ===
        "invoice.payment_failed"
      ) {

        const invoice =
          event.data.object;

        const subscription =
          await Subscription.findOne({
            where: {
              stripeSubscriptionId:
                invoice.subscription,
            },
          });

        if (subscription) {

          await subscription.update({
            status: "past_due",
          });
        }
      }

      // ======================================================
      // SUBSCRIPTION UPDATED
      // ======================================================

      if (
        event.type ===
        "customer.subscription.updated"
      ) {

        const stripeSubscription =
          event.data.object;

        const subscription =
          await Subscription.findOne({
            where: {
              stripeSubscriptionId:
                stripeSubscription.id,
            },
          });

        if (subscription) {

          await subscription.update({

            status:
              stripeSubscription.status,

            endDate:
              new Date(
                stripeSubscription.current_period_end *
                  1000
              ),
          });
        }
      }

      // ======================================================
      // SUBSCRIPTION DELETED
      // ======================================================

      if (
        event.type ===
        "customer.subscription.deleted"
      ) {

        const stripeSubscription =
          event.data.object;

        const subscription =
          await Subscription.findOne({
            where: {
              stripeSubscriptionId:
                stripeSubscription.id,
            },
          });

        if (subscription) {

          await subscription.update({
            status:
              "cancelled",
          });
        }
      }

      res.json({
        received: true,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });
    }
  };