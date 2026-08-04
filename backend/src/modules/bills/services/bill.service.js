import {
  Bill,
  Tenant,
  Room,
  Floor,
  Building,
} from "../../../config/modelassociation.js";
import { Op } from "sequelize";

const generateBillNumber = () => {
  return `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const normalize = (body) => {
  const previous = Number(body.previous_reading);
  const current = Number(body.current_reading);
  const rate = Number(body.rate);

  const units = current - previous;
  const amount = units * rate;

  return {
    tenant_id: Number(body.tenant_id),
    previous_reading: previous,
    current_reading: current,
    units,
    rate,
    amount,
    month: body.month?.trim().toLowerCase(),
    year: Number(body.year),
  };
};

const validateBillData = (data) => {
  if (!data.tenant_id || !data.month || !data.year) {
    throw { status: 400, message: "Required fields missing" };
  }

  if (
    isNaN(data.previous_reading) ||
    isNaN(data.current_reading) ||
    isNaN(data.rate)
  ) {
    throw { status: 400, message: "Invalid numeric values" };
  }

  if (data.current_reading < data.previous_reading) {
    throw {
      status: 400,
      message: "Current reading must be greater than previous reading",
    };
  }
};

// Properly includes Tenant, Room, Floor, and Building using centralized instances
const billIncludeOptions = [
  {
    model: Tenant,
    as: "tenant",
    include: [
      { model: Room, as: "room" },
      { model: Floor, as: "floor" },
      { model: Building, as: "building" },
    ],
  },
];

export const getAllBillsService = async () => {
  const bills = await Bill.findAll({
    include: billIncludeOptions,
    order: [["created_at", "DESC"]],
  });
  return bills || [];
};

export const getLastBillService = async (tenantId) => {
  if (!tenantId) {
    throw { status: 400, message: "tenantId is required" };
  }
  const bill = await Bill.findOne({
    where: { tenant_id: tenantId },
    include: billIncludeOptions,
    order: [["created_at", "DESC"]],
  });
  return bill || null;
};

export const createBillService = async (bodyData) => {
  const data = normalize(bodyData);
  validateBillData(data);

  const existing = await Bill.findOne({
    where: {
      tenant_id: data.tenant_id,
      month: data.month,
      year: data.year,
    },
  });

  if (existing) {
    throw {
      status: 400,
      message: "Bill already exists for this tenant, month and year",
    };
  }

  const newBill = await Bill.create({
    ...data,
    bill_number: generateBillNumber(),
    generated_date: new Date(),
  });

  return await Bill.findByPk(newBill.id, {
    include: billIncludeOptions,
  });
};

export const updateBillService = async (id, bodyData) => {
  const bill = await Bill.findByPk(id);
  if (!bill) {
    throw { status: 404, message: "Bill not found" };
  }

  const data = normalize(bodyData);
  validateBillData(data);

  const duplicate = await Bill.findOne({
    where: {
      tenant_id: data.tenant_id,
      month: data.month,
      year: data.year,
      id: { [Op.ne]: id },
    },
  });

  if (duplicate) {
    throw {
      status: 400,
      message: "Another bill already exists for this tenant/month/year",
    };
  }

  await bill.update(data);

  return await Bill.findByPk(id, {
    include: billIncludeOptions,
  });
};

export const deleteBillService = async (id) => {
  const bill = await Bill.findByPk(id);
  if (!bill) {
    throw { status: 404, message: "Bill not found" };
  }

  await bill.destroy();
  return true;
};
