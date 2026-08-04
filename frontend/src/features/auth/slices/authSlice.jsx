import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi } from "../services/auth.service";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ credentials, navigate }, thunkAPI) => {
    try {
      const response = await loginApi(credentials, navigate);

      if (response && response.success === false) {
        const errorMsg = response.message || "Login failed";
        return thunkAPI.rejectWithValue(errorMsg);
      }

      return response;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Login failed";

      return thunkAPI.rejectWithValue(errorMsg);
    }
  },
);

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user || null;
        state.token = action.payload?.token || null;
        if (action.payload?.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
