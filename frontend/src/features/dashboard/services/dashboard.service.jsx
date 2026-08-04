import { apiRequest } from "../../../utils/api";

export const fetchDashboardCountsService = async (navigate) => {
  const [buildings, floors, rooms, tenants] = await Promise.all([
    apiRequest({ endpoint: "/buildings", method: "GET", navigate }),
    apiRequest({ endpoint: "/floors", method: "GET", navigate }),
    apiRequest({ endpoint: "/rooms", method: "GET", navigate }),
    apiRequest({ endpoint: "/tenants", method: "GET", navigate }),
  ]);

  const extractLength = (res) => {
    if (!res) return 0;
    if (Array.isArray(res)) return res.length;
    if (Array.isArray(res.data)) return res.data.length;
    if (Array.isArray(res.data?.data)) return res.data.data.length;
    return 0;
  };

  return {
    buildings: extractLength(buildings),
    floors: extractLength(floors),
    rooms: extractLength(rooms),
    tenants: extractLength(tenants),
  };
};
