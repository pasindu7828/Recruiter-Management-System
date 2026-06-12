import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
{
  jobPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  scheduled_date: {
    type: Date,
    required: true,
  },

  scheduled_time: {
    type: String,
    required: true,
  },

  interviewType: {
    type: String,
    enum: ["online", "physical"],
    required: true,
    default: "online",
    description: "Type of interview - online or physical"
  },

  meetingLink: {
    type: String,
    trim: true,
    default: null,
    description: "Google Meet/Zoom/Teams link for online interviews"
  },

   notes: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: "",
    description: "Additional notes about the interview"
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected"],
    default: "pending",
  },

},
{ timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);