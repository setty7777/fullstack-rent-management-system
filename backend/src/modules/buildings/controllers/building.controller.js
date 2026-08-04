import {
  getAllBuildingsService,
  addBuildingService,
  updateBuildingService,
  deleteBuildingService,
} from "../services/building.service.js";
import { BUILDING_MESSAGES } from "../constants/building.constants.js";

const handleSequelizeError = (err, res) => {
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors?.[0]?.path;
    if (field === "name") {
      return res
        .status(400)
        .json({ success: false, message: BUILDING_MESSAGES.NAME_EXISTS });
    }
    if (field === "address") {
      return res
        .status(400)
        .json({ success: false, message: BUILDING_MESSAGES.ADDRESS_EXISTS });
    }
    return res
      .status(400)
      .json({ success: false, message: BUILDING_MESSAGES.DUPLICATE_ENTRY });
  }
};

export const getBuildings = async (req, res) => {
  try {
    const buildings = await getAllBuildingsService();
    return res.json({ success: true, data: buildings });
  } catch (err) {
    console.error("❌ GET BUILDINGS ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: BUILDING_MESSAGES.FETCH_FAILED });
  }
};

export const addBuilding = async (req, res) => {
  try {
    const building = await addBuildingService(req.body);
    return res.status(201).json({
      success: true,
      message: BUILDING_MESSAGES.BUILDING_ADDED,
      data: building,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    const handled = handleSequelizeError(err, res);
    if (handled) return handled;

    console.error("❌ ADD BUILDING ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: BUILDING_MESSAGES.ADD_FAILED });
  }
};

export const updateBuilding = async (req, res) => {
  const { id } = req.params;
  try {
    const building = await updateBuildingService(id, req.body);
    return res.json({
      success: true,
      message: BUILDING_MESSAGES.BUILDING_UPDATED,
      data: building,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    const handled = handleSequelizeError(err, res);
    if (handled) return handled;

    console.error("❌ UPDATE BUILDING ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: BUILDING_MESSAGES.UPDATE_FAILED });
  }
};

export const deleteBuilding = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteBuildingService(id);
    return res.json({
      success: true,
      message: BUILDING_MESSAGES.BUILDING_DELETED,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    console.error("❌ DELETE BUILDING ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: BUILDING_MESSAGES.DELETE_FAILED });
  }
};
