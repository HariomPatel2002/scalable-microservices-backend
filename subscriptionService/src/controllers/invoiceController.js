const stripe = require("../services/stripeService");

const {Subscription,} = require("../../models");

// ======================================
// GET USER INVOICES
// ======================================

exports.getInvoices = async (req,res,next) => {

    try {
      const {subscriptionId} = req.params;

      const subscription = await Subscription.findByPk(subscriptionId );

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      const invoices = await stripe.invoices.list({
          subscription: subscription.stripeSubscriptionId,
        });

      // ============================
      // FORMAT RESPONSE
      // ============================

      const formattedInvoices =
        invoices.data.map(
          (invoice) => ({
            id: invoice.id,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            status: invoice.status,
            hosted_invoice_url: invoice.hosted_invoice_url,
            invoice_pdf: invoice.invoice_pdf,
            created: invoice.created,
          })
        );

      res.json({
        success: true,
        count: formattedInvoices.length,
        invoices: formattedInvoices,
      });

    } catch (error) {
      next(error);
    }
  };