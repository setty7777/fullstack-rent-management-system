import { Floor, Building } from "../../../config/modelassociation.js";

export const findAllFloors = async () => {
  return await Floor.findAll({
    include: [
      {
        model: Building,
        as: "building",
        attributes: ["id", "name"],
      },
    ],
    order: [["id", "DESC"]],
  });
};

export const findFloorsByBuildingId = async (buildingId) => {
  return await Floor.findAll({
    where: { building_id: buildingId },
    order: [["id", "ASC"]],
  });
};

export const findFloorById = async (id) => {
  return await Floor.findByPk(id, {
    include: [
      {
        model: Building,
        as: "building",
        attributes: ["id", "name"],
      },
    ],
  });
};

export const createFloor = async ({ building_id, floor_number }) => {
  const newFloor = await Floor.create({ building_id, floor_number });

  return await Floor.findByPk(newFloor.id, {
    include: [
      {
        model: Building,
        as: "building",
        attributes: ["id", "name"],
      },
    ],
  });
};
