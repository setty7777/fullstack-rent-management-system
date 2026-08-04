import Bill from "../models/Bill.js";
import Tenant from "../../tenants/models/Tenant.js";
import Room from "../../rooms/models/Room.js";
import Floor from "../../floors/models/Floor.js";
import Building from "../../buildings/models/Building.js";
import { Op } from "sequelize";

export const findAllBills = async () => {
  return await Bill.findAll({
    include: [
      {
        model: Tenant,
        as: "tenant",
        attributes: ["id", "name"],
        required: false,
        include: [
          {
            model: Room,
            as: "room",
            attributes: ["room_number"],
            required: false,
          },
          {
            model: Floor,
            as: "floor",
            attributes: ["floor_number"],
            required: false,
          },
          {
            model: Building,
            as: "building",
            attributes: ["name"],
            required: false,
          },
        ],
      },
    ],
    order: [["id", "DESC"]],
  });
};

export const findBillById = async (id) => {
  return await Bill.findByPk(id);
};

export const findBillByTenantMonthYear = async (
  tenant_id,
  month,
  year,
  excludeId = null,
) => {
  const whereClause = {
    tenant_id,
    month,
    year,
  };

  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  return await Bill.findOne({ where: whereClause });
};

export const findLastBillByTenantId = async (tenantId) => {
  return await Bill.findOne({
    where: { tenant_id: tenantId },
    order: [["created_at", "DESC"]],
  });
};

export const createBillRecord = async (data) => {
  return await Bill.create(data);
};
