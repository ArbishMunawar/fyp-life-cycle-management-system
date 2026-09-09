import { asyncHandler } from "../middleware/asyncHandler.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import * as userServices from "../services/userServices.js";
import * as projectServices from "../services/projectService.js";
import * as notificationServices from "../services/notificationService.js";
// adminController.js — add these imports at the top
import * as XLSX from "xlsx";
import { createRequire } from "module";

export const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, registrationNumber } = req.body;
  if (!name || !email || !password || !department || !registrationNumber) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    registrationNumber,
    role: "Student",
  });
  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: { user },
  });
});

//updates student
export const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role; // Prevent role update

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Student Updated Successfully",
    data: { user },
  });
});

//deletes student
export const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }

  if (user.role !== "Student") {
    return next(new ErrorHandler("User is not a student", 400));
  }

  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Student deleted Successfully",
  });
});

//creates Teacher
export const createTeacher = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    department,
    maxStudents,
    experties,
    registrationNumber,
  } = req.body;
  if (
    !name ||
    !email ||
    !password ||
    !department ||
    !maxStudents ||
    !experties ||
    !registrationNumber
  ) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    registrationNumber,
    maxStudents,

    experties: Array.isArray(experties)
      ? experties
      : typeof experties === "string" && experties.trim() !== ""
        ? experties.split(",").map((s) => s.trim())
        : [],
    role: "Teacher",
  });
  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user },
  });
});

//updates teacher
export const updateTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role; // Prevent role update

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Teacher Updated Successfully",
    data: { user },
  });
});

//deletes teacher
export const deleteTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  if (user.role !== "Teacher") {
    return next(new ErrorHandler("User is not a Teacher", 400));
  }

  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Teacher deleted Successfully",
  });
});

//get all users
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { users } = await userServices.getAllUsers();
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: { users },
  });
});

//

export const getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await projectServices.getAllProjects();
  res.json({
    success: true,
    message: "Projects fetched successfully",
    data: { projects },
  });
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalStudents,
    totalTeachers,
    totalProjects,
    pendingRequests,
    completedProjects,
    pendingProjects,
  ] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    Project.countDocuments(),
    SupervisorRequest.countDocuments({ status: "pending" }),
    Project.countDocuments({ status: "completed" }),
    Project.countDocuments({ status: "pending" }),
  ]);

  res.status(200).json({
    success: true,
    message: "Admin Dashboard stats fetched",
    data: {
      stats: {
        totalStudents,
        totalTeachers,
        totalProjects,
        pendingRequests,
        completedProjects,
        pendingProjects,
      },
    },
  });
});

// export const assignSupervisor = asyncHandler(async (req, res, next) => {
//   const { studentId, supervisorId } = req.body;

//   if (!studentId || !supervisorId) {
//     return next(
//       new ErrorHandler("Student ID and Supervisor ID are required", 400),
//     );
//   }

//   const project = await Project.findOne({ student: studentId });

//   if (!project) {
//     return next(new ErrorHandler("Project not found", 404));
//   }
//   if (project.supervisor !== null) {
//     return next(new ErrorHandler("Supervisor already assigned", 400));
//   }

//   if (project.status !== "approved") {
//     return next(new ErrorHandler("Project not approved yet", 400));
//   } else if (project.status === "pending" || project.status === "rejected") {
//     return next(
//       new ErrorHandler("Project is in pending state or rejected", 400),
//     );
//   }

//   const { student, supervisor } = await userServices.assignSupervisorDirectly(
//     studentId,
//     supervisorId,
//   );

//   project.supervisor = supervisor;
//   await project.save();

//   await notificationServices.notifyUser(
//     studentId,
//     `You have been assigned a supervisor ${supervisor.name}.`,
//     "approval",
//     "/students/status",
//     "low",
//   );

//   await notificationServices.notifyUser(
//     supervisorId,
//     `The student ${student.name} has been officially assigned to you for FYP supervision.`,
//     "genral",
//     "/teachers/status",
//     "low",
//   );

//   res.status(200).json({
//     success: true,
//     message: "Supervisor Assigned",
//     data: { student, supervisor },
//   });
// });

// export const assignSupervisor = async (req, res) => {
//   try {
//     const { studentId, supervisorId } = req.body;

//     if (!studentId || !supervisorId) {
//       return res
//         .status(400)
//         .json({ message: "studentId and supervisorId are required" });
//     }

//     // Assign supervisor to the student's project
//     const project = await Project.findOneAndUpdate(
//       { student: studentId },
//       { supervisor: supervisorId },
//       { new: true },
//     ).populate("supervisor", "name email");

//     if (!project) {
//       return res
//         .status(404)
//         .json({ message: "Project not found for this student" });
//     }

//     // Add student to teacher's assignedStudents array
//     await User.findByIdAndUpdate(supervisorId, {
//       $addToSet: { assignedStudents: studentId },
//     });

//     res.status(200).json({
//       message: "Supervisor assigned successfully",
//       data: project,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const assignSupervisor = async (req, res) => {
  try {
    const { studentId, supervisorId, projectId } = req.body;

    if (!studentId || !supervisorId) {
      return res
        .status(400)
        .json({ message: "studentId and supervisorId are required" });
    }

    // 1. Assign supervisor to the student's project
    const project = await Project.findOneAndUpdate(
      { student: studentId },
      { supervisor: supervisorId },
      { new: true },
    ).populate("supervisor", "name email");

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found for this student" });
    }

    await Project.findByIdAndUpdate(projectId, { supervisor: supervisorId });

    await User.findByIdAndUpdate(supervisorId, {
      $addToSet: { assignedStudents: studentId },
    });

    await User.findByIdAndUpdate(studentId, { supervisor: supervisorId });

    const supervisorName = project.supervisor
      ? project.supervisor.name
      : "Your supervisor";

    await notificationServices.notifyUser(
      studentId,
      `Your supervisor request has been approved. ${supervisorName} is now your supervisor.`,
      "general",
      "/student/supervisor",
      "high",
    );

    res.status(200).json({
      message: "Supervisor assigned successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await projectServices.getProjectById(id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const user = req.user;
  const userRole = (user.role || "").toLowerCase();
  const userId = user._id?.toString() || user.id;
  const hasAccess =
    userRole === "admin" ||
    project.student._id.toString() === userId ||
    (project.supervisor && project.supervisor._id.toString() === userId);

  if (!hasAccess) {
    return next(new ErrorHandler("Not authorized to fetch project", 403));
  }

  return res.status(200).json({
    success: true,
    data: { project },
  });
});

export const updateProjectStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updatedData = req.body;
  const user = req.user;

  const project = await projectServices.getProjectById(id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const userRole = (user.role || "").toLowerCase();
  const userId = user._id?.toString() || user.id;
  const hasAccess =
    userRole === "admin" ||
    project.student._id.toString() === userId ||
    (project.supervisor && project.supervisor._id.toString() === userId);

  if (!hasAccess) {
    return next(
      new ErrorHandler("Not authorized to update project status", 403),
    );
  }

  const updatedProject = await projectServices.updateProject(id, updatedData);

  return res.status(200).json({
    success: true,
    message: "Project status updated successfully",
    data: { project: updatedProject },
  });
});

// ── BULK IMPORT STUDENTS ───────────────────────────────────────────────────
export const bulkImportStudents = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please upload an Excel file", 400));
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  console.log("STUDENT EXCEL ROWS:", rows);

  if (!rows || rows.length === 0) {
    return next(
      new ErrorHandler("Excel file is empty or has no valid rows", 400)
    );
  }

  const results = {
    created: [],
    failed: [],
  };

  for (const row of rows) {
    try {
      const name = row["name"] || row["Name"] || row["NAME"];
      const email = row["email"] || row["Email"] || row["EMAIL"];
      const password = row["password"] || row["Password"] || row["PASSWORD"];
      const department =
        row["department"] || row["Department"] || row["DEPARTMENT"];

      const registrationNumber =
        row["registrationNumber"] ||
        row["Registration Number"] ||
        row["RegistrationNumber"] ||
        row["reg_no"] ||
        row["RegNo"];

      if (
        !name ||
        !email ||
        !password ||
        !department ||
        !registrationNumber
      ) {
        results.failed.push({
          row,
          reason:
            "Missing required fields: name, email, password, department, registrationNumber",
        });
        continue;
      }

      const exists = await User.findOne({
        email: email.toLowerCase().trim(),
      });

      if (exists) {
        results.failed.push({
          row,
          reason: `Email ${email} already exists`,
        });
        continue;
      }

      const user = await userServices.createUser({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        password: String(password),
        department: String(department).trim(),
        registrationNumber: String(registrationNumber).trim(),
        role: "Student",
      });

      results.created.push({
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
      });
    } catch (err) {
      console.log("IMPORT ERROR:", err);
      console.log("ROW DATA:", row);

      results.failed.push({
        row,
        reason: err.message,
      });
    }
  }

  return res.status(201).json({
    success: true,
    message: `Bulk import complete. Created: ${results.created.length}, Failed: ${results.failed.length}`,
    data: results,
  });
});
// ── BULK IMPORT TEACHERS ───────────────────────────────────────────────────
export const bulkImportTeachers = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please upload an Excel file", 400));
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  console.log("TEACHER EXCEL ROWS:", rows);

  if (!rows || rows.length === 0) {
    return next(
      new ErrorHandler("Excel file is empty or has no valid rows", 400)
    );
  }

  const results = {
    created: [],
    failed: [],
  };

  for (const row of rows) {
    try {
      const name = row["name"] || row["Name"] || row["NAME"];
      const email = row["email"] || row["Email"] || row["EMAIL"];
      const password = row["password"] || row["Password"] || row["PASSWORD"];
      const department =
        row["department"] || row["Department"] || row["DEPARTMENT"];

      const registrationNumber =
        row["registrationNumber"] ||
        row["Registration Number"] ||
        row["RegistrationNumber"] ||
        row["reg_no"] ||
        row["RegNo"];

      const experties =
        row["experties"] ||
        row["Experties"] ||
        row["expertise"] ||
        row["Expertise"] ||
        "";

      const maxStudents =
        row["maxStudents"] ||
        row["Max Students"] ||
        row["max_students"] ||
        10;

      if (
        !name ||
        !email ||
        !password ||
        !department ||
        !registrationNumber
      ) {
        results.failed.push({
          row,
          reason:
            "Missing required fields: name, email, password, department, registrationNumber",
        });
        continue;
      }

      const exists = await User.findOne({
        email: email.toLowerCase().trim(),
      });

      if (exists) {
        results.failed.push({
          row,
          reason: `Email ${email} already exists`,
        });
        continue;
      }

      const user = await userServices.createUser({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        password: String(password),
        department: String(department).trim(),
        registrationNumber: String(registrationNumber).trim(),
        experties:
          typeof experties === "string"
            ? experties
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        maxStudents: Number(maxStudents) || 10,
        role: "Teacher",
      });

      results.created.push({
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
      });
    } catch (err) {
      console.log("IMPORT ERROR:", err);
      console.log("ROW DATA:", row);

      results.failed.push({
        row,
        reason: err.message,
      });
    }
  }

  return res.status(201).json({
    success: true,
    message: `Bulk import complete. Created: ${results.created.length}, Failed: ${results.failed.length}`,
    data: results,
  });
});
