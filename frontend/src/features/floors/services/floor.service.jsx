import apiRequest from "../../../utils/api";

export const fetchFloorsApi = async (navigate) => {
  return await apiRequest({
    endpoint: "/floors",
    method: "GET",
    navigate,
  });
};

export const addFloorApi = async (floorData, navigate) => {
  return await apiRequest({
    endpoint: "/floors",
    method: "POST",
    body: floorData,
    navigate,
  });
};

export const updateFloorApi = async (id, floorData, navigate) => {
  return await apiRequest({
    endpoint: `/floors/${id}`,
    method: "PUT",
    body: floorData,
    navigate,
  });
};

export const deleteFloorApi = async (id, navigate) => {
  return await apiRequest({
    endpoint: `/floors/${id}`,
    method: "DELETE",
    navigate,
  });
};
