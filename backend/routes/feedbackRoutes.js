import express from "express";
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  getMyFeedbacks,
  updateFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";
import { requiredSignIn, isAdmin } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// User routes (protected) - must be before /:id
router.get("/my-feedbacks", requiredSignIn, getMyFeedbacks); // Get user's own feedbacks

// Admin routes - must be before /:id
router.get("/admin/all", requiredSignIn, isAdmin, getAllFeedbacks); // Get all feedbacks (admin)

// Protected routes
router.post("/", requiredSignIn, createFeedback); // Create feedback
router.get("/:id", requiredSignIn, isAdmin, getFeedbackById); // Get single feedback (admin)
router.put("/:id", requiredSignIn, updateFeedback); // Update feedback (owner)
router.delete("/:id", requiredSignIn, deleteFeedback); // Delete feedback (owner/admin)

export default router;
