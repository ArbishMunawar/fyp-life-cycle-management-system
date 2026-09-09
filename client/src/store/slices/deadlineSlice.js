import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const createDeadline = createAsyncThunk(
  "createDeadline",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/deadline/create-deadline/${id}`,
        data,
      );
      toast.success(res.data.message || "Deadline created successfully");

      return res.data.deadline || res.data.data || res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to process deadline";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const deadlineSlice = createSlice({
  name: "deadline",
  initialState: {
    deadlines: [],
    nearby: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createDeadline.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDeadline.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item) {
          state.deadlines.push(item);
        }
      })
      .addCase(createDeadline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default deadlineSlice.reducer;
