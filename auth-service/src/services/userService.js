const { User } = require("../models");
const bcrypt = require("bcryptjs");

/**
 * Helper function to format custom operational errors
 */
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Create a new user with hashed password
 */
const createUser = async (data) => {
  try {
    const existingUser = await User.findOne({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw createError("User already exists with this email", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // Strip password from return object
    const userJson = user.toJSON();
    delete userJson.password;
    
    return userJson;
  } catch (error) {
    throw error; // Let the controller or global error handler catch it
  }
};

/**
 * Authenticate a user and verify credentials
 */
const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw createError("Email and password are required", 400);
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw createError("Invalid email or password", 401); // 401 Unauthorized (Vague message for security)
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw createError("Invalid email or password", 401); 
    }

    const userJson = user.toJSON();
    delete userJson.password;

    return userJson;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all users omitting passwords
 */
const getAllUsers = async () => {
  try {
    return await User.findAll({
      attributes: { exclude: ["password"] },
    });
  } catch (error) {
    throw createError(`Failed to retrieve users: ${error.message}`, 500);
  }
};

/**
 * Fetch a single user by primary key omitting password
 */
const getUserById = async (id) => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user details (with dynamic password re-hashing)
 */
const updateUser = async (id, data) => {
  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw createError("User not found", 404);
    }

    const updatePayload = { ...data };

    // Format email if it's being updated
    if (updatePayload.email) {
      updatePayload.email = updatePayload.email.toLowerCase().trim();
    }

    // CRITICAL: Hash password if the user is changing it
    if (updatePayload.password) {
      updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
    }

    await user.update(updatePayload);

    const updatedUserJson = user.toJSON();
    delete updatedUserJson.password;

    return updatedUserJson;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw createError("User not found", 404);
    }

    await user.destroy();
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Save refresh token to user record
 */
const saveRefreshToken = async (id, refreshToken) => {
  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw createError("User not found", 404);
    }

    await user.update({ refreshToken });
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  saveRefreshToken,
};