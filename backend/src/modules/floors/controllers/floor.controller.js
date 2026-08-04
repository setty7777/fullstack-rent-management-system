import {
  getAllFloorsService,
  getFloorsByBuildingService,
  addFloorService,
  updateFloorService,
  deleteFloorService,
} from "../services/floor.service.js";
import { FLOOR_MESSAGES } from "../constants/floor.constants.js";

const handleSequelizeError = (err, res) => {
  if (err.name === "SequelizeUniqueConstraintError") {
    return res
      .status(400)
      .json({ success: false, message: FLOOR_MESSAGES.FLOOR_EXISTS });
  }
};

export const getFloors = async (req, res) => {
  try {
    const floors = await getAllFloorsService();
    return res.json({ success: true, data: floors });
  } catch (err) {
    console.error("❌ GET FLOORS ERROR:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: FLOOR_MESSAGES.FETCH_FAILED,
        error: err.message,
      });
  }
};

export const getFloorsByBuilding = async (req, res) => {
  const { buildingId } = req.params;
  try {
    const floors = await getFloorsByBuildingService(buildingId);
    return res.json({ success: true, data: floors || [] });
  } catch (err) {
    console.error("❌ GET FLOORS BY BUILDING ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: FLOOR_MESSAGES.FETCH_FAILED });
  }
};

export const addFloor = async (req, res) => {
  try {
    const floor = await addFloorService(req.body);
    return res.status(201).json({
      success: true,
      message: FLOOR_MESSAGES.FLOOR_ADDED,
      data: floor,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    const handled = handleSequelizeError(err, res);
    if (handled) return handled;

    console.error("❌ ADD FLOOR ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: FLOOR_MESSAGES.ADD_FAILED });
  }
};

export const updateFloor = async (req, res) => {
  const { id } = req.params;
  try {
    const floor = await updateFloorService(id, req.body);
    return res.json({
      success: true,
      message: FLOOR_MESSAGES.FLOOR_UPDATED,
      data: floor,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    const handled = handleSequelizeError(err, res);
    if (handled) return handled;

    console.error("❌ UPDATE FLOOR ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: FLOOR_MESSAGES.UPDATE_FAILED });
  }
};

export const deleteFloor = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteFloorService(id);
    return res.json({ success: true, message: FLOOR_MESSAGES.FLOOR_DELETED });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    console.error("❌ DELETE FLOOR ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: FLOOR_MESSAGES.DELETE_FAILED });
  }
};
