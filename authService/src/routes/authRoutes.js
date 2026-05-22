const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema,} = require("../validators/authValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require( "../middlewares/roleMiddleware");
const requestlogger = require("../middlewares/requestLogger");


router.post("/register",validate(registerSchema), authController.register);
router.post( "/login", validate(loginSchema), authController.login);
router.post(  "/refresh-token", authController.refreshToken);
router.post( "/logout", authMiddleware, authController.logout);

router.get( "/admin", authMiddleware, authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message:
        "Welcome Admin",
    });
});

router.get("/protected", authMiddleware, (req, res) => {

  res.json({    
    message: "This is a protected route",
    user: req.user,
  });
});

module.exports = router;