import { asyncHandler } from "../middleware/asyncHandler.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js"; // Added missing import
import * as projectService from "../services/projectService.js";
import * as requestService from "../services/requestService.js";
import * as notificationService from "../services/notificationService.js";
import * as fileServices from "../services/fileServices.js";

// helper — add this at the top of teacherController.js
const notifyAdmins = async (message, type, link, priority) => {
  const admins = await User.find({ role: "Admin" }).select("_id");
  await Promise.all(
    admins.map((admin) =>
      notificationService.notifyUser(admin._id, message, type, link, priority),
    ),
  );
};
export const getStudentProject = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const project = await projectService.getProjectByStudent(studentId);

  if (!project) {
    return res.status(200).json({
      success: true,
      data: { project: null },
      message: "No project found for this student",
    });
  }

  res.status(200).json({
    success: true,
    data: { project },
  });
});

export const submitProposal = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const studentId = req.user._id;

  const existingProject = await projectService.getProjectByStudent(studentId);

  if (existingProject) {
    if (existingProject.status !== "rejected") {
      return next(new ErrorHandler("You already have an active project.", 400));
    }
    await Project.findByIdAndDelete(existingProject._id);
  }

  const projectData = {
    student: studentId,
    title,
    description,
  };

  const project = await projectService.createProject(projectData);
  await User.findByIdAndUpdate(studentId, { project: project._id });

  // submitProposal — after creating the project
  await notifyAdmins(
    `${req.user.name} submitted a new project proposal: "${title}"`,
    "request",
    "/admin/dashboard",
    "medium",
  );
  res.status(201).json({
    success: true,
    data: { project },
    message: "Project proposal submitted successfully",
  });
});

export const uploadFiles = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (
    !project ||
    project?.student?._id.toString() !== studentId.toString() ||
    project.status === "rejected"
  ) {
    return next(
      new ErrorHandler("Not authorized to upload files to this project", 403),
    );
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
  }

  const updatedProject = await projectService.addFilesToProject(
    projectId,
    req.files,
  );

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: { project: updatedProject },
  });
});

export const getAvailableSupervisors = asyncHandler(async (req, res, next) => {
  const supervisors = await User.find({ role: "Teacher" })
    .select("name email department experties")
    .lean();

  res.status(200).json({
    success: true,
    data: { supervisors },
    message: "Available supervisors fetched successfully",
  });
});

export const getSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department experties",
  );

  res.status(200).json({
    success: true,
    data: { supervisor: student?.supervisor || null },
  });
});

// export const requestSupervisor = asyncHandler(async (req, res, next) => {

//   const { teacherId, message } = req.body;
//   const studentId = req.user._id;

//   const student = await User.findById(studentId);
//   if (student.supervisor) {
//     return next(new ErrorHandler("You already have a supervisor assigned.", 400));
//   }
//   const supervisor = await User.findById(teacherId);
//   console.log("FOUND SUPERVISOR:", supervisor);
//   if (!supervisor || supervisor.role !== "Teacher") {
//     return next(new ErrorHandler("Invalid supervisor selected.", 400));
//   }

//   const requestData = { student: studentId, supervisor: teacherId, message };
//   const request = await requestService.createRequest(requestData);

//   await notificationService.notifyUser(
//     teacherId,
//     `${student.name} has requested you to be their supervisor.`,
//     "request",
//     "/teacher/requests",
//     "medium"
//   );

//   res.status(201).json({
//     success: true,
//     data: { request },
//     message: "Supervisor request submitted successfully",
//   });
// });

// export const requestSupervisor = asyncHandler(async (req, res, next) => {

//   const { teacherId, message } = req.body;
//   const studentId = req.user._id;

//   const student = await User.findById(studentId);
//   const supervisor = await User.findById(teacherId);

//   if (!supervisor || supervisor.role?.toLowerCase() !== "teacher") {
//     return next(new ErrorHandler("Invalid supervisor selected.", 400));
//   }

//   const requestData = {
//     student: studentId,
//     supervisor: teacherId,
//     message,
//   };

//   const request = await requestService.createRequest(requestData);

//   await notificationService.notifyUser(
//     teacherId,
//     `${student.name} has requested you to be their supervisor.`,
//     "request",
//     "/teacher/requests",
//     "medium"
//   );

//   res.status(201).json({
//     success: true,
//     data: { request },
//     message: "Supervisor request submitted successfully",
//   });
// });

export const requestSupervisor = asyncHandler(async (req, res, next) => {
  try {
    const { teacherId, message } = req.body;
    const studentId = req.user._id;

    const student = await User.findById(studentId);
    const supervisor = await User.findById(teacherId);

    if (!supervisor || supervisor.role?.toLowerCase() !== "teacher") {
      return next(new ErrorHandler("Invalid supervisor selected.", 400));
    }

    // / requestSupervisor — after creating the request
    await notifyAdmins(
      `${student.name} sent a supervisor request to ${supervisor.name}`,
      "request",
      "/admin/dashboard",
      "low",
    );
    const requestData = {
      student: studentId,
      supervisor: teacherId,
      message,
    };

    const request = await requestService.createRequest(requestData);

    return res.status(201).json({
      success: true,
      data: { request },
      message: "Supervisor request submitted successfully",
    });
  } catch (err) {
    console.log("REAL BACKEND ERROR:", err);
    return next(err);
  }
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId })
    .sort({ createdAt: -1 })
    .populate("supervisor", "name")
    .lean();

  const now = new Date();
  const upcomingDeadlines = await Project.find({
    student: studentId,
    deadline: { $gte: now },
  })
    .limit(3)
    .lean();

  const topNotifications = await Notification.find({ user: studentId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  res.status(200).json({
    success: true,
    data: {
      project,
      upcomingDeadlines,
      topNotifications,
      supervisorName: project?.supervisor?.name || null,
    },
  });
});

export const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized to view feedback", 403));
  }

  const sortedFeedback = project.feedback
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((f) => ({
      _id: f._id,
      title: f.title,
      message: f.message,
      type: f.type,
      createdAt: f.createdAt,
      supervisorName: f.supervisorId?.name,
      supervisorEmail: f.supervisorId?.email,
    }));

  res.status(200).json({
    success: true,
    data: { feedback: sortedFeedback },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  // FIXED FILE FINDING
  const file = project.files.find((f) => f._id.toString() === fileId);

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  if (!file.fileUrl) {
    return next(new ErrorHandler("File URL missing", 404));
  }

  await fileServices.streamDownload(file.fileUrl, res, file.originalName);
});
// export const downloadFile = asyncHandler(async (req, res, next) => {
//   const { projectId, fileId } = req.params;
//   const studentId = req.user._id;

//   const project = await projectService.getProjectById(projectId);
//   if (!project || project.student._id.toString() !== studentId.toString()) {
//     return next(new ErrorHandler("Unauthorized", 403));
//   }

//   const file = project.files.id(fileId);
//   if (!file) return next(new ErrorHandler("File not found", 404));

//   fileServices.streamDownload(file.fileUrl, res, file.originalName);
// });
