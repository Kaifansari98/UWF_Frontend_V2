import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import userReducer from "@/features/users/userSlice"; 
import getUsersReducer from "@/features/users/GetUsersSlice";
import pendingFormsReducer from "@/features/forms/pendingFormsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer, 
    getUsers: getUsersReducer,
    pendingForms: pendingFormsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
