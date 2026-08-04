import apiRequest from "../../../utils/api";

export const fetchRentApi = async (navigate) => {
  return await apiRequest({
    endpoint: "/rent",
    method: "GET",
    navigate,
  });
};

export const addRentApi = async (payload, navigate) => {
  return await apiRequest({
    endpoint: "/rent",
    method: "POST",
    body: payload,
    navigate,
  });
};

export const updateRentApi = async (id, payload, navigate) => {
  return await apiRequest({
    endpoint: `/rent/${id}`,
    method: "PUT",
    body: payload,
    navigate,
  });
};

export const deleteRentApi = async (id, navigate) => {
  return await apiRequest({
    endpoint: `/rent/${id}`,
    method: "DELETE",
    navigate,
  });
};
