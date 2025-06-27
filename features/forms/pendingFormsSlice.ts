import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/utils/apiClient";

export const fetchPendingForms = createAsyncThunk(
  "forms/fetchPendingForms",
  async () => {
    const response = await apiClient.get("/forms/pending");
    return response.data.forms;
  }
);

const pendingFormsSlice = createSlice({
  name: "pendingForms",
  initialState: {
    forms: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingForms.fulfilled, (state, action) => {
        state.forms = action.payload;
        state.loading = false;
      })
      .addCase(fetchPendingForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching pending forms";
      });
  },
});

export default pendingFormsSlice.reducer;
