import Room from "../models/Room.js";
import Building from "../../buildings/models/Building.js";
import Floor from "../../floors/models/Floor.js";

export const findAllRooms = async () => {
  return await Room.findAll({
    include: [
      {
        model: Building,
        as: "building",
        attributes: ["id", "name"],
        required: false,
      },
      {
        model: Floor,
        as: "floor",
        attributes: ["id", "floor_number"],
        required: false,
      },
    ],
    order: [["id", "DESC"]],
  });
};

export const findRoomById = async (id, includeRelations = false) => {
  if (!includeRelations) {
    return await Room.findByPk(id);
  }

  return await Room.findByPk(id, {
    include: [
      {
        model: Building,
        as: "building",
        attributes: ["name"],
      },
      {
        model: Floor,
        as: "floor",
        attributes: ["floor_number"],
      },
    ],
  });
};

export const createRoom = async ({ building_id, floor_id, room_number }) => {
  const room = await Room.create({
    building_id,
    floor_id,
    room_number,
  });

  return await findRoomById(room.id, true);
};

export const updateRoomRecord = async (
  room,
  { building_id, floor_id, room_number },
) => {
  room.building_id = building_id;
  room.floor_id = floor_id;
  room.room_number = room_number;

  await room.save();
  return await findRoomById(room.id, true);
};
