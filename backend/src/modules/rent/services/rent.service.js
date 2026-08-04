import {
  findAllRentEntries,
  findRentEntryById,
  findRentEntryByTenantAndMonth,
  createRentEntryRecord,
} from "../repositories/rent.repository.js";
import Tenant from "../../tenants/models/Tenant.js";
import RentEntry from "../models/RentEntry.js";
import Building from "../../buildings/models/Building.js";
import Room from "../../rooms/models/Room.js"; // <-- Added missing Room import

const normalize = async (body) => {
  const tenantId = Number(body.tenant_id);

  // Fetch tenant profile to get their secure/authoritative advance amount and room number
  const tenant = await Tenant.findByPk(tenantId, {
    include: [{ model: Room, as: "room" }],
  });

  if (!tenant) {
    throw { status: 404, message: "Tenant not found" };
  }

  // Authoritative advance from Tenant profile
  const tenantAdvance = Number(tenant.advance || 0);

  const rent = Number(body.rent || 0);
  const water = Number(body.water || 0);
  const maintenance = Number(body.maintenance || 0);
  const electricity = Number(body.electricity || 0);
  const previous_due = Number(body.previous_due || 0);
  const paid = Number(body.paid || 0);

  const currentMonthCharges = rent + water + maintenance + electricity;
  const total = currentMonthCharges + previous_due;

  const status = body.status || "not vacated";
  const isVacating = status === "vacating" || status === "vacated";

  // Automatically calculate due by deducting the tenant's actual profile advance if vacating
  const due = isVacating ? total - paid - tenantAdvance : total - paid;

  return {
    tenant_id: tenantId,
    month: body.month?.trim(),
    rent,
    water,
    maintenance,
    electricity,
    previous_due,
    total,
    paid,
    advance: tenantAdvance, // Populated automatically from Tenant profile
    due,
    status,
  };
};

const validate = (data) => {
  if (!data.tenant_id || !data.month) {
    throw { status: 400, message: "Tenant and month are required" };
  }

  if (
    isNaN(data.rent) ||
    isNaN(data.water) ||
    isNaN(data.maintenance) ||
    isNaN(data.electricity)
  ) {
    throw { status: 400, message: "Invalid numeric values" };
  }
};

// Helper to fetch a single entry with full associations attached
const findRentEntryWithAssociations = async (id) => {
  return await RentEntry.findByPk(id, {
    include: [
      {
        model: Tenant,
        as: "tenant",
        include: [
          { model: Building, as: "building" },
          { model: Room, as: "room" },
        ],
      },
    ],
  });
};

export const getAllRentEntriesService = async () => {
  return await findAllRentEntries();
};

export const createRentEntryService = async (bodyData) => {
  const data = await normalize(bodyData);
  validate(data);

  const existing = await findRentEntryByTenantAndMonth(
    data.tenant_id,
    data.month,
  );
  if (existing) {
    throw {
      status: 400,
      message: "Rent already exists for this tenant and month",
    };
  }

  const newEntry = await createRentEntryRecord(data);
  return await findRentEntryWithAssociations(newEntry.id);
};

export const updateRentEntryService = async (id, bodyData) => {
  const data = await normalize(bodyData);
  validate(data);

  const entry = await findRentEntryById(id);
  if (!entry) {
    throw { status: 404, message: "Rent entry not found" };
  }

  const duplicate = await findRentEntryByTenantAndMonth(
    data.tenant_id,
    data.month,
    id,
  );
  if (duplicate) {
    throw {
      status: 400,
      message: "Another entry already exists for this tenant/month",
    };
  }

  await entry.update(data);
  return await findRentEntryWithAssociations(id);
};

export const deleteRentEntryService = async (id) => {
  const entry = await findRentEntryById(id);
  if (!entry) {
    throw { status: 404, message: "Rent entry not found" };
  }

  await entry.destroy();
  return true;
};
