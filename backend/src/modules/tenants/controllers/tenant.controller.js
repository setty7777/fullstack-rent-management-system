import {
  getAllTenantsService,
  addTenantService,
  updateTenantService,
  deleteTenantService,
} from "../services/tenant.service.js";
import { TENANT_MESSAGES } from "../constants/tenant.constants.js";

export const getTenants = async (req, res) => {
  try {
    const tenants = await getAllTenantsService();
    return res.json({
      success: true,
      count: tenants.length,
      data: tenants,
    });
  } catch (error) {
    console.error("❌ GET TENANTS ERROR:", error.message);
    return res
      .status(500)
      .json({ success: false, message: TENANT_MESSAGES.FETCH_FAILED });
  }
};

export const addTenant = async (req, res) => {
  try {
    const tenant = await addTenantService(req.body, req.files);
    return res.status(201).json({
      success: true,
      message: TENANT_MESSAGES.TENANT_ADDED,
      data: tenant,
    });
  } catch (error) {
    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error("❌ ADD TENANT ERROR:", error.message);
    return res
      .status(500)
      .json({ success: false, message: TENANT_MESSAGES.ADD_FAILED });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const tenant = await updateTenantService(
      req.params.id,
      req.body,
      req.files,
    );
    return res.json({
      success: true,
      message: TENANT_MESSAGES.TENANT_UPDATED,
      data: tenant,
    });
  } catch (error) {
    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error("❌ UPDATE TENANT ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: TENANT_MESSAGES.UPDATE_FAILED });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    await deleteTenantService(req.params.id);
    return res.json({
      success: true,
      message: TENANT_MESSAGES.TENANT_DELETED,
    });
  } catch (error) {
    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error("❌ DELETE TENANT ERROR:", error.message);
    return res
      .status(500)
      .json({ success: false, message: TENANT_MESSAGES.DELETE_FAILED });
  }
};
