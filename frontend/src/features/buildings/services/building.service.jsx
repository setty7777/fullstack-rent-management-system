import { apiRequest } from "../../../utils/api";

export const fetchBuildingsApi = async (navigate) => {
  const response = await apiRequest({
    endpoint: "/buildings",
    method: "GET",
    navigate,
  });
  return response;
};

export const addBuildingApi = async (buildingData, navigate) => {
  const response = await apiRequest({
    endpoint: "/buildings",
    method: "POST",
    body: buildingData,
    navigate,
  });
  return response?.success !== undefined
    ? response
    : {
        success: true,
        message: response?.message || "Building added successfully",
        data: response,
      };
};

export const updateBuildingApi = async (id, buildingData, navigate) => {
  const response = await apiRequest({
    endpoint: `/buildings/${id}`,
    method: "PUT",
    body: buildingData,
    navigate,
  });
  return response?.success !== undefined
    ? response
    : {
        success: true,
        message: response?.message || "Building updated successfully",
        data: response,
      };
};

export const deleteBuildingApi = async (id, navigate) => {
  const response = await apiRequest({
    endpoint: `/buildings/${id}`,
    method: "DELETE",
    navigate,
  });
  return response?.success !== undefined
    ? response
    : {
        success: true,
        message: response?.message || "Building deleted successfully",
      };
};
