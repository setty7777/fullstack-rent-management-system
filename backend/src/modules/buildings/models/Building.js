import pkg from "sequelize";
const { DataTypes } = pkg;
import { sequelize } from "../../../config/db.js";

const Building = sequelize.define(
  "Building",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // Name can now be duplicate across different buildings
      validate: { notEmpty: true },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Address is now forced to be unique
    },
  },
  {
    tableName: "Buildings",
    timestamps: true,
  },
);

export default Building;
