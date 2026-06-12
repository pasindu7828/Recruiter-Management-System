import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Interview from "../models/Interview.js";

/**
 * Create notification for recruiter when candidate applies
 * Called from jobApplicationController
 */
export const notifyRecruiterOnApplication = async (applicationId) => {
  try {
    // Get application with populated data
    const application = await JobApplication.findById(applicationId)
      .populate('userId', 'name email')
      .populate({
        path: 'jobPostId',
        populate: { path: 'postedBy', select: 'name email _id' }
      });

    if (!application) {
      console.log('Application not found for notification');
      return null;
    }

    const candidate = application.userId;
    const job = application.jobPostId;
    const recruiter = job.postedBy;

    // Create notification object
    const notification = new Notification({
      userId: recruiter._id,
      type: "job_application",
      title: "📝 New Job Application",
      body: `${candidate.name} applied for "${job.topic}" position`,
      data: {
        applicationId: application._id,
        jobId: job._id,
        jobTitle: job.topic,
        candidateId: candidate._id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        resume: application.resume,
        appliedDate: application.date || new Date()
      },
      actionUrl: `/recruiter/applications/${application._id}`,
      referenceId: application._id,
      referenceModel: "JobApplication"
    });

    await notification.save();
    console.log(`✅ Notification sent to recruiter ${recruiter.name} for new application`);
    
    return notification;
  } catch (error) {
    console.error("Error in notifyRecruiterOnApplication:", error);
    return null;
  }
};

/**
 * Create notification for candidate when interview is scheduled/updated/cancelled
 * Called from interviewController
 */
export const notifyCandidateOnInterview = async (interviewId, action = 'scheduled') => {
  try {
    // Get interview with populated data
    const interview = await Interview.findById(interviewId)
      .populate('userId', 'name email')
      .populate('jobPostId', 'topic')
      .populate('recruiterId', 'name');

    if (!interview) {
      console.log('Interview not found for notification');
      return null;
    }

    const candidate = interview.userId;
    const job = interview.jobPostId;
    const recruiter = interview.recruiterId;

    // Format date
    const scheduledDate = new Date(interview.scheduled_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let title, body, type;

    switch(action) {
      case 'scheduled':
        type = "interview_scheduled";
        title = "📅 Interview Scheduled";
        body = `Interview scheduled for ${job.topic} on ${scheduledDate} at ${interview.scheduled_time} with ${recruiter.name}`;
        break;
      case 'updated':
        type = "interview_updated";
        title = "🔄 Interview Updated";
        body = `Your interview for ${job.topic} has been rescheduled to ${scheduledDate} at ${interview.scheduled_time}`;
        break;
      case 'cancelled':
        type = "interview_cancelled";
        title = "❌ Interview Cancelled";
        body = `Your interview for ${job.topic} on ${scheduledDate} has been cancelled`;
        break;
      default:
        type = "interview_scheduled";
        title = "📅 Interview Scheduled";
        body = `Interview scheduled for ${job.topic} on ${scheduledDate} at ${interview.scheduled_time}`;
    }

    const notification = new Notification({
      userId: candidate._id,
      type: type,
      title: title,
      body: body,
      data: {
        interviewId: interview._id,
        jobId: job._id,
        jobTitle: job.topic,
        recruiterId: recruiter._id,
        recruiterName: recruiter.name,
        scheduledDate: interview.scheduled_date,
        scheduledTime: interview.scheduled_time,
        interviewType: interview.interviewType,
        meetingLink: interview.meetingLink,
        action: action
      },
      actionUrl: `/candidate/interviews/${interview._id}`,
      referenceId: interview._id,
      referenceModel: "Interview",
      expiresAt: interview.scheduled_date
    });

    await notification.save();
    console.log(`✅ Interview notification sent to candidate ${candidate.name} (${action})`);
    
    return notification;
  } catch (error) {
    console.error("Error in notifyCandidateOnInterview:", error);
    return null;
  }
};

/**
 * Create notification for candidate when application status changes
 * Called from jobApplicationController
 */
export const notifyCandidateOnStatusChange = async (applicationId, oldStatus, newStatus) => {
  try {
    // Get application with populated data
    const application = await JobApplication.findById(applicationId)
      .populate('userId', 'name email')
      .populate({
        path: 'jobPostId',
        populate: { path: 'postedBy', select: 'name' }
      });

    if (!application) {
      console.log('Application not found for status change notification');
      return null;
    }

    const candidate = application.userId;
    const job = application.jobPostId;
    const recruiter = job.postedBy;

    // Status-specific messages
    const statusMessages = {
      "Screening": "Your application is now in screening phase",
      "Interview Scheduled": "Interview has been scheduled for your application",
      "Interviewed": "You have completed the interview",
      "Offered": "🎉 Congratulations! You have received an offer",
      "Rejected": "Thank you for your interest. We've moved forward with other candidates"
    };

    const notification = new Notification({
      userId: candidate._id,
      type: "application_status_change",
      title: "📊 Application Status Updated",
      body: statusMessages[newStatus] || `Your application status changed from ${oldStatus} to ${newStatus}`,
      data: {
        applicationId: application._id,
        jobId: job._id,
        jobTitle: job.topic,
        oldStatus: oldStatus,
        newStatus: newStatus,
        recruiterName: recruiter.name,
        updatedAt: new Date()
      },
      actionUrl: `/candidate/applications/${application._id}`,
      referenceId: application._id,
      referenceModel: "JobApplication"
    });

    await notification.save();
    console.log(`✅ Status change notification sent to candidate ${candidate.name}: ${oldStatus} -> ${newStatus}`);
    
    return notification;
  } catch (error) {
    console.error("Error in notifyCandidateOnStatusChange:", error);
    return null;
  }
};

/**
 * Create notification when job is posted (for candidates who follow)
 * Optional feature
 */
export const notifyCandidatesOnNewJob = async (jobId) => {
  try {
    const job = await Job.findById(jobId).populate('postedBy', 'name');
    
    if (!job) return null;

    // You would need a "followed jobs" or "interested candidates" collection
    // For now, this is a placeholder
    const interestedCandidates = await User.find({ 
      role: 'candidate',
      // Add your criteria for interested candidates
    });

    const notifications = [];
    for (const candidate of interestedCandidates) {
      const notification = new Notification({
        userId: candidate._id,
        type: "job_posted",
        title: "🎯 New Job Posted",
        body: `New position: ${job.topic} posted by ${job.postedBy.name}`,
        data: {
          jobId: job._id,
          jobTitle: job.topic,
          recruiterName: job.postedBy.name,
          postedDate: job.createdAt
        },
        actionUrl: `/jobs/${job._id}`,
        referenceId: job._id,
        referenceModel: "Job"
      });
      notifications.push(notification);
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`✅ New job notifications sent to ${notifications.length} candidates`);
    }

    return notifications;
  } catch (error) {
    console.error("Error in notifyCandidatesOnNewJob:", error);
    return [];
  }
};

// ============================================
// NOTIFICATION MANAGEMENT FUNCTIONS
// (These are the API endpoints)
// ============================================

/**
 * Get all notifications for current user
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { userId, isDeleted: false };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    // Add timeAgo to each notification
    const now = new Date();
    notifications.forEach(n => {
      const diff = now - new Date(n.createdAt);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) n.timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      else if (hours > 0) n.timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      else if (minutes > 0) n.timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      else n.timeAgo = 'Just now';
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch notifications",
      error: error.message 
    });
  }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);
    
    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get unread count",
      error: error.message 
    });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId, isDeleted: false },
      { status: "read", readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: "Notification not found" 
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark notification as read",
      error: error.message 
    });
  }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const result = await Notification.updateMany(
      { userId, status: "unread", isDeleted: false },
      { status: "read", readAt: new Date() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark all as read",
      error: error.message 
    });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: "Notification not found" 
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete notification",
      error: error.message 
    });
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, isDeleted: false },
      { isDeleted: true }
    );

    res.json({
      success: true,
      message: `Cleared ${result.modifiedCount} notifications`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to clear notifications",
      error: error.message 
    });
  }
};

export const markManyAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user._id;

    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId,
        status: "unread",
        isDeleted: false
      },
      {
        status: "read",
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read"
    });
  }
};

// FILTER FUNCTIONS FOR NOTIFICATIONS

/**
 * Get unread notifications only
 * GET /api/v1/notifications/unread
 */
export const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const query = { 
      userId, 
      isDeleted: false,
      status: "unread" 
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);

    // Add timeAgo
    const now = new Date();
    notifications.forEach(n => {
      const diff = now - new Date(n.createdAt);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) n.timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      else if (hours > 0) n.timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      else if (minutes > 0) n.timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      else n.timeAgo = 'Just now';
    });

    res.json({
      success: true,
      notifications,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch unread notifications",
      error: error.message 
    });
  }
};

/**
 * Get interview-related notifications only
 * GET /api/v1/notifications/interviews
 */
export const getInterviewNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { 
      userId, 
      isDeleted: false,
      type: { 
        $in: ["interview_scheduled", "interview_updated", "interview_cancelled"] 
      }
    };

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);

    // Add timeAgo
    const now = new Date();
    notifications.forEach(n => {
      const diff = now - new Date(n.createdAt);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) n.timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      else if (hours > 0) n.timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      else if (minutes > 0) n.timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      else n.timeAgo = 'Just now';
    });

    res.json({
      success: true,
      notifications,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching interview notifications:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch interview notifications",
      error: error.message 
    });
  }
};

/**
 * Get application-related notifications only
 * GET /api/v1/notifications/applications
 */
export const getApplicationNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { 
      userId, 
      isDeleted: false,
      type: { 
        $in: ["job_application", "application_status_change"] 
      }
    };

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);

    // Add timeAgo
    const now = new Date();
    notifications.forEach(n => {
      const diff = now - new Date(n.createdAt);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) n.timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      else if (hours > 0) n.timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      else if (minutes > 0) n.timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      else n.timeAgo = 'Just now';
    });

    res.json({
      success: true,
      notifications,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching application notifications:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch application notifications",
      error: error.message 
    });
  }
};

/**
 * Get notifications by type (general filter)
 * GET /api/v1/notifications/by-type?type=job_application
 */
export const getNotificationsByType = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, page = 1, limit = 20, status } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Please provide notification type"
      });
    }

    const query = { 
      userId, 
      isDeleted: false,
      type: type 
    };

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);

    // Add timeAgo
    const now = new Date();
    notifications.forEach(n => {
      const diff = now - new Date(n.createdAt);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) n.timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      else if (hours > 0) n.timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      else if (minutes > 0) n.timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      else n.timeAgo = 'Just now';
    });

    res.json({
      success: true,
      notifications,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching notifications by type:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch notifications",
      error: error.message 
    });
  }
};

/**
 * Get notification summary with counts by category
 * GET /api/v1/notifications/summary
 */
export const getNotificationSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total unread count
    const totalUnread = await Notification.countDocuments({
      userId,
      status: "unread",
      isDeleted: false
    });

    // Unread by category
    const [unreadApplications, unreadInterviews, unreadOthers] = await Promise.all([
      // Unread application notifications
      Notification.countDocuments({
        userId,
        status: "unread",
        isDeleted: false,
        type: { $in: ["job_application", "application_status_change"] }
      }),
      
      // Unread interview notifications
      Notification.countDocuments({
        userId,
        status: "unread",
        isDeleted: false,
        type: { $in: ["interview_scheduled", "interview_updated", "interview_cancelled"] }
      }),
      
      // Other unread notifications
      Notification.countDocuments({
        userId,
        status: "unread",
        isDeleted: false,
        type: { $nin: [
          "job_application", 
          "application_status_change",
          "interview_scheduled", 
          "interview_updated", 
          "interview_cancelled"
        ]}
      })
    ]);

    // Total by category (including read)
    const [totalApplications, totalInterviews] = await Promise.all([
      Notification.countDocuments({
        userId,
        isDeleted: false,
        type: { $in: ["job_application", "application_status_change"] }
      }),
      Notification.countDocuments({
        userId,
        isDeleted: false,
        type: { $in: ["interview_scheduled", "interview_updated", "interview_cancelled"] }
      })
    ]);

    res.json({
      success: true,
      summary: {
        total: {
          all: totalUnread + (await Notification.countDocuments({ userId, status: "read", isDeleted: false })),
          unread: totalUnread
        },
        applications: {
          total: totalApplications,
          unread: unreadApplications
        },
        interviews: {
          total: totalInterviews,
          unread: unreadInterviews
        },
        others: {
          unread: unreadOthers
        }
      }
    });
  } catch (error) {
    console.error("Error getting notification summary:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get notification summary",
      error: error.message 
    });
  }
};