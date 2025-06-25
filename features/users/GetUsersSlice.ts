import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/utils/apiClient";

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  age: number;
  country: string;
  state: string;
  city: string;
  pincode: string;
  mobile_no: string;
  profile_pic: string | null;
}

interface UserListState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserListState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchAllUsers = createAsyncThunk(
  "getUsers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/users");
      return response.data.users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

const getUsersSlice = createSlice({
  name: "getUsers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default getUsersSlice.reducer;
