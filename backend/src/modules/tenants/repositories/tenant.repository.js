import Tenant from "../models/Tenant.js";
import Building from "../../buildings/models/Building.js";
import Floor from "../../floors/models/Floor.js";
import Room from "../../rooms/models/Room.js";

export const findAllTenants = async () => {
  return await Tenant.findAll({
    order: [["id", "DESC"]],
    include: [
      { model: Building, as: "building", attributes: ["id", "name"] },
      { model: Floor, as: "floor", attributes: ["id", "floor_number"] },
      { model: Room, as: "room", attributes: ["id", "room_number"] },
    ],
  });
};

export const findTenantById = async (id) => {
  return await Tenant.findByPk(id);
};

export const findTenantByRoomId = async (room_id) => {
  return await Tenant.findOne({
    where: { room_id },
  });
};

export const createTenantRecord = async (tenantData) => {
  return await Tenant.create(tenantData);
};
