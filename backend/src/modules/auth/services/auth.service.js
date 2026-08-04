import jwt from "jsonwebtoken";
import {
  findUserByUsername,
  findUserById,
  createUser,
} from "../repositories/auth.repository.js";
import { AUTH_MESSAGES } from "../constants/auth.constants.js";

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const registerUserService = async ({ username, password }) => {
  const existing = await findUserByUsername(username);
  if (existing) {
    const error = new Error(AUTH_MESSAGES.USER_ALREADY_EXISTS);
    error.status = 400;
    throw error;
  }

  const user = await createUser({ username, password });
  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  };
};

export const loginUserService = async ({ username, password }) => {
  const user = await findUserByUsername(username);
  if (!user) {
    const error = new Error(AUTH_MESSAGES.USER_NOT_FOUND); // Triggers "User not found" if username doesn't exist
    error.status = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error(AUTH_MESSAGES.INVALID_CREDENTIALS); // Triggers "Invalid credentials" if password is wrong
    error.status = 401;
    throw error;
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  };
};

export const getDashboardUserService = async (userId) => {
  const user = await findUserById(userId, true);
  if (!user) {
    const error = new Error(AUTH_MESSAGES.USER_NOT_FOUND);
    error.status = 401;
    throw error;
  }
  return user;
};
