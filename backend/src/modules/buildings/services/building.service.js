import {
  findAllBuildings,
  findBuildingById,
  createBuilding,
} from "../repositories/building.repository.js";

export const getAllBuildingsService = async () => {
  const buildings = await findAllBuildings();
  return buildings || [];
};

export const addBuildingService = async ({ name, address }) => {
  const trimmedName = name?.trim();
  const trimmedAddress = address?.trim();

  if (!trimmedName || !trimmedAddress) {
    const error = new Error("Name and address are required");
    error.status = 400;
    throw error;
  }

  const building = await createBuilding({
    name: trimmedName,
    address: trimmedAddress,
  });
  return building;
};

export const updateBuildingService = async (id, { name, address }) => {
  const building = await findBuildingById(id);
  if (!building) {
    const error = new Error("Building not found");
    error.status = 404;
    throw error;
  }

  if (name) building.name = name.trim();
  if (address) building.address = address.trim();

  await building.save();
  return building;
};

export const deleteBuildingService = async (id) => {
  const building = await findBuildingById(id);
  if (!building) {
    const error = new Error("Building not found");
    error.status = 404;
    throw error;
  }

  await building.destroy();
  return true;
};
