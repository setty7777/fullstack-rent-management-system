import {
  registerUserService,
  loginUserService,
  getDashboardUserService,
} from "../services/auth.service.js";
import { AUTH_MESSAGES } from "../constants/auth.constants.js";

export const registerUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: AUTH_MESSAGES.USERNAME_PASSWORD_REQUIRED,
      });
    }

    const result = await registerUserService({ username, password });

    return res.status(201).json({
      success: true,
      user: result.user,
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    return res.status(500).json({
      success: false,
      message: AUTH_MESSAGES.SERVER_ERROR,
    });
  }
};

export const loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: AUTH_MESSAGES.USERNAME_PASSWORD_REQUIRED,
      });
    }

    const result = await loginUserService({ username, password });

    return res.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    return res.status(500).json({
      success: false,
      message: AUTH_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getDashboard = async (req, res) => {
  return res.json({
    success: true,
    message: AUTH_MESSAGES.DASHBOARD_ACCESS,
    user: {
      id: req.user.id,
      username: req.user.username,
    },
  });
};
