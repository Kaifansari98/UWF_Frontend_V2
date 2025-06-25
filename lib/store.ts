import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import userReducer from "@/features/users/userSlice"; 
import getUsersReducer from "@/features/users/GetUsersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer, 
    getUsers: getUsersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
