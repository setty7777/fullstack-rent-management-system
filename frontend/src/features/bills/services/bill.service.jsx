import { apiRequest } from "../../../utils/api";

export const fetchBillsService = async (navigate) => {
  const response = await apiRequest({
    endpoint: "/bills",
    method: "GET",
    navigate,
  });
  if (Array.isArray(response)) return response;
  return response?.data || response?.data?.data || [];
};

export const fetchLastBillService = async (tenantId, navigate) => {
  const data = await apiRequest({
    endpoint: `/bills/last?tenantId=${tenantId}`,
    method: "GET",
    navigate,
  });
  return data?.data || null;
};

export const createBillService = async (payload, navigate) => {
  return await apiRequest({
    endpoint: "/bills",
    method: "POST",
    body: payload,
    navigate,
  });
};

export const updateBillService = async (id, payload, navigate) => {
  return await apiRequest({
    endpoint: `/bills/${id}`,
    method: "PUT",
    body: payload,
    navigate,
  });
};

export const deleteBillService = async (id, navigate) => {
  return await apiRequest({
    endpoint: `/bills/${id}`,
    method: "DELETE",
    navigate,
  });
};
