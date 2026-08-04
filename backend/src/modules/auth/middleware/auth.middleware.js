import jwt from "jsonwebtoken";
import { findUserById } from "../repositories/auth.repository.js";
import { AUTH_MESSAGES } from "../constants/auth.constants.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: AUTH_MESSAGES.NO_TOKEN_PROVIDED,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id, true);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: AUTH_MESSAGES.USER_NOT_FOUND,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: AUTH_MESSAGES.TOKEN_EXPIRED,
      });
    }

    return res.status(401).json({
      success: false,
      message: AUTH_MESSAGES.INVALID_TOKEN,
    });
  }
};
