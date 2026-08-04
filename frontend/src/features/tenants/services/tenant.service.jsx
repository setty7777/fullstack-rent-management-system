import { apiRequest } from "../../../utils/api";

export const fetchTenantsApi = async (navigate) => {
  return await apiRequest({
    endpoint: "/tenants",
    method: "GET",
    navigate,
  });
};

export const addTenantApi = async (formData, navigate) => {
  return await apiRequest({
    endpoint: "/tenants",
    method: "POST",
    body: formData,
    navigate,
  });
};

export const updateTenantApi = async (id, formData, navigate) => {
  return await apiRequest({
    endpoint: `/tenants/${id}`,
    method: "PUT",
    body: formData,
    navigate,
  });
};

export const deleteTenantApi = async (id, navigate) => {
  return await apiRequest({
    endpoint: `/tenants/${id}`,
    method: "DELETE",
    navigate,
  });
};
