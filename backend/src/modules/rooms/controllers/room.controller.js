import {
  getAllRoomsService,
  addRoomService,
  updateRoomService,
  deleteRoomService,
} from "../services/room.service.js";
import { ROOM_MESSAGES } from "../constants/room.constants.js";

const handleSequelizeError = (err, res) => {
  if (err.name === "SequelizeUniqueConstraintError") {
    return res
      .status(400)
      .json({ success: false, message: ROOM_MESSAGES.ROOM_EXISTS });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await getAllRoomsService();
    return res.json({ success: true, data: rooms });
  } catch (err) {
    console.error("❌ GET ROOMS ERROR FULL:", err);
    return res
      .status(500)
      .json({ success: false, message: ROOM_MESSAGES.FETCH_FAILED });
  }
};

export const addRoom = async (req, res) => {
  try {
    const newRoom = await addRoomService(req.body);
    return res.status(201).json({
      success: true,
      message: ROOM_MESSAGES.ROOM_ADDED,
      data: newRoom,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    const handled = handleSequelizeError(err, res);
    if (handled) return handled;

    console.error("❌ ADD ROOM ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: ROOM_MESSAGES.ADD_FAILED });
  }
};

export const updateRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedRoom = await updateRoomService(id, req.body);
    return res.json({
      success: true,
      message: ROOM_MESSAGES.ROOM_UPDATED,
      data: updatedRoom,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    const handled = handleSequelizeError(err, res);
    if (handled) return handled;

    console.error("❌ UPDATE ROOM ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: ROOM_MESSAGES.UPDATE_FAILED });
  }
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteRoomService(id);
    return res.json({ success: true, message: ROOM_MESSAGES.ROOM_DELETED });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    console.error("❌ DELETE ROOM ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: ROOM_MESSAGES.DELETE_FAILED });
  }
};
