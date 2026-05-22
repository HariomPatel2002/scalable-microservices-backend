const jwt = require(
  "jsonwebtoken"
);

const config = require(
  "../config"
);

module.exports = (
  req,
  res,
  next
) => {

  try {

    const token =
      req.headers.authorization?.split(
        " "
      )[1];

    if (!token) {

      return res.status(401).json({
        message:
          "No token",
      });
    }

    const decoded =
      jwt.verify(
        token,
        config.JWT_ACCESS_SECRET
      );

    if (
      decoded.role !== "admin"
    ) {

      return res.status(403).json({
        message:
          "Admin access required",
      });
    }

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      message:
        "Invalid token",
    });
  }
};