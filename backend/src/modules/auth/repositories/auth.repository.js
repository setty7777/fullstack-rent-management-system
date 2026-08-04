import User from "../models/User.js";

export const findUserByUsername = async (username) => {
  return await User.findOne({ where: { username } });
};

export const findUserById = async (id, excludePassword = true) => {
  const options = excludePassword
    ? { attributes: { exclude: ["password"] } }
    : {};
  return await User.findByPk(id, options);
};

export const createUser = async ({ username, password }) => {
  return await User.create({ username, password });
};
