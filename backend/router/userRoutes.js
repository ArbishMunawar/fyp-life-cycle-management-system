import express from "express";
import { 
  registerUser, 
  login, 
  getUser, 
  logout,
  forgotPassword,
  resetPassword, 

} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", login);
router.get("/logout",isAuthenticated, logout);

// Password Management Routes
router.post("/password/forgot", forgotPassword);

router.put("/password/reset/:token", resetPassword);

// User Profile Routes
router.get("/me",isAuthenticated, getUser);

export default router;