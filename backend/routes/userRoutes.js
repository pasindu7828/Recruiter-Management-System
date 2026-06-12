import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllCandidates,
  getAllRecruiters,
  deleteUser,
  uploadResume,
  getAllUsers,
  getCandidateById,
  downloadResume
} from "../controllers/userController.js";
import { requiredSignIn,isAdmin,isCandidate,isManager } from "../middlewares/AuthMiddleware.js";
import { createRequire } from 'module';
import upload from "../middlewares/uploadResume.js";

const require = createRequire(import.meta.url);

const router = express.Router();

router.post("/register", registerUser); //  no auth required
router.post("/login", loginUser);       //  no auth required
router.post("/logout", requiredSignIn, logoutUser); //  auth required
router.get("/profile", requiredSignIn, getUserProfile);// profile view
router.put("/update-profile", requiredSignIn, updateUserProfile); // profile update
router.put("/change-password", requiredSignIn, changePassword); // change password
router.get("/download-resume/:userId/:resumeIndex", requiredSignIn, downloadResume); // download resume by candidate id

//admin routes
router.get("/candidates", requiredSignIn, isAdmin, getAllCandidates); //get all candidates
router.get("/recruiters", requiredSignIn, isAdmin, getAllRecruiters); //get all recruiters
router.delete("/delete-user/:id", requiredSignIn, isAdmin, deleteUser); //delete user
router.get("/all-users", requiredSignIn, isAdmin, getAllUsers); //get all users - admin only

//candidate route
router.post("/upload-resume", requiredSignIn,isCandidate,upload.single("resume"), uploadResume); //upload resume

//manager get candidate by id
router.get("/candidate/:id", requiredSignIn, getCandidateById); //get candidate by id

export default router;