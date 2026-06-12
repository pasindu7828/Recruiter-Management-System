import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // For faster queries
    },

    type: {
      type: String,
      enum: [
        "job_application", 
        "interview_scheduled", 
        "interview_updated",
        "interview_cancelled",
        "application_status_change",
        "job_posted",
        "job_closed"
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed, // Flexible field for additional data
      default: {},
    },

    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    actionUrl: {
      type: String, // URL to redirect when notification is clicked
      default: null,
    },

    // For grouping related notifications
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
      default: null,
    },

    referenceModel: {
      type: String,
      enum: ['Job', 'JobApplication', 'Interview', 'User'],
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { 
    timestamps: true 
  }
);

// Compound index for common queries
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.status = "read";
  this.readAt = new Date();
  return this.save();
};

// Static method to mark multiple as read
notificationSchema.statics.markManyAsRead = async function(userId, notificationIds) {
  return this.updateMany(
    { 
      _id: { $in: notificationIds },
      userId: userId 
    },
    { 
      status: "read",
      readAt: new Date()
    }
  );
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { 
      userId: userId,
      status: "unread",
      isDeleted: false
    },
    { 
      status: "read",
      readAt: new Date()
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    userId: userId,
    status: "unread",
    isDeleted: false
  });
};

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

export default mongoose.model("Notification", notificationSchema);