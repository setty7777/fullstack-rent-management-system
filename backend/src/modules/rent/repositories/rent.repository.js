import RentEntry from "../models/RentEntry.js";
import Tenant from "../../tenants/models/Tenant.js";
import Building from "../../buildings/models/Building.js";
import Room from "../../rooms/models/Room.js";
import { Op } from "sequelize";

export const findAllRentEntries = async () => {
  return await RentEntry.findAll({
    include: [
      {
        model: Tenant,
        as: "tenant",
        required: true,
        attributes: ["id", "name", "room_number"], // <-- Added "room_number" here
        include: [
          {
            model: Building,
            as: "building",
            attributes: ["name"],
          },
          {
            model: Room,
            as: "room",
            attributes: ["room_number"],
          },
        ],
      },
    ],
    order: [["created_at", "ASC"]],
  });
};

export const findRentEntryById = async (id) => {
  return await RentEntry.findByPk(id);
};

export const findRentEntryByTenantAndMonth = async (
  tenant_id,
  month,
  excludeId = null,
) => {
  const whereClause = {
    tenant_id,
    month,
  };

  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  return await RentEntry.findOne({ where: whereClause });
};

export const createRentEntryRecord = async (data) => {
  return await RentEntry.create(data);
};
