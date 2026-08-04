import {
  getAllBillsService,
  getLastBillService,
  createBillService,
  updateBillService,
  deleteBillService,
} from "../services/bill.service.js";
import { BILL_MESSAGES } from "../constants/bill.constants.js";

export const getBills = async (req, res) => {
  try {
    const bills = await getAllBillsService();
    return res.json({
      success: true,
      data: bills,
    });
  } catch (err) {
    console.error("❌ GET BILLS ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: BILL_MESSAGES.FETCH_FAILED });
  }
};

export const getLastBill = async (req, res) => {
  try {
    const bill = await getLastBillService(req.query.tenantId);
    return res.json({
      success: true,
      data: bill,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    console.error("❌ LAST BILL ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: BILL_MESSAGES.FETCH_LAST_FAILED });
  }
};

export const addBill = async (req, res) => {
  try {
    const bill = await createBillService(req.body);
    return res.status(201).json({
      success: true,
      message: BILL_MESSAGES.BILL_CREATED,
      data: bill,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    console.error("❌ CREATE BILL ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: BILL_MESSAGES.CREATE_FAILED });
  }
};

export const updateBill = async (req, res) => {
  try {
    const bill = await updateBillService(req.params.id, req.body);
    return res.json({
      success: true,
      message: BILL_MESSAGES.BILL_UPDATED,
      data: bill,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    console.error("❌ UPDATE BILL ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: BILL_MESSAGES.UPDATE_FAILED });
  }
};

export const deleteBill = async (req, res) => {
  try {
    await deleteBillService(req.params.id);
    return res.json({
      success: true,
      message: BILL_MESSAGES.BILL_DELETED,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    console.error("❌ DELETE BILL ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: BILL_MESSAGES.DELETE_FAILED });
  }
};
