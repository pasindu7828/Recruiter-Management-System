import express from "express";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  getUnreadNotifications,        
  getInterviewNotifications,      
  getApplicationNotifications,    
  getNotificationsByType,         
  getNotificationSummary,         
  markManyAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from "../controllers/notificationController.js";

import { requiredSignIn } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Require login
router.use(requiredSignIn);

// Get notifications
router.get("/my", getUserNotifications);

// Get unread notifications only
router.get("/unread", getUnreadNotifications);           

// Get interview notifications only
router.get("/interviews", getInterviewNotifications);    

// Get application notifications only
router.get("/applications", getApplicationNotifications); 

// Get notifications by type (e.g., ?type=job_application)
router.get("/by-type", getNotificationsByType);          

// Get notification summary with counts
router.get("/summary", getNotificationSummary);          

// Unread count
router.get("/unread-count", getUnreadCount);

// Mark notifications
router.patch("/read-many", markManyAsRead);
router.patch("/read-all", markAllAsRead);
router.patch("/:notificationId/read", markAsRead);

// Delete notifications
router.delete("/:notificationId", deleteNotification);
router.delete("/all", clearAllNotifications);

export default router;