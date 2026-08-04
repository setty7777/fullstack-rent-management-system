import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDashboardCountsService } from "../services/dashboard.service";

export const getDashboardCounts = createAsyncThunk(
  "dashboard/getCounts",
  async (navigate, { rejectWithValue }) => {
    try {
      return await fetchDashboardCountsService(navigate);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    counts: {
      buildings: 0,
      floors: 0,
      rooms: 0,
      tenants: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardCounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDashboardCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(getDashboardCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
