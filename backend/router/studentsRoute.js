import express from "express";
import {
  getStudentProject,
  submitProposal,
  uploadFiles,
  getAvailableSupervisors,
  getSupervisor,
  requestSupervisor,
  getFeedback,
  getDashboardStats,
  downloadFile,
} from "../controllers/studentController.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { handleUploadError, upload } from "../middleware/upload.js";
import multer from "multer";

const router = express.Router();

router.get(
  "/project",
  isAuthenticated,
  isAuthorized("Student"),
  getStudentProject,
);
// router.post("/create-student", createStudent);

// router.post("/update-student/:id", updateStudent);
router.post(
  "/project-proposal",
  isAuthenticated,
  isAuthorized("Student"),
  submitProposal,
);

router.post(
  "/upload/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  (req, res, next) => {
    upload.array("files", 10)(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  uploadFiles,
);

router.get(
  "/fetch-supervisors",
  isAuthenticated,
  isAuthorized("Student"),
  getAvailableSupervisors,
);

router.get(
  "/supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  getSupervisor,
);

router.post(
  "/request-supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  requestSupervisor,
);

router.get(
  "/feedback/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  getFeedback,
);

router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Student"),
  getDashboardStats
);

router.get(
  "/download/:projectId/:fileId",
  isAuthenticated,
  isAuthorized("Student"),
  downloadFile
);

export default router;
