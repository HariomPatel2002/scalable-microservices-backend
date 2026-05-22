const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {User} = require('../models')
const { generateAccessToken, generateRefreshToken,} = require("../utils/jwt");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");

exports.register = async ( req,res) => {

  try {
    const {name, email,password,role} = req.body;
    logger.info(`Attempting to register user with email: ${email}`);

    const existingUser =
      await User.findOne({
        where: { email },
      });

    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({
        success: false,
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    await user.update({refreshToken});

    logger.info(`User registered successfully with email: ${email}`);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req,res) => {

  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
    logger.warn(`Login failed: User not found for email: ${email}`);
    throw new AppError(
      "User not found",
      404
    );
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      logger.warn(`Login failed: Invalid credentials for email: ${email}`);
      throw new AppError(
        "Invalid credentials",
        400
      );
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    await user.update({
      refreshToken,
    });

    logger.info(`Login successful for email: ${email}`);
    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user,
    });

  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.refreshToken = async (
  req,
  res,
  next
) => {

  try {

    const { refreshToken } =
      req.body;

    logger.info("Refresh token request received");

    if (!refreshToken) {
      logger.warn("Refresh token request failed: No refresh token provided");
      return res.status(401).json({
        success: false,
        message:
          "Refresh token required",
      });
    }

    const user =
      await User.findOne({
        where: {
          refreshToken,
        },
      });

    if (!user) {
      logger.warn("Refresh token request failed: Invalid refresh token");
      return res.status(403).json({
        success: false,
        message:
          "Invalid refresh token",
      });
    }
    jwt.verify(
      refreshToken,
      config.JWT_REFRESH_SECRET,
      async (err) => {
        if (err) {
          logger.warn(`Refresh token verification failed: ${err.message}`);
          return res.status(403).json({
            success: false,
            message:
              "Invalid refresh token",
          });
        }

        const newAccessToken =  generateAccessToken(user);
        const newRefreshToken =  generateRefreshToken(user);

        await user.update({
          refreshToken:newRefreshToken,
        });

        logger.info(`New access token and refresh token generated for user: ${user.email}`);
        res.status(200).json({
          success: true,
          accessToken:newAccessToken,
          refreshToken:newRefreshToken,
        });
      }
    );
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    next(error);
  }
};

exports.logout = async (req,res) => {

  try {
    logger.info(`Logout request for user: ${req.user.id}`);
    await User.update(
      {
        refreshToken: null,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );
    logger.info(`User logged out successfully: ${req.user.id}`);
    res.json({
      success: true,
      message:
        "Logged out successfully",
    });

  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      message: error.message,
    });
  }
};