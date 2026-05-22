const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require( "./middlewares/errorMiddleware");

const app = express();
app.use(errorMiddleware);

app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);

app.get("/", (req, res) => {
  res.json({
    message:
      "Auth Service Running",
  });
});

module.exports = app;   