// adminRoutes.js — add at the top with other imports
import multer from "multer";
import {
  // ... your existing imports ...
  bulkImportStudents,
  bulkImportTeachers,
} from "../controllers/adminController.js";


import express from "express";
import { 
  assignSupervisor,
  createStudent, 
  createTeacher, 
  deleteStudent, 
  deleteTeacher, 
  getAllProjects, 
  getAllUsers, 
  getDashboardStats, 
  getProject, 
  updateProjectStatus, 
  updateStudent, 
  updateTeacher 
} from "../controllers/adminController.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Student Routes ---
router.post("/create-student", isAuthenticated, isAuthorized("Admin"), createStudent);
router.put("/update-student/:id", isAuthenticated, isAuthorized("Admin"), updateStudent);
router.delete("/delete-student/:id", isAuthenticated, isAuthorized("Admin"), deleteStudent);

// --- Teacher Routes ---
// FIXED: Changed createStudent to createTeacher
router.post("/create-teacher", isAuthenticated, isAuthorized("Admin"), createTeacher);

// FIXED: Changed updateStudent to updateTeacher
router.put("/update-teacher/:id", isAuthenticated, isAuthorized("Admin"), updateTeacher);

router.delete("/delete-teacher/:id", isAuthenticated, isAuthorized("Admin"), deleteTeacher);

// --- General Admin Routes ---
router.get("/projects", isAuthenticated, isAuthorized("Admin"), getAllProjects);

router.get("/fetch-dashboard-stats", isAuthenticated, isAuthorized("Admin"), getDashboardStats);

router.get("/users", isAuthenticated, isAuthorized("Admin"), getAllUsers);

router.post("/assign-supervisor", isAuthenticated, isAuthorized("Admin"), assignSupervisor);


router.get("/project/:id", isAuthenticated, isAuthorized("Admin"), getProject);

router.put("/project/:id", isAuthenticated, isAuthorized("Admin"), updateProjectStatus);



// Memory storage so we read it as a buffer (no disk save needed)
const excelUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel",                                           // .xls
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx and .xls files are allowed"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// Add these two routes (after existing routes)
router.post(
  "/bulk-import-students",
  isAuthenticated,
  isAuthorized("Admin"),
  excelUpload.single("file"),
  bulkImportStudents,
);

router.post(
  "/bulk-import-teachers",
  isAuthenticated,
  isAuthorized("Admin"),
  excelUpload.single("file"),
  bulkImportTeachers,
);

export default router;