import {
  Tenant,
  Building,
  Floor,
  Room,
} from "../../../config/modelassociation.js";
import { uploadToCloudinary, deleteFromCloudinary } from "./cloudinary.service.js";
import pkg from "sequelize";
const { Op } = pkg;

// Helper function to extract Cloudinary public ID from a secure URL
const extractPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    let publicIdParts = parts.slice(uploadIndex + 1);
    if (publicIdParts[0].startsWith("v")) {
      publicIdParts = publicIdParts.slice(1);
    }
    
    const fullPublicIdWithExt = publicIdParts.join("/");
    const lastDotIndex = fullPublicIdWithExt.lastIndexOf(".");
    return lastDotIndex !== -1 ? fullPublicIdWithExt.substring(0, lastDotIndex) : fullPublicIdWithExt;
  } catch (error) {
    console.error("❌ Failed to extract public ID:", error);
    return null;
  }
};

// Fetch all tenants with joined relational data
export const getAllTenantsService = async () => {
  try {
    const tenants = await Tenant.findAll({
      include: [
        { model: Building, as: "building" },
        { model: Floor, as: "floor" },
        { model: Room, as: "room" },
      ],
    });
    return tenants;
  } catch (error) {
    console.error("❌ ERROR IN getAllTenantsService:", error);
    throw error;
  }
};

// Add tenant service (Stores room_number automatically on creation)
export const addTenantService = async (body, files) => {
  let documentPaths = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const uploadResult = await uploadToCloudinary(file.buffer);
      documentPaths.push(uploadResult.secure_url || uploadResult.url);
    }
  }

  // --- AUTOMATICALLY LOOKUP & STORE ROOM_NUMBER AT CREATION ---
  let roomNumberToStore = body.room_number || null;

  if (body.room_id) {
    const roomRecord = await Room.findByPk(body.room_id);
    if (roomRecord && roomRecord.room_number) {
      roomNumberToStore = roomRecord.room_number;
    }
  }

  const tenantData = {
    ...body,
    room_number: roomNumberToStore, // Saved directly to database row
    documents: documentPaths,
  };

  const tenant = await Tenant.create(tenantData);

  const fullTenantData = await Tenant.findByPk(tenant.id, {
    include: [
      { model: Building, as: "building" },
      { model: Floor, as: "floor" },
      { model: Room, as: "room" },
    ],
  });

  return fullTenantData;
};

// Update tenant service (Preserves existing room_number and handles files properly)
export const updateTenantService = async (id, body, files) => {
  const tenant = await Tenant.findByPk(id, {
    include: [{ model: Room, as: "room" }],
  });

  if (!tenant) {
    const error = new Error("Tenant not found");
    error.status = 404;
    throw error;
  }

  //  HANDLE DOCUMENT PATHS CORRECTLY 

  let documentPaths = [];

  if (files && files.length > 0) {
    for (const file of files) {
      const uploadResult = await uploadToCloudinary(file.buffer);
      documentPaths.push(uploadResult.secure_url || uploadResult.url);
    }
  }

  // --- AUTOMATICALLY CAPTURE OR PRESERVE ROOM_NUMBER ---
  let roomNumberToStore = tenant.room_number;

  if (body.room_id) {
    const roomRecord = await Room.findByPk(body.room_id);
    if (roomRecord && roomRecord.room_number) {
      roomNumberToStore = roomRecord.room_number;
    }
  } else if (tenant.room && tenant.room.room_number) {
    roomNumberToStore = tenant.room.room_number;
  }

  const updateData = {
    ...body,
    room_number: roomNumberToStore,
    documents: documentPaths, // Assigns a brand-new array reference so Sequelize detects it
  };

  await tenant.update(updateData);

  // Fetch full updated tenant record with associations
  const fullTenantData = await Tenant.findByPk(id, {
    include: [
      { model: Building, as: "building" },
      { model: Floor, as: "floor" },
      { model: Room, as: "room" },
    ],
  });

  return fullTenantData;
};

// Delete tenant service (Removes files from Cloudinary and record from DB)
export const deleteTenantService = async (id) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) {
    const error = new Error("Tenant not found");
    error.status = 404;
    throw error;
  }

  // Delete associated images/documents from Cloudinary
  if (tenant.documents && Array.isArray(tenant.documents)) {
    for (const docUrl of tenant.documents) {
      const publicId = extractPublicIdFromUrl(docUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }
  }

  await tenant.destroy();
  return true;
};