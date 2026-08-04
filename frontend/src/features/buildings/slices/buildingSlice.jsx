import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBuildingsApi,
  addBuildingApi,
  updateBuildingApi,
  deleteBuildingApi,
} from "../services/building.service";
import { toast } from "react-toastify";

export const getBuildings = createAsyncThunk(
  "buildings/getBuildings",
  async (navigate, thunkAPI) => {
    try {
      const response = await fetchBuildingsApi(navigate);
      if (!response.success) {
        return thunkAPI.rejectWithValue(
          response.message || "Failed to fetch buildings",
        );
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Something went wrong");
    }
  },
);

export const createBuilding = createAsyncThunk(
  "buildings/createBuilding",
  async ({ buildingData, navigate }, thunkAPI) => {
    try {
      const response = await addBuildingApi(buildingData, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to add building");
        return thunkAPI.rejectWithValue(
          response.message || "Failed to add building",
        );
      }
      toast.success(response.message || "Building added successfully");
      return response; // Returns full wrapper: { success, message, data }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMsg);
      return thunkAPI.rejectWithValue(errorMsg);
    }
  },
);

export const updateBuilding = createAsyncThunk(
  "buildings/updateBuilding",
  async ({ id, buildingData, navigate }, thunkAPI) => {
    try {
      const response = await updateBuildingApi(id, buildingData, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to update building");
        return thunkAPI.rejectWithValue(
          response.message || "Failed to update building",
        );
      }
      toast.success(response.message || "Building updated successfully");
      return response; // Returns full wrapper: { success, message, data }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMsg);
      return thunkAPI.rejectWithValue(errorMsg);
    }
  },
);

export const removeBuilding = createAsyncThunk(
  "buildings/removeBuilding",
  async ({ id, navigate }, thunkAPI) => {
    try {
      const response = await deleteBuildingApi(id, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to delete building");
        return thunkAPI.rejectWithValue(response.message);
      }
      toast.success(response.message || "Building deleted successfully");
      return { id, message: response.message };
    } catch (error) {
      toast.error("Something went wrong");
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  buildings: [],
  loading: false,
  actionLoading: false,
  error: null,
};

const buildingSlice = createSlice({
  name: "buildings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(getBuildings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBuildings.fulfilled, (state, action) => {
        state.loading = false;
        state.buildings = action.payload;
      })
      .addCase(getBuildings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createBuilding.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createBuilding.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.data) {
          state.buildings.unshift(action.payload.data);
        }
      })
      .addCase(createBuilding.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateBuilding.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateBuilding.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedBuilding = action.payload?.data;
        if (updatedBuilding) {
          const index = state.buildings.findIndex(
            (b) => b.id === updatedBuilding.id,
          );
          if (index !== -1) {
            state.buildings[index] = updatedBuilding;
          }
        }
      })
      .addCase(updateBuilding.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(removeBuilding.fulfilled, (state, action) => {
        state.buildings = state.buildings.filter(
          (b) => b.id !== action.payload.id,
        );
      });
  },
});

export const { clearError } = buildingSlice.actions;
export default buildingSlice.reducer;
