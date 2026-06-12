import express from "express";
import {
  getRankedApplicationsForJob,
  getTopCandidates,
  getCandidateMatchAnalysis,
  getRecruiterDashboardStats,
  submitRecruiterFeedback
} from "../controllers/cvAnalysisController.js";
import {
  requiredSignIn,
  isRecruiter
} from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// DASHBOARD 
// Get recruiter dashboard statistics
router.get("/dashboard/stats",requiredSignIn, isRecruiter, getRecruiterDashboardStats);

// JOB RANKINGS 
// Get ranked candidates for a job (sorted by match score)
router.get("/jobs/:jobPostId/ranked", requiredSignIn, isRecruiter, getRankedApplicationsForJob);

// Get top N candidates for a job (shortlist)
router.get("/jobs/:jobPostId/top", requiredSignIn, isRecruiter, getTopCandidates);

// APPLICATION ANALYSIS
// Get detailed match analysis for a specific candidate
router.get("/applications/:applicationId/analysis", requiredSignIn, isRecruiter, getCandidateMatchAnalysis);

// Submit recruiter feedback to improve ML model
router.post("/applications/:applicationId/feedback", requiredSignIn, isRecruiter, submitRecruiterFeedback);

export default router;