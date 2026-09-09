import { asyncHandler } from "../middleware/asyncHandler.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import * as projectService from "../services/projectService.js";
import * as userServices from "../services/userServices.js";
import * as requestService from "../services/requestService.js";
import { sendEmail } from "../services/emailService.js";
import * as notificationServices from "../services/notificationService.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import * as fileServices from "../services/fileServices.js";
import { ProposalVote } from "../models/proposalVote.js";
import {
  generateRequestAcceptedTemplate,
  generateRequestRejectedTemplate,
} from "../utils/emailTemplates.js";

// export const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
//   const teacherId = req.user._id;

//   const totalPendingRequests = await SupervisorRequest.countDocuments({
//     supervisor: teacherId,
//     status: "pending",
//   });

//   const completedProjects = await Project.countDocuments({
//     supervisor: teacherId,
//     status: "completed",
//   });

//   const recentNotifications = await Notification.find({
//     user: teacherId,
//   })
//     .sort({ createdAt: -1 })
//     .limit(5);

//   const dashboardStats = {
//     totalPendingRequests,
//     completedProjects,
//     recentNotifications,
//   };

//   res.status(200).json({
//     success: true,
//     message: "Dashboard stats fetched for teacher successfully",
//     data: { dashboardStats },
//   });
// });

// helper — add this at the top of teacherController.js
const notifyAdmins = async (message, type, link, priority) => {
  const admins = await User.find({ role: "Admin" }).select("_id");
  await Promise.all(
    admins.map((admin) =>
      notificationServices.notifyUser(admin._id, message, type, link, priority),
    ),
  );
};

export const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const totalPendingRequests = await SupervisorRequest.countDocuments({
    supervisor: teacherId,
    status: "pending",
  });

  const completedProjects = await Project.countDocuments({
    supervisor: teacherId,
    status: "completed",
  });

  const recentRequests = await SupervisorRequest.find({
    supervisor: teacherId,
    status: "pending",
  })
    .populate("student", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  const dashboardStats = {
    totalPendingRequests,
    completedProjects,
    recentRequests,
  };

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched for teacher successfully",
    data: { dashboardStats },
  });
});

export const getRequests = asyncHandler(async (req, res, next) => {
  const { supervisor } = req.query;

  const filters = {};
  if (supervisor) filters.supervisor = supervisor;

  const { requests, total } = await requestService.getAllRequests(filters);

  const updatedRequests = await Promise.all(
    requests.map(async (reqObj) => {
      const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;
      if (requestObj?.student?._id) {
        const latestProject = await Project.findOne({
          student: requestObj.student._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return { ...requestObj, latestProject };
      }
      return requestObj;
    }),
  );

  res.status(200).json({
    success: true,
    message: "Requests fetched successfuly",
    data: { updatedRequests, total },
  });
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestService.acceptRequests(requestId, teacherId);
  if (!request) return next(new ErrorHandler("Request not found", 404));

  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request has been accepted by ${req.user.name}`,
    "approval",
    "/students/status",
    "low",
  );

  await notifyAdmins(
    `${req.user.name} accepted a supervisor request from ${request.student.name}`,
    "approval",
    "/admin/dashboard",
    "low",
  );

  const student = await User.findById(request.student._id);
  const studentEmail = student.email;
  const message = generateRequestAcceptedTemplate(req.user.name);

  await sendEmail({
    to: studentEmail,
    subject: "FYP SYSTEM - ✅ Your Supervisor Request Has Been Accepted",
    message,
  });

  res.status(200).json({
    success: true,
    message: "Request accepted successfully",
    data: { request },
  });
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestService.rejectRequest(requestId, teacherId);
  if (!request) return next(new ErrorHandler("Request not found", 404));

  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request has been rejected by ${req.user.name}`,
    "rejection",
    "/students/status",
    "high",
  );

  // rejectRequest — after notifying student
  await notifyAdmins(
    `${req.user.name} rejected a supervisor request from ${request.student.name}`,
    "rejection",
    "/admin/dashboard",
    "medium",
  );
  const student = await User.findById(request.student._id);
  const studentEmail = student.email;
  const message = generateRequestRejectedTemplate(req.user.name);

  await sendEmail({
    to: studentEmail,
    subject: "FYP SYSTEM - ❌ Your Supervisor Request Has Been Rejected",
    message,
  });
  res.status(200).json({
    success: true,
    message: "Request rejected successfully",
    data: { request },
  });
});




export const getAssignedStudents = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  // Query projects where this teacher is supervisor, then get the students
  const projects = await Project.find({ supervisor: teacherId })
    .populate("student", "name email department")
    .sort({ createdAt: -1 });

  const students = projects.map((project) => ({
    _id: project.student._id,
    name: project.student.name,
    email: project.student.email,
    project: {
      _id: project._id,
      title: project.title,
      status: project.status,
      deadline: project.deadline,
      description: project.description,
      updatedAt: project.updatedAt,
      files: project.files,
    },
  }));

  res.status(200).json({
    success: true,
    data: { students },
    total: students.length,
  });
});



export const markComplete = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project) return next(new ErrorHandler("Project not found", 404));

  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Not authorized to mark complete", 403));
  }

  const updatedProject = await projectService.markComplete(projectId);

  await notificationServices.notifyUser(
    project.student._id,
    `Your project has been marked as completed by your supervisor (${req.user.name})`,
    "general",
    "/students/status",
    "low",
  );
  // markComplete — after notifying student
  await notifyAdmins(
    `${req.user.name} marked a project as completed`,
    "general",
    "/admin/dashboard",
    "low",
  );
  res.status(200).json({
    success: true,
    data: {
      project: updatedProject,
    },
    message: "Project marked as completed",
  });
});

export const addFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;
  const { message, title, type } = req.body;

  const project = await projectService.getProjectById(projectId);
  if (!project) return next(new ErrorHandler("Project not found", 404));

  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Not authorized to mark complete", 403));
  }

  if (!message || !title) {
    return next(
      new ErrorHandler("Feedback title and message are required", 400),
    );
  }

  const { project: updatedProject, latestFeedback } =
    await projectService.addFeedback(
      projectId,
      teacherId,
      message,
      title,
      type,
    );

  await notificationServices.notifyUser(
    project.student._id,
    `New feedback from your supervisor (${req.user.name})`,
    "feedback",
    "/students/feedback",
    type === "positive" ? "low" : type === "negative" ? "high" : "low",
  );
  await notifyAdmins(
    `${req.user.name} gave feedback on ${project.student.name}'s project`,
    "feedback",
    "/admin/dashboard",
    "low",
  );
  res.status(200).json({
    success: true,
    message: "Feedback posted successfully",
    data: { project: updatedProject, feedback: latestFeedback },
  });
});

export const getFiles = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const projects = await projectService.getProjectsBySupervisor(teacherId);

  const allFiles = projects.flatMap((project) =>
    project.files.map((file) => ({
      ...file.toObject(),
      projectId: project._id,
      projectTitle: project.title,
      studentName: project.student.name,
      studentEmail: project.student.email,
    })),
  );

  res.status(200).json({
    success: true,
    message: "File fetched",
    data: {
      files: allFiles,
    },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const supervisorId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const projectSupervisor = project.supervisor?._id ?? project.supervisor;

  let isAuthorized = false;

  if (projectSupervisor) {
    isAuthorized = projectSupervisor.equals
      ? projectSupervisor.equals(supervisorId)
      : projectSupervisor.toString() === supervisorId.toString();
  }

  if (!isAuthorized) {
    const acceptedRequest = await SupervisorRequest.findOne({
      supervisor: supervisorId,
      student: project.student?._id ?? project.student,
      status: "accepted",
    });

    if (acceptedRequest) {
      isAuthorized = true;

      await Project.findByIdAndUpdate(projectId, {
        supervisor: supervisorId,
      });
    }
  }

  if (!isAuthorized) {
    // Debug: log what we got so you can see the mismatch
    console.log("❌ Auth failed:");
    console.log("  supervisorId (logged in):", supervisorId.toString());
    console.log("  projectSupervisor (in DB):", projectSupervisor?.toString());
    return next(
      new ErrorHandler("You are not authorized for this project", 403)
    );
  }

  // ── Find the file ─────────────────────────────────────────────
  const file = project.files.find(
    (f) => f._id.toString() === fileId.toString()
  );

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  await fileServices.streamDownload(file.fileUrl, res, file.originalName);
});


export const getPendingProposals = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  const proposals = await Project.find({
    status: "pending",
  }).populate("student", "name email");

  res.status(200).json({
    success: true,
    data: proposals,
  });
});



export const voteOnProposal = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { vote } = req.body;

  console.log("BODY:", req.body);
console.log("VOTE:", vote);

  const teacherId = req.user._id;

  if (!["approve", "reject"].includes(vote)) {
    return next(new ErrorHandler("Invalid vote", 400));
  }

console.log("Project ID:", projectId);
console.log("Teacher ID:", teacherId);

const project = await Project.findById(projectId);

console.log("Project Found:", !!project);

const existingVote = await ProposalVote.findOne({
  project: projectId,
  teacher: teacherId,
});

console.log("Existing Vote:", existingVote);
  if (existingVote) {
    return next(
      new ErrorHandler("You already voted on this proposal", 400)
    );
  }

  await ProposalVote.create({
    project: projectId,
    teacher: teacherId,
    vote,
  });

  await notificationServices.notifyUser(
  project.student,
  `${req.user.name} ${vote === "approve" ? "approved" : "rejected"} your proposal`,
  vote === "approve" ? "approval" : "rejection",
  "/student/proposal",
  "low"
);
  const approveCount = await ProposalVote.countDocuments({
    project: projectId,
    vote: "approve",
  });

  const rejectCount = await ProposalVote.countDocuments({
    project: projectId,
    vote: "reject",
  });

 if (approveCount >= 3 && project.status !== "approved") {
  project.status = "approved";
  await project.save();

  await notificationServices.notifyUser(
    project.student,
    "Congratulations! Your proposal has been approved by the review committee.",
    "approval",
    "/student/proposal",
    "high"
  );
}

 if (rejectCount >= 3 && project.status !== "rejected") {
  project.status = "rejected";
  await project.save();

  await notificationServices.notifyUser(
    project.student,
    "Your proposal has been rejected by the review committee.",
    "rejection",
    "/student/proposal",
    "high"
  );
}

  res.status(200).json({
    success: true,
    approveCount,
    rejectCount,
    status: project.status,
  });
});



// export const downloadFile = asyncHandler(async (req, res, next) => {
//   const { projectId, fileId } = req.params;
//   const supervisorId = req.user._id;

//   const project = await projectService.getProjectById(projectId);

//   if (!project) {
//     return next(new ErrorHandler("Project not found", 404));
//   }

//   // Safely extract the supervisor ID string regardless of population state
//   const projectSupervisorId =
//     project.supervisor && typeof project.supervisor === "object"
//       ? (project.supervisor._id || project.supervisor).toString()
//       : project.supervisor?.toString();

//   if (!projectSupervisorId || projectSupervisorId !== supervisorId.toString()) {
//     return next(
//       new ErrorHandler("You are not authorized for this project", 403),
//     );
//   }

//   // Find file cleanly
//   const file = project.files.find(
//     (f) => f._id.toString() === fileId.toString(),
//   );

//   if (!file) {
//     return next(new ErrorHandler("File not found", 404));
//   }

//   await fileServices.streamDownload(file.fileUrl, res, file.originalName);
// });