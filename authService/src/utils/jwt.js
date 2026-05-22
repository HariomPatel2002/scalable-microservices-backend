const jwt = require("jsonwebtoken");
const config = require("../config");

const generateAccessToken = (user) => {

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    config.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (user) => {

  return jwt.sign(
    {
      id: user.id,
    },
    config.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = {generateAccessToken,generateRefreshToken,};