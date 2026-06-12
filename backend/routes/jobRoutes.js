import express from "express";
import {
  createJob,
  saveDraftJob,
  publishDraftJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  getAllJobsAdmin,
} from "../controllers/jobController.js";
import {
  requiredSignIn,
  isRecruiter,
  isAdmin,
} from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Recruiter routes (protected) - must be before /:id
router.get("/recruiter/my-jobs", requiredSignIn, isRecruiter, getMyJobs); // Get recruiter's jobs

// Admin routes - must be before /:id
router.get("/admin/all", requiredSignIn, isAdmin, getAllJobsAdmin); // Get all jobs (admin)

// Public routes
router.get("/", getAllJobs); // Get all open jobs with filters
router.get("/:id", getJobById); // Get single job details

// Recruiter routes (protected)
router.post("/draft", requiredSignIn, isRecruiter, saveDraftJob); // Save draft
router.patch("/publish/:id", requiredSignIn, isRecruiter, publishDraftJob); // Publish existing draft
router.post("/", requiredSignIn, isRecruiter, createJob); // Create job
router.put("/:id", requiredSignIn, isRecruiter, updateJob); // Update job
router.delete("/:id", requiredSignIn, isRecruiter, deleteJob); // Delete job

export default router;
