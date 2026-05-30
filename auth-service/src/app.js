const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const sequelize = require("./config/db");
const { User } = require("./models");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/users", userRoutes);

/*
// FOR LOCAL MYSQL DEVELOPMENT
sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

// FOR SERVERLESS DEPLOYMENT - Export handler for AWS Lambda
const serverless = require("serverless-http");
module.exports.handler = serverless(app);