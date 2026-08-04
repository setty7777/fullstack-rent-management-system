import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchTenantsApi,
  addTenantApi,
  updateTenantApi,
  deleteTenantApi,
} from "../services/tenant.service";
import { toast } from "react-toastify";

export const getTenants = createAsyncThunk(
  "tenants/getTenants",
  async (navigate, thunkAPI) => {
    try {
      const response = await fetchTenantsApi(navigate);
      if (!response.success) {
        return thunkAPI.rejectWithValue(
          response.message || "Failed to fetch tenants",
        );
      }
      const tenantsData = response.data || [];
      return tenantsData.map((t) => ({
        ...t,
        documents: Array.isArray(t.documents)
          ? t.documents
          : typeof t.documents === "string"
            ? JSON.parse(t.documents)
            : [],
        building: { name: t.building?.name || t.building_name || "" },
        floor: { floor_number: t.floor?.floor_number || t.floor_number || "" },
        room: { room_number: t.room?.room_number || t.room_number || "" },
      }));
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Something went wrong");
    }
  },
);

export const createTenant = createAsyncThunk(
  "tenants/createTenant",
  async ({ formData, navigate }, thunkAPI) => {
    try {
      const response = await addTenantApi(formData, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to add tenant");
        return thunkAPI.rejectWithValue(response.message);
      }
      toast.success(response.message || "Tenant added successfully");

      // If formData is a standard object, merge it to preserve names selected in form if backend response lacks them
      const rawData = response.data || {};
      const enrichedData = {
        ...rawData,
        building: rawData.building || {
          name: formData.get
            ? formData.get("building_name")
            : formData.building_name || "",
        },
        floor: rawData.floor || {
          floor_number: formData.get
            ? formData.get("floor_number")
            : formData.floor_number || "",
        },
        room: rawData.room || {
          room_number: formData.get
            ? formData.get("room_number")
            : formData.room_number || "",
        },
      };
      return enrichedData;
    } catch (error) {
      toast.error("Something went wrong");
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const updateTenant = createAsyncThunk(
  "tenants/updateTenant",
  async ({ id, formData, navigate }, thunkAPI) => {
    try {
      const response = await updateTenantApi(id, formData, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to update tenant");
        return thunkAPI.rejectWithValue(response.message);
      }
      toast.success(response.message || "Tenant updated successfully");

      const rawData = response.data || {};
      const enrichedData = {
        ...rawData,
        building: rawData.building || {
          name: formData.get
            ? formData.get("building_name")
            : formData.building_name || "",
        },
        floor: rawData.floor || {
          floor_number: formData.get
            ? formData.get("floor_number")
            : formData.floor_number || "",
        },
        room: rawData.room || {
          room_number: formData.get
            ? formData.get("room_number")
            : formData.room_number || "",
        },
      };
      return enrichedData;
    } catch (error) {
      toast.error("Something went wrong");
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const removeTenant = createAsyncThunk(
  "tenants/removeTenant",
  async ({ id, navigate }, thunkAPI) => {
    try {
      const response = await deleteTenantApi(id, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to delete tenant");
        return thunkAPI.rejectWithValue(response.message);
      }
      toast.success(response.message || "Tenant deleted successfully");
      return id;
    } catch (error) {
      toast.error("Something went wrong");
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  tenants: [],
  loading: false,
  actionLoading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: "tenants",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(getTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload;
      })
      .addCase(getTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createTenant.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.actionLoading = false;
        const t = action.payload;
        if (t) {
          const formatted = {
            ...t,
            documents: Array.isArray(t.documents) ? t.documents : [],
            building: { name: t.building?.name || t.building_name || "" },
            floor: {
              floor_number: t.floor?.floor_number || t.floor_number || "",
            },
            room: { room_number: t.room?.room_number || t.room_number || "" },
          };
          state.tenants.unshift(formatted);
        }
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateTenant.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.actionLoading = false;
        const t = action.payload;
        if (t) {
          const formatted = {
            ...t,
            documents: Array.isArray(t.documents) ? t.documents : [],
            building: { name: t.building?.name || t.building_name || "" },
            floor: {
              floor_number: t.floor?.floor_number || t.floor_number || "",
            },
            room: { room_number: t.room?.room_number || t.room_number || "" },
          };
          const index = state.tenants.findIndex(
            (item) => item.id === formatted.id,
          );
          if (index !== -1) {
            state.tenants[index] = formatted;
          }
        }
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(removeTenant.fulfilled, (state, action) => {
        state.tenants = state.tenants.filter(
          (item) => item.id !== action.payload,
        );
      });
  },
});

export const { clearError } = tenantSlice.actions;
export default tenantSlice.reducer;
