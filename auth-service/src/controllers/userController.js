const userService = require("../services/userService");
const { generateTokens } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    const { accessToken, refreshToken } = generateTokens(user);
    // Save refresh token to database
    await userService.saveRefreshToken(user.id, refreshToken);

    res.status(201).json({
      message: "User registered",
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const user = await userService.loginUser(
      req.body.email,
      req.body.password
    );

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to database
    await userService.saveRefreshToken(user.id, refreshToken);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  const users = await userService.getAllUsers();

  res.json(users);
};

const getUser = async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.json(user);
};

const updateUser = async (req, res) => {
  const user = await userService.updateUser(
    req.params.id,
    req.body
  );

  res.json(user);
};

const deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);

  res.json({
    message: "User deleted",
  });
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        message: "Invalid token type",
      });
    }

    const user = await userService.getUserById(decoded.id);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Save new refresh token to database
    await userService.saveRefreshToken(user.id, newRefreshToken);

    res.status(200).json({
      message: "Token refreshed",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid refresh token",
    });
  }
};

module.exports = {
  register,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  refreshToken,
};