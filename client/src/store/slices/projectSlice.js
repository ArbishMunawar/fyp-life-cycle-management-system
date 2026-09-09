import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// export const downloadProjectFile = createAsyncThunk(
//   "downloadProjectFile",
//   async ({ projectId, fileId }, thunkAPI) => {
//     try {
//       const res = await axiosInstance.get(
//         `/project/${projectId}/files/${fileId}/download`,
//         { responseType: "blob" },
//       );
//       return { blob: res.data, projectId, fileId };
//     } catch (error) {
//       toast.error(error.response.data.message || "Failed to download file");
//       return thunkAPI.rejectWithValue(error.response.data.message);
//     }
//   },
// );

export const downloadProjectFile = createAsyncThunk(
  "downloadProjectFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/project/${projectId}/files/${fileId}/download`,
        { responseType: "blob" }
      );
      
      // If successful, res.data is the actual file blob
      return { blob: res.data, projectId, fileId };
    } catch (error) {
      let errorMessage = "Failed to download file";

      // Check if the error response is a Blob
      if (error.response && error.response.data instanceof Blob) {
        // Convert Blob to string to read the JSON error message
        const reader = new FileReader();
        
        // We wrap this in a promise to wait for the reader to finish
        const errorText = await error.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          // If it's not JSON, just use the raw text
          errorMessage = errorText || errorMessage;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    selected: null,
  },
  reducers: {},
  extraReducers: (builder) => {},
});

export default projectSlice.reducer;
