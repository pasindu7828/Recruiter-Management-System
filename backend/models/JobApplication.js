import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
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
    resume: {
      type: String, // path of the selected CV from user's resumes array
      required: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
      required: false, // Optional field
      match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, "Please enter a valid phone number"],
      description: "Candidate's contact number"
    },
    
    coverLetter: {
      type: String,
      trim: true,
      required: false,
      maxlength: 5000, // Limit cover letter length
      description: "Candidate's cover letter or message to recruiter"
    },
    
    portfolioLink: {
      type: String,
      trim: true,
      required: false,
      match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, "Please enter a valid URL"],
      description: "Link to candidate's portfolio, GitHub, LinkedIn, etc."
    },
    
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Applied", "Screening", "Interview Scheduled", "Interviewed", "Offered","Rejected", "Hired"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

export default mongoose.models.JobApplication || mongoose.model("JobApplication", jobApplicationSchema);