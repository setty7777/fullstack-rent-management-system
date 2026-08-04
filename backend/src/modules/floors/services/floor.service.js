import {
  findAllFloors,
  findFloorsByBuildingId,
  findFloorById,
  createFloor,
} from "../repositories/floor.repository.js";
import Building from "../../buildings/models/Building.js";

export const getAllFloorsService = async () => {
  return await findAllFloors();
};

export const getFloorsByBuildingService = async (buildingId) => {
  return await findFloorsByBuildingId(buildingId);
};

export const addFloorService = async ({ building_id, floor_number }) => {
  const trimmedFloorNumber = floor_number?.trim();

  if (!building_id || !trimmedFloorNumber) {
    const error = new Error("Building ID and floor number are required");
    error.status = 400;
    throw error;
  }

  const building = await Building.findByPk(building_id);
  if (!building) {
    const error = new Error("Building not found");
    error.status = 404;
    throw error;
  }

  return await createFloor({ building_id, floor_number: trimmedFloorNumber });
};

export const updateFloorService = async (id, { building_id, floor_number }) => {
  const floor = await findFloorById(id);
  if (!floor) {
    const error = new Error("Floor not found");
    error.status = 404;
    throw error;
  }

  const trimmedFloorNumber = floor_number
    ? floor_number.trim()
    : floor.floor_number;

  if (building_id && building_id !== floor.building_id) {
    const building = await Building.findByPk(building_id);
    if (!building) {
      const error = new Error("Building not found");
      error.status = 404;
      throw error;
    }
  }

  floor.building_id = building_id || floor.building_id;
  floor.floor_number = trimmedFloorNumber;

  await floor.save();
  return floor;
};

export const deleteFloorService = async (id) => {
  const floor = await findFloorById(id);
  if (!floor) {
    const error = new Error("Floor not found");
    error.status = 404;
    throw error;
  }

  await floor.destroy();
  return true;
};
