import {
  getAllRentEntriesService,
  createRentEntryService,
  updateRentEntryService,
  deleteRentEntryService,
} from "../services/rent.service.js";
import { RENT_MESSAGES } from "../constants/rent.constants.js";
import Tenant from "../../tenants/models/Tenant.js";
import Room from "../../rooms/models/Room.js";

export const getRentEntries = async (req, res) => {
  try {
    const entries = await getAllRentEntriesService();
    return res.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("❌ GET RENT ERROR:", error.message);
    return res
      .status(500)
      .json({ success: false, message: RENT_MESSAGES.FETCH_FAILED });
  }
};

export const createRentEntry = async (req, res) => {
  try {
    const entry = await createRentEntryService(req.body);

    if (req.body.status === "vacating" || req.body.status === "vacated") {
      const tenantId = req.body.tenant_id;
      const tenant = await Tenant.findByPk(tenantId, {
        include: [{ model: Room, as: "room" }],
      });

      if (tenant) {
        // Capture room number permanently before clearing room_id
        if (tenant.room && tenant.room.room_number) {
          tenant.room_number = tenant.room.room_number;
        }
        tenant.room_id = null;
        tenant.status = "vacated";
        await tenant.save();
      }
    }

    return res.status(201).json({
      success: true,
      message: RENT_MESSAGES.RENT_CREATED,
      data: entry,
    });
  } catch (error) {
    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error("❌ CREATE RENT ERROR:", error.message);
    return res
      .status(500)
      .json({ success: false, message: RENT_MESSAGES.CREATE_FAILED });
  }
};

export const updateRentEntry = async (req, res) => {
  try {
    const entry = await updateRentEntryService(req.params.id, req.body);

    if (req.body.status === "vacating" || req.body.status === "vacated") {
      const tenantId = req.body.tenant_id;
      const tenant = await Tenant.findByPk(tenantId, {
        include: [{ model: Room, as: "room" }],
      });

      if (tenant) {
        // Capture room number permanently before clearing room_id
        if (tenant.room && tenant.room.room_number) {
          tenant.room_number = tenant.room.room_number;
        }
        tenant.room_id = null;
        tenant.status = "vacated";
        await tenant.save();
      }
    }

    return res.json({
      success: true,
      message: RENT_MESSAGES.RENT_UPDATED,
      data: entry,
    });
  } catch (error) {
    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error("❌ UPDATE RENT ERROR:", error.message);
    return res
      .status(500)
      .json({ success: false, message: RENT_MESSAGES.UPDATE_FAILED });
  }
};

export const deleteRentEntry = async (req, res) => {
  try {
    await deleteRentEntryService(req.params.id);
    return res.json({
      success: true,
      message: RENT_MESSAGES.RENT_DELETED,
    });
  } catch (error) {
    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error("❌ DELETE RENT ERROR:", error.message);
    return res
      .status(500)
      .json({ success: false, message: RENT_MESSAGES.DELETE_FAILED });
  }
};
