import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchRentApi,
  addRentApi,
  updateRentApi,
  deleteRentApi,
} from "../services/rent.service";
import { toast } from "react-toastify";

export const getRentEntries = createAsyncThunk(
  "rent/getRentEntries",
  async (navigate, thunkAPI) => {
    try {
      const response = await fetchRentApi(navigate);

      if (!response.success) {
        return thunkAPI.rejectWithValue(
          response.message || "Failed to fetch rent entries",
        );
      }

      // Check if data is nested
      const rentArray = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.entries || [];

      return rentArray;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Something went wrong");
    }
  },
);

export const createRentEntry = createAsyncThunk(
  "rent/createRentEntry",
  async ({ payload, navigate }, thunkAPI) => {
    try {
      const response = await addRentApi(payload, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to add rent entry");
        return thunkAPI.rejectWithValue(
          response.message || "Failed to add rent entry",
        );
      }
      toast.success(response.message || "Rent entry added successfully");
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

export const updateRentEntry = createAsyncThunk(
  "rent/updateRentEntry",
  async ({ id, payload, navigate }, thunkAPI) => {
    try {
      const response = await updateRentApi(id, payload, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to update rent entry");
        return thunkAPI.rejectWithValue(
          response.message || "Failed to update rent entry",
        );
      }
      toast.success(response.message || "Rent entry updated successfully");
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

export const removeRentEntry = createAsyncThunk(
  "rent/removeRentEntry",
  async ({ id, navigate }, thunkAPI) => {
    try {
      const response = await deleteRentApi(id, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to delete rent entry");
        return thunkAPI.rejectWithValue(response.message);
      }
      toast.success(response.message || "Rent entry deleted successfully");
      return { id, message: response.message };
    } catch (error) {
      toast.error("Something went wrong");
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  entries: [],
  loading: false,
  actionLoading: false,
  error: null,
};

const rentSlice = createSlice({
  name: "rent",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(getRentEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRentEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(getRentEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createRentEntry.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createRentEntry.fulfilled, (state, action) => {
        state.actionLoading = false;
        const newEntry = action.payload?.data || action.payload;
        if (newEntry) {
          state.entries.unshift(newEntry);
        }
      })
      .addCase(createRentEntry.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateRentEntry.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateRentEntry.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedEntry = action.payload?.data || action.payload;
        if (updatedEntry && updatedEntry.id) {
          const index = state.entries.findIndex(
            (e) => e.id === updatedEntry.id,
          );
          if (index !== -1) {
            state.entries[index] = updatedEntry;
          }
        }
      })
      .addCase(updateRentEntry.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(removeRentEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter((e) => e.id !== action.payload.id);
      });
  },
});

export const { clearError } = rentSlice.actions;
export default rentSlice.reducer;
