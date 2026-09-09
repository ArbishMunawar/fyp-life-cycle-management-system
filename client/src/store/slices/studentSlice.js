import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const submitProjectProposal = createAsyncThunk(
  "student/submitProjectProposal",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/project-proposal", data);
      toast.success("Project proposal submitted successfully");
      return res.data.data?.project || res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response.data.message || "Failed to submit project proposal",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const fetchProject = createAsyncThunk(
  "student/fetchproject",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/project");
      return res.data.data?.project;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/supervisor");
      // return res.data.data?.supervisor;
      return res.data.data?.supervisor || res.data.data || null;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch supervisor");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const fetchAllSupervisors = createAsyncThunk(
  "student/fetchAllSupervisors",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-supervisors");
      return res.data.data?.supervisors;
    } catch (error) {
      toast.error(
        error.response.data.message || "Failed to fetch available supervisors",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const requestSupervisor = createAsyncThunk(
  "student/requestSupervisor",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/request-supervisor", data);
      thunkAPI.dispatch(getSupervisor());
      toast.success(res.data.message);
      return res.data.data?.request;
    } catch (error) {
      toast.error(
        error.response.data.message || "Failed to request supervisor",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const uploadFiles = createAsyncThunk(
  "student/uploadFiles",
  async ({ projectId, files }, thunkAPI) => {
    try {
      const form = new FormData();
      for (const file of files) form.append("files", file);

      const res = await axiosInstance.post(
        `/student/upload/${projectId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(res.data.message || "Files uploaded successfully");
      return res.data.project || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to upload files");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const fetchDashboardStats = createAsyncThunk(
  "fetchDsahboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-dashboard-stats");
      return res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "Failed to fetch student dashboard stats.",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const getFeedback = createAsyncThunk(
  "getFeedback",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/student/feedback/${projectId}`);
      return res.data.data?.feedback || res.data.data || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch feedback.");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const downloadFile = createAsyncThunk(
  "downloadfile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/student/download/${projectId}/${fileId}`,
        {
          responseType: "blob",
        },
      );
      return { blob: res.data, projectId, fileId };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download file");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(submitProjectProposal.fulfilled, (state, action) => {
      state.project = action.payload?.project || action.payload;
    });
   
    builder.addCase(fetchProject.fulfilled, (state, action) => {
      state.project = action.payload || null; // payload is already the project object
      state.files = action.payload?.files || [];
    });
    

   builder.addCase(getSupervisor.fulfilled, (state, action) => {
  const sup = action.payload?.supervisor || action.payload || null;
  state.supervisor = sup;

  if (state.project && sup) {
    state.project.supervisor = sup;
  }
});

    builder.addCase(fetchAllSupervisors.fulfilled, (state, action) => {
      state.supervisors = action.payload?.supervisors || action.payload || [];
    });
   
    builder.addCase(uploadFiles.fulfilled, (state, action) => {
      const updatedProject =
        action.payload?.data?.project || action.payload?.project;

      if (updatedProject) {
        state.project = updatedProject;

        state.files = Array.isArray(updatedProject.files)
          ? updatedProject.files
          : [];
      }

      state.status = "succeeded";
    });
    builder.addCase(getFeedback.fulfilled, (state, action) => {
      state.feedback = action.payload || [];
    });
    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      state.dashboardStats = action.payload || [];
    });
  },
});

export default studentSlice.reducer;
