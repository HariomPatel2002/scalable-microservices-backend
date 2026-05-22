const express = require("express");
const cors = require("cors");
const app = express();

// ROUTES IMPORTS
const webhookRoutes = require("./routes/webhookRoutes");
const planRoutes = require("./routes/planRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

app.use(cors());

app.use("/api/webhooks", webhookRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/invoices",invoiceRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Subscription Service Running",
  });
});

module.exports = app;