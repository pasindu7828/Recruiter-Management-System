import express from "express";
import {
  scheduleInterview,
  getRecruiterInterviews,
  getCandidateInterviews,
  updateInterview,
  updateInterviewStatus,
  getRecruiterInterviewsByStatus,
  deleteInterview
} from "../controllers/interviewController.js";

import { requiredSignIn, isRecruiter, isCandidate } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Recruiter schedule interview
router.post("/schedule", requiredSignIn, isRecruiter, scheduleInterview);

// Recruiter view interviews
router.get("/recruiter", requiredSignIn, isRecruiter, getRecruiterInterviews);

// Candidate view interviews
router.get("/candidate", requiredSignIn, isCandidate, getCandidateInterviews);

// Update interview (reschedule)
router.put("/update/:interviewId", requiredSignIn, isRecruiter, updateInterview);

// Update interview status (confirm/reject)
router.put("/status/:interviewId", requiredSignIn, isCandidate, updateInterviewStatus);

// Get recruiter interviews by status
router.get("/recruiter/status/:status", requiredSignIn, isRecruiter, getRecruiterInterviewsByStatus);

// Delete interview
router.delete("/delete/:interviewId", requiredSignIn, isRecruiter, deleteInterview);

export default router;