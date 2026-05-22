const express = require("express");
const router =express.Router();

const subscriptionController = require("../controllers/subscriptionController");

router.post("/checkout",subscriptionController.createCheckoutSession);
router.put("/change-plan",subscriptionController.changeSubscriptionPlan);
router.put("/cancel/:subscriptionId",subscriptionController.cancelSubscription);

module.exports = router;