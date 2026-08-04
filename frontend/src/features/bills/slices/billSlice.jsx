import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBillsService,
  createBillService,
  updateBillService,
  deleteBillService,
} from "../services/bill.service";

export const getBills = createAsyncThunk(
  "bills/getBills",
  async (navigate, { rejectWithValue }) => {
    try {
      return await fetchBillsService(navigate);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addBill = createAsyncThunk(
  "bills/addBill",
  async ({ payload, navigate }, { rejectWithValue }) => {
    try {
      const res = await createBillService(payload, navigate);
      if (!res?.success)
        return rejectWithValue(res?.message || "Failed to create bill");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const editBill = createAsyncThunk(
  "bills/editBill",
  async ({ id, payload, navigate }, { rejectWithValue }) => {
    try {
      const res = await updateBillService(id, payload, navigate);
      if (!res?.success)
        return rejectWithValue(res?.message || "Failed to update bill");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const removeBill = createAsyncThunk(
  "bills/removeBill",
  async ({ id, navigate }, { rejectWithValue }) => {
    try {
      const res = await deleteBillService(id, navigate);
      if (!res?.success)
        return rejectWithValue(res?.message || "Failed to delete bill");

      // Return an object containing both the id and the success message
      return {
        id,
        message: res.message || "Electricity bill deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const billSlice = createSlice({
  name: "bills",
  initialState: {
    entries: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBills.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBills.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(getBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addBill.fulfilled, (state, action) => {
        if (action.payload) state.entries.unshift(action.payload);
      })
      .addCase(editBill.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.entries.findIndex(
            (b) => b.id === action.payload.id,
          );
          if (index !== -1) state.entries[index] = action.payload;
        }
      })
      .addCase(removeBill.fulfilled, (state, action) => {
        const deletedId = action.payload?.id ?? action.payload;
        state.entries = state.entries.filter((b) => b.id !== deletedId);
      });
  },
});

export default billSlice.reducer;
