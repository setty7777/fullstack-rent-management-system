import Building from "../models/Building.js";

export const findAllBuildings = async () => {
  return await Building.findAll({
    order: [["id", "DESC"]],
  });
};

export const findBuildingById = async (id) => {
  return await Building.findByPk(id);
};

export const createBuilding = async ({ name, address }) => {
  return await Building.create({ name, address });
};
