import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Interview from "../models/Interview.js";

class NotificationService {
  
  /**
   * Create a notification
   */
  async createNotification({
    userId,
    type,
    title,
    body,
    data = {},
    actionUrl = null,
    referenceId = null,
    referenceModel = null,
    expiresAt = null
  }) {
    try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        console.error(`User ${userId} not found, cannot create notification`);
        return null;
      }

      const notification = new Notification({
        userId,
        type,
        title,
        body,
        data,
        actionUrl,
        referenceId,
        referenceModel,
        expiresAt
      });

      await notification.save();
      
      // Here you could also emit a socket event for real-time notification
      // this.emitSocketNotification(userId, notification);
      
      console.log(`Notification created for user ${userId}: ${type}`);
      return notification;
      
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * 1. When candidate applies for a job -> Notify recruiter
   */
  async notifyRecruiterOnApplication(jobApplication) {
    try {
      // Populate if needed
      const application = await JobApplication.findById(jobApplication._id)
        .populate('userId', 'name email')
        .populate({
          path: 'jobPostId',
          populate: { path: 'postedBy', select: 'name email' }
        });

      if (!application) return;

      const job = application.jobPostId;
      const candidate = application.userId;
      const recruiterId = job.postedBy._id;

      const notification = await this.createNotification({
        userId: recruiterId,
        type: "job_application",
        title: "New Job Application",
        body: `${candidate.name} applied for "${job.topic}" position`,
        data: {
          applicationId: application._id,
          jobId: job._id,
          jobTitle: job.topic,
          candidateId: candidate._id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          resume: application.resume,
          appliedDate: application.date
        },
        actionUrl: `/recruiter/applications/${application._id}`,
        referenceId: application._id,
        referenceModel: "JobApplication"
      });

      return notification;
    } catch (error) {
      console.error("Error notifying recruiter on application:", error);
    }
  }

  /**
   * 2. When recruiter schedules/updates interview -> Notify candidate
   */
  async notifyCandidateOnInterviewSchedule(interview, action = 'scheduled') {
    try {
      // Populate interview data
      const interviewData = await Interview.findById(interview._id)
        .populate('userId', 'name email')
        .populate({
          path: 'jobPostId',
          select: 'topic postedBy'
        })
        .populate('recruiterId', 'name');

      if (!interviewData) return;

      const candidate = interviewData.userId;
      const job = interviewData.jobPostId;
      const recruiter = interviewData.recruiterId;

      // Format date and time
      const scheduledDate = new Date(interviewData.scheduled_date);
      const formattedDate = scheduledDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      let title, body, type;

      if (action === 'scheduled') {
        type = "interview_scheduled";
        title = "Interview Scheduled";
        body = `Interview scheduled for ${job.topic} on ${formattedDate} at ${interviewData.scheduled_time}`;
      } else if (action === 'updated') {
        type = "interview_updated";
        title = "Interview Updated";
        body = `Your interview for ${job.topic} has been rescheduled to ${formattedDate} at ${interviewData.scheduled_time}`;
      } else if (action === 'cancelled') {
        type = "interview_cancelled";
        title = "Interview Cancelled";
        body = `Your interview for ${job.topic} scheduled on ${formattedDate} has been cancelled`;
      }

      const notification = await this.createNotification({
        userId: candidate._id,
        type: type,
        title: title,
        body: body,
        data: {
          interviewId: interviewData._id,
          jobId: job._id,
          jobTitle: job.topic,
          recruiterId: recruiter._id,
          recruiterName: recruiter.name,
          scheduledDate: interviewData.scheduled_date,
          scheduledTime: interviewData.scheduled_time,
          action: action
        },
        actionUrl: `/candidate/interviews/${interviewData._id}`,
        referenceId: interviewData._id,
        referenceModel: "Interview",
        expiresAt: interviewData.scheduled_date // Notification expires after interview date
      });

      return notification;
    } catch (error) {
      console.error("Error notifying candidate on interview:", error);
    }
  }

  /**
   * 3. When recruiter changes application status -> Notify candidate
   */
  async notifyCandidateOnStatusChange(applicationId, oldStatus, newStatus) {
    try {
      const application = await JobApplication.findById(applicationId)
        .populate('userId', 'name email')
        .populate({
          path: 'jobPostId',
          select: 'topic postedBy',
          populate: { path: 'postedBy', select: 'name' }
        });

      if (!application) return;

      const candidate = application.userId;
      const job = application.jobPostId;
      const recruiter = job.postedBy;

      // Status-specific messages
      const statusMessages = {
        "Screening": "Your application is now in screening phase",
        "Interview Scheduled": "Interview has been scheduled for your application",
        "Interviewed": "You have completed the interview",
        "Offered": "Congratulations! You have received an offer",
        "Rejected": "Thank you for your interest, but we've moved forward with other candidates"
      };

      const notification = await this.createNotification({
        userId: candidate._id,
        type: "application_status_change",
        title: "Application Status Updated",
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

      return notification;
    } catch (error) {
      console.error("Error notifying candidate on status change:", error);
    }
  }

  /**
   * Helper: Send bulk notifications
   */
  async notifyMultipleUsers(notifications) {
    try {
      const createdNotifications = await Notification.insertMany(notifications);
      return createdNotifications;
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      throw error;
    }
  }

  /**
   * Helper: Clean up old notifications
   */
  async cleanupOldNotifications(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await Notification.updateMany(
        {
          createdAt: { $lt: cutoffDate },
          status: 'read'
        },
        {
          isDeleted: true
        }
      );

      console.log(`Cleaned up ${result.modifiedCount} old notifications`);
      return result;
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
    }
  }

  /**
   * Optional: Real-time notifications via Socket.io
   */
  emitSocketNotification(userId, notification) {
    // Implement if you're using Socket.io
    const io = global.io; // Make sure io is available globally
    if (io) {
      io.to(`user-${userId}`).emit('notification', notification);
    }
  }
}

export default new NotificationService();