import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchRoomsApi,
  addRoomApi,
  updateRoomApi,
  deleteRoomApi,
} from "../services/room.service";
import { toast } from "react-toastify";

export const getRooms = createAsyncThunk(
  "rooms/getRooms",
  async (navigate, thunkAPI) => {
    try {
      const response = await fetchRoomsApi(navigate);

      if (!response.success) {
        return thunkAPI.rejectWithValue(
          response.message || "Failed to fetch rooms",
        );
      }

      // Check if data is nested
      const roomsArray = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.rooms || [];

      return roomsArray;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Something went wrong");
    }
  },
);

export const createRoom = createAsyncThunk(
  "rooms/createRoom",
  async ({ roomData, navigate }, thunkAPI) => {
    try {
      const response = await addRoomApi(roomData, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to add room");
        return thunkAPI.rejectWithValue(
          response.message || "Failed to add room",
        );
      }
      toast.success(response.message || "Room added successfully");
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

export const updateRoom = createAsyncThunk(
  "rooms/updateRoom",
  async ({ id, roomData, navigate }, thunkAPI) => {
    try {
      const response = await updateRoomApi(id, roomData, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to update room");
        return thunkAPI.rejectWithValue(
          response.message || "Failed to update room",
        );
      }
      toast.success(response.message || "Room updated successfully");
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

export const removeRoom = createAsyncThunk(
  "rooms/removeRoom",
  async ({ id, navigate }, thunkAPI) => {
    try {
      const response = await deleteRoomApi(id, navigate);
      if (!response.success) {
        toast.error(response.message || "Failed to delete room");
        return thunkAPI.rejectWithValue(response.message);
      }
      toast.success(response.message || "Room deleted successfully");
      return { id, message: response.message };
    } catch (error) {
      toast.error("Something went wrong");
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  rooms: [],
  loading: false,
  actionLoading: false,
  error: null,
};

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(getRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(getRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createRoom.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.data) {
          state.rooms.unshift(action.payload.data);
        }
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateRoom.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedRoom = action.payload?.data;
        if (updatedRoom) {
          const index = state.rooms.findIndex((r) => r.id === updatedRoom.id);
          if (index !== -1) {
            state.rooms[index] = updatedRoom;
          }
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(removeRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter((r) => r.id !== action.payload.id);
      });
  },
});

export const { clearError } = roomSlice.actions;
export default roomSlice.reducer;
