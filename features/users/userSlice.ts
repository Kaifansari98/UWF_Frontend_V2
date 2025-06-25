import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/utils/apiClient";

interface UserState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: UserState = {
  loading: false,
  error: null,
  success: false,
};

export const createUser = createAsyncThunk(
  "user/createUser",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/users/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "User creation failed");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
