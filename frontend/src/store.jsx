import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/slices/authSlice";
import buildingReducer from "./features/buildings/slices/buildingSlice";
import floorReducer from "./features/floors/slices/floorSlice";
import roomReducer from "./features/rooms/slices/roomSlice";
import tenantReducer from "./features/tenants/slices/tenantSlice";
import rentReducer from "./features/rent/slices/rentSlice";
import billReducer from "./features/bills/slices/billSlice";
import dashboardReducer from "./features/dashboard/slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    buildings: buildingReducer,
    floors: floorReducer,
    rooms: roomReducer,
    tenants: tenantReducer,
    rent: rentReducer,
    bills: billReducer,
    dashboard: dashboardReducer,
  },
});

export default store;
