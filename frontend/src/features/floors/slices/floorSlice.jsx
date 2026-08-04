import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchFloorsApi,
  addFloorApi,
  updateFloorApi,
  deleteFloorApi,
} from "../services/floor.service";
import { toast } from "react-toastify";

export const getFloors = createAsyncThunk(
  "floors/getFloors",
  async (navigate, thunkAPI) => {
    try {
      const response = await fetchFloorsApi(navigate);

      if (!response.success) {
        return thunkAPI.rejectWithValue(
          response.message || "Failed to fetch floors",
        );
      }

      // Check if data is nested
      const floorsArray = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.floors || [];

      return floorsArray;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Something went wrong");
    }
  },
);

export const createFloor = createAsyncThunk(
  "floors/createFloor",
  async ({ floorData, navigate }, thunkAPI) => {
    try {
      const response = await addFloorApi(floorData, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to add floor");
        return thunkAPI.rejectWithValue(
          response.message || "Failed to add floor",
        );
      }
      toast.success(response.message || "Floor added successfully");
      return response;
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

export const updateFloor = createAsyncThunk(
  "floors/updateFloor",
  async ({ id, floorData, navigate }, thunkAPI) => {
    try {
      const response = await updateFloorApi(id, floorData, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to update floor");
        return thunkAPI.rejectWithValue(
          response.message || "Failed to update floor",
        );
      }
      toast.success(response.message || "Floor updated successfully");
      return response;
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

export const removeFloor = createAsyncThunk(
  "floors/removeFloor",
  async ({ id, navigate }, thunkAPI) => {
    try {
      const response = await deleteFloorApi(id, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to delete floor");
        return thunkAPI.rejectWithValue(response.message);
      }
      toast.success(response.message || "Floor deleted successfully");
      return { id, message: response.message };
    } catch (error) {
      toast.error("Something went wrong");
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  floors: [],
  loading: false,
  actionLoading: false,
  error: null,
};

const floorSlice = createSlice({
  name: "floors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(getFloors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFloors.fulfilled, (state, action) => {
        state.loading = false;
        state.floors = action.payload;
      })
      .addCase(getFloors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createFloor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createFloor.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.data) {
          state.floors.unshift(action.payload.data);
        }
      })
      .addCase(createFloor.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateFloor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateFloor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedFloor = action.payload?.data;
        if (updatedFloor) {
          const index = state.floors.findIndex((f) => f.id === updatedFloor.id);
          if (index !== -1) {
            state.floors[index] = updatedFloor;
          }
        }
      })
      .addCase(updateFloor.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(removeFloor.fulfilled, (state, action) => {
        state.floors = state.floors.filter((f) => f.id !== action.payload.id);
      });
  },
});

export const { clearError } = floorSlice.actions;
export default floorSlice.reducer;
