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
        })
        // 👇 THIS BLOCK HERE for updateUser
        .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
          const index = state.users.findIndex(user => user.id === action.payload.id);
          if (index !== -1) {
            state.users[index] = action.payload;
          }
        })
        // 👇 THIS BLOCK HERE for deleteUser
        .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
            state.users = state.users.filter((user) => user.id !== action.payload);
        });
    },
  });
  

export const updateUser = createAsyncThunk(
    "getUsers/updateUser",
    async ({ id, formData }: { id: number; formData: FormData }, { rejectWithValue }) => {
      try {
        const response = await apiClient.put(`/users/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data.user;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to update user");
      }
    }
);

export const deleteUser = createAsyncThunk(
    "getUsers/deleteUser",
    async (id: number, { rejectWithValue }) => {
      try {
        const response = await apiClient.delete(`/users/${id}`);
        return id;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete user");
      }
    }
  );
  

export default getUsersSlice.reducer;
