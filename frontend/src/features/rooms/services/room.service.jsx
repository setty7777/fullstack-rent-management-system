import { apiRequest } from "../../../utils/api";

export const fetchRoomsApi = async (navigate) => {
  return await apiRequest({
    endpoint: "/rooms",
    method: "GET",
    navigate,
  });
};

export const fetchRoomsForFloorApi = async (floorId, navigate) => {
  return await apiRequest({
    endpoint: `/rooms/floor/${floorId}`,
    method: "GET",
    navigate,
  });
};

export const addRoomApi = async (roomData, navigate) => {
  return await apiRequest({
    endpoint: "/rooms",
    method: "POST",
    body: roomData,
    navigate,
  });
};

export const updateRoomApi = async (id, roomData, navigate) => {
  return await apiRequest({
    endpoint: `/rooms/${id}`,
    method: "PUT",
    body: roomData,
    navigate,
  });
};

export const deleteRoomApi = async (id, navigate) => {
  return await apiRequest({
    endpoint: `/rooms/${id}`,
    method: "DELETE",
    navigate,
  });
};
