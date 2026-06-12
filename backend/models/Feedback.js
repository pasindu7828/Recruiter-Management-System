import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    // Reference to the interview
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: [true, "Interview reference is required"],
    },

    // Reference to the job application
    jobApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobApplication",
      required: [true, "Job Application reference is required"],
    },

    // Reference to the candidate
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidate reference is required"],
    },

    // Reference to the interviewer (person giving feedback)
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Interviewer reference is required"],
    },

    // Overall rating
    overallRating: {
      type: Number,
      required: [true, "Overall rating is required"],
      min: 1,
      max: 5,
    },

    // Technical Skills rating
    technicalSkills: {
      type: String,
      enum: ["Poor (1)", "Fair (2)", "Good (3)", "Very Good (4)", "Excellent (5)"],
      required: [true, "Technical Skills rating is required"],
    },

    // Communication Skills rating
    communicationSkills: {
      type: String,
      enum: ["Poor (1)", "Fair (2)", "Good (3)", "Very Good (4)", "Excellent (5)"],
      required: [true, "Communication Skills rating is required"],
    },

    // Cultural Fit rating
    culturalFit: {
      type: String,
      enum: ["Poor (1)", "Fair (2)", "Good (3)", "Very Good (4)", "Excellent (5)"],
      required: [true, "Cultural Fit rating is required"],
    },

    // Detailed comments
    comments: {
      type: String,
      required: [true, "Comments are required"],
      trim: true,
    },

    // Hiring recommendation
    hiringRecommendation: {
      type: String,
      enum: ["Confirmed", "Pending", "Rejected"],
      required: [true, "Hiring recommendation is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
