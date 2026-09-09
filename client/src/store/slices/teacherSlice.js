import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

export const getPendingProposals = createAsyncThunk(
  "teacher/getPendingProposals",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/proposals");
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
export const voteOnProposal = createAsyncThunk(
  "teacher/voteOnProposal",
  async ({ projectId, vote }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/proposals/${projectId}/vote`,
        { vote },
      );

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
export const getTeacherDashboardStat = createAsyncThunk(
  "teacher/getTeacherDashboardStat",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");
      return res.data.data?.dashboardStats || res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard stats",
      );
    }
  },
);

export const getTeacherRequests = createAsyncThunk(
  "teacher/getTeacherRequests",
  async (supervisorId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/requests?supervisor=${supervisorId}`,
      );

      const data = res.data.data;

      return data?.requests || data?.updatedRequests || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch requests",
      );
    }
  },
);

export const acceptRequests = createAsyncThunk(
  "teacher/acceptRequests",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/accept`,
      );
      return res.data.data?.request || res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to accept request",
      );
    }
  },
);

export const rejectRequests = createAsyncThunk(
  "teacher/rejectRequests",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/reject`,
      );
      return res.data.data?.request || res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to reject request",
      );
    }
  },
);

export const markComplete = createAsyncThunk(
  "teacher/markComplete",
  async (projectId, thunkAPI) => {
    try {
      await axiosInstance.post(`/teacher/mark-complete/${projectId}`);
      return { projectId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to mark complete",
      );
    }
  },
);

// export const downloadTeacherFile = createAsyncThunk(
//   "teacher/downloadTeacherFile",
//   async ({ projectId, fileId }, thunkAPI) => {
//     try {
//       const res = await axiosInstance.get(
//         `/teacher/download/${projectId}/${fileId}`,
//         {
//           responseType: "blob",
//         },
//       );
//       return { blob: res.data, projectId, fileId };
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to download file");
//       return thunkAPI.rejectWithValue(error.response?.data?.message);
//     }
//   },
// );

// teacherSlice.js — downloadTeacherFile
export const downloadTeacherFile = createAsyncThunk(
  "teacher/downloadTeacherFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/download/${projectId}/${fileId}`,
        { responseType: "blob" },
      );
      return { blob: res.data, projectId, fileId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Download failed",
      );
    }
  },
);
export const getFiles = createAsyncThunk(
  "teacher/getFiles",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/teacher/files`);
      return res.data?.data?.files || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch teacher file",
      );
    }
  },
);
// export const getFiles = createAsyncThunk("getFiles", async (_, thunkAPI) => {
//   try {
//     const res = await axiosInstance.get(`/teacher/files`);
//     return res.data.data.files || res.data.data;
//   } catch (error) {
//     toast.error(
//       error.response?.data?.message || "Failed to fetch teacher file",
//     );
//     return thunkAPI.rejectWithValue(error.response?.data?.message);
//   }
// });

export const addFeedback = createAsyncThunk(
  "teacher/addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/feedback/${projectId}`,
        payload,
      );

      return {
        projectId,
        feedback: res.data.data?.feedback || res.data.data,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to post feedback",
      );
    }
  },
);

export const getAssignedStudents = createAsyncThunk(
  "teacher/getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/assigned-students");
      return res.data.data?.students || res.data.data || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch students",
      );
    }
  },
);

/* -------------------- SLICE -------------------- */

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    pendingRequests: [],
    dashboardStats: null,
    list: [],
    files: [],
    loading: false,
    error: null,
    successMessage: null,
    proposals: [],
  },

  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- GET STUDENTS ---------- */
      .addCase(getAssignedStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssignedStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedStudents = action.payload;
      })
      .addCase(getAssignedStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET FILES

      .addCase(getFiles.fulfilled, (state, action) => {
        state.files = action.payload;
      })

      /* ---------- FEEDBACK ---------- */
      .addCase(addFeedback.fulfilled, (state, action) => {
        const { projectId, feedback } = action.payload;

        state.assignedStudents = state.assignedStudents.map((s) =>
          s.project?._id === projectId ? { ...s, feedback } : s,
        );

        state.successMessage = "Feedback posted successfully";
      })

      /* ---------- MARK COMPLETE ---------- */
      .addCase(markComplete.fulfilled, (state, action) => {
        const { projectId } = action.payload;

        state.assignedStudents = state.assignedStudents.map((s) =>
          s.project?._id === projectId
            ? {
                ...s,
                project: {
                  ...s.project,
                  status: "completed",
                },
              }
            : s,
        );

        state.successMessage = "Project marked complete";
      })

      /* ---------- DASHBOARD ---------- */
      .addCase(getTeacherDashboardStat.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })

      /* ---------- REQUESTS ---------- */
      // .addCase(getTeacherRequests.fulfilled, (state, action) => {
      //   state.list = action.payload || [];
      //   state.pendingRequests =
      //     action.payload?.filter((r) => r.status === "pending") || [];
      // })

      .addCase(getTeacherRequests.fulfilled, (state, action) => {
        const data = action.payload;

        const requests = Array.isArray(data)
          ? data
          : data?.requests || data?.updatedRequests || [];

        state.list = requests;
        state.pendingRequests = requests.filter((r) => r.status === "pending");
      })

      .addCase(acceptRequests.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })

      .addCase(rejectRequests.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(getPendingProposals.fulfilled, (state, action) => {
        state.proposals = action.payload;
      })
      .addCase(voteOnProposal.fulfilled, (state, action) => {
        const projectId = action.meta.arg.projectId;

        state.proposals = state.proposals.filter(
          (proposal) => proposal._id !== projectId,
        );

        state.successMessage = "Vote submitted successfully";
      });
  },
});

export const { clearMessages } = teacherSlice.actions;
export default teacherSlice.reducer;
