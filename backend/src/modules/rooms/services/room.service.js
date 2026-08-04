import {
  findAllRooms,
  findRoomById,
  createRoom,
  updateRoomRecord,
} from "../repositories/room.repository.js";
import Building from "../../buildings/models/Building.js";
import Floor from "../../floors/models/Floor.js";

export const getAllRoomsService = async () => {
  const rooms = await findAllRooms();
  return rooms || [];
};

export const addRoomService = async ({
  building_id,
  floor_id,
  room_number,
}) => {
  const trimmedRoomNumber = room_number?.trim();
  const parsedBuildingId = Number(building_id);
  const parsedFloorId = Number(floor_id);

  if (!parsedBuildingId || !parsedFloorId || !trimmedRoomNumber) {
    const error = new Error("Building, floor and room number are required");
    error.status = 400;
    throw error;
  }

  const building = await Building.findByPk(parsedBuildingId);
  if (!building) {
    const error = new Error("Building not found");
    error.status = 404;
    throw error;
  }

  const floor = await Floor.findByPk(parsedFloorId);
  if (!floor) {
    const error = new Error("Floor not found");
    error.status = 404;
    throw error;
  }

  if (Number(floor.building_id) !== Number(parsedBuildingId)) {
    const error = new Error("Selected floor does not belong to this building");
    error.status = 400;
    throw error;
  }

  return await createRoom({
    building_id: parsedBuildingId,
    floor_id: parsedFloorId,
    room_number: trimmedRoomNumber,
  });
};

export const updateRoomService = async (
  id,
  { building_id, floor_id, room_number },
) => {
  const room = await findRoomById(id);
  if (!room) {
    const error = new Error("Room not found");
    error.status = 404;
    throw error;
  }

  const parsedBuildingId = Number(building_id);
  const parsedFloorId = Number(floor_id);
  const trimmedRoomNumber = room_number?.trim();

  const building = await Building.findByPk(parsedBuildingId);
  const floor = await Floor.findByPk(parsedFloorId);

  if (!building || !floor) {
    const error = new Error("Building or floor not found");
    error.status = 404;
    throw error;
  }

  if (Number(floor.building_id) !== Number(parsedBuildingId)) {
    const error = new Error("Selected floor does not belong to this building");
    error.status = 400;
    throw error;
  }

  return await updateRoomRecord(room, {
    building_id: parsedBuildingId,
    floor_id: parsedFloorId,
    room_number: trimmedRoomNumber,
  });
};

export const deleteRoomService = async (id) => {
  const room = await findRoomById(id);
  if (!room) {
    const error = new Error("Room not found");
    error.status = 404;
    throw error;
  }

  await room.destroy();
  return true;
};
