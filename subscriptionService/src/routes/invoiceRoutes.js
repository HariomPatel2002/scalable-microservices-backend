const express = require(
  "express"
);

const router =
  express.Router();

const invoiceController =
  require(
    "../controllers/invoiceController"
  );

router.get(
  "/:subscriptionId",

  invoiceController.getInvoices
);

module.exports = router;