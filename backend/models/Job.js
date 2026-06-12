import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    hiringManager: {
      type: String,
      trim: true,
    },

    employmentType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
        "Temporary",
        "Freelance",
      ],
    },

    experienceLevel: {
      type: String,
      trim: true,
    },

    openings: {
      type: Number,
      min: 1,
      default: 1,
    },

    workArrangement: {
      type: String,
      enum: ["Remote", "On-site", "Hybrid"],
    },

    location: {
      type: String,
      trim: true,
    },

    minSalary: {
      type: Number,
      min: 0,
    },

    maxSalary: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      trim: true,
      default: "USD",
    },

    payPeriod: {
      type: String,
      enum: ["Hourly", "Weekly", "Monthly", "Yearly"],
      default: "Monthly",
    },

    roleOverview: {
      type: String,
      trim: true,
    },

    keyResponsibilities: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      trim: true,
    },

    publishDate: {
      type: Date,
      required: [true, "Publish date is required"],
    },

    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },

    status: {
      type: String,
      enum: ["Draft", "Published", "Closed"],
      required: [true, "Status is required"],
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Validate salary range
jobSchema.pre("validate", function validateSalary() {
  if (
    this.minSalary !== undefined &&
    this.maxSalary !== undefined &&
    this.minSalary !== null &&
    this.maxSalary !== null &&
    this.minSalary > this.maxSalary
  ) {
    throw new Error("Minimum salary cannot be greater than maximum salary");
  }
});

// Text index for fast search across job titles, departments, and skills
jobSchema.index({ jobTitle: "text", department: "text", requiredSkills: "text" });

export default mongoose.model("Job", jobSchema);
