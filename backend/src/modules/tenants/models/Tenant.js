import bcrypt from "bcryptjs";
import pkg from "sequelize";
const { DataTypes } = pkg;
import { sequelize } from "../../../config/db.js";

const Tenant = sequelize.define(
  "Tenant",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    advance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    join_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    building_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "Buildings", key: "id" },
    },
    floor_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "Floors", key: "id" },
    },
    room_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "Rooms", key: "id" },
    },
    room_number: {
      type: DataTypes.STRING,
      allowNull: true, // Stores historical room number permanently
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    documents: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "Tenants",
    timestamps: true,
  },
);

export default Tenant;
