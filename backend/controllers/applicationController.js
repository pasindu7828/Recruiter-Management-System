import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Interview from "../models/Interview.js";
import mlService from "../services/mlService.js";
import { 
  notifyRecruiterOnApplication,
  notifyCandidateOnStatusChange 
} from "./notificationController.js";
import fs from 'fs';      // ✅ ADD THIS
import path from 'path';  // ✅ ADD THIS

//APPLY FOR JOB (WITH ML ANALYSIS) 
export const applyJob = async (req, res) => {
  try {
    const { jobPostId, resume, phoneNumber, coverLetter, portfolioLink } = req.body;
    const userId = req.user._id;

    // Check if job exists and is still accepting applications
    const job = await Job.findById(jobPostId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    // Check if job deadline has passed
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({ message: "Job application deadline has passed" });
    }

    // Check if candidate already applied
    const alreadyApplied = await JobApplication.findOne({ jobPostId, userId });
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    // Check if the resume exists in user's resumes array
    const user = await User.findById(userId);
    if (!user.resumes || !user.resumes.includes(resume)) {
      return res.status(400).json({ message: "Selected resume not found in your profile" });
    }

    //  CV ANALYSIS WITH ML SERVICE
    let cvAnalysis = null;
        try {
      // Get the actual CV file from storage
      const cvFile = await getCVFileFromStorage(resume);
      
      // Build enriched job description for better ML analysis
      const enrichedJobDescription = `
    Job Title: ${job.jobTitle}
    Department: ${job.department || 'Not specified'}
    Experience Level: ${job.experienceLevel || 'Not specified'}
    Required Skills: ${job.requiredSkills?.join(', ') || 'None listed'}
    Requirements: ${job.requirements?.join(', ') || 'None listed'}
    Role Overview: ${job.roleOverview || 'Not specified'}
    Key Responsibilities: ${job.keyResponsibilities?.join(', ') || 'None listed'}

    Job Description:
    ${job.description}
      `.trim();
      
      if (cvFile && enrichedJobDescription) {
        cvAnalysis = await mlService.analyzeCV(cvFile, enrichedJobDescription);
        console.log(`✅ CV Analysis: ${user.name} - Score: ${cvAnalysis.match_score}%`);
      }
    } catch (mlError) {
      console.error("ML Service error:", mlError.message);
      // Continue without ML analysis - don't block application
    }

    // Create application with ML analysis results
    const application = await JobApplication.create({
      jobPostId,
      userId,
      resume,
      phoneNumber: phoneNumber || user.phone,
      coverLetter: coverLetter || "",
      portfolioLink: portfolioLink || "",
      // ML Analysis Fields
      matchScore: cvAnalysis?.match_score || null,
      matchStatus: cvAnalysis?.status || "pending",
      extractedSkills: cvAnalysis?.extracted_info?.skills || [],
      extractedExperience: cvAnalysis?.extracted_info?.experience_years || null,
      extractedEducation: cvAnalysis?.extracted_info?.education || null,
      missingSkills: cvAnalysis?.job_match?.missing_skills || [],
      recommendations: cvAnalysis?.recommendations || [],
      mlAnalysis: cvAnalysis || null
    });

    // Populate user info and job info
    await application.populate("userId", "name email phone");
    await application.populate("jobPostId", "jobTitle publishDate applicationDeadline description");

    // Send notification to recruiter
    await notifyRecruiterOnApplication(application._id);

    res.status(201).json({
      message: "Job applied successfully",
      application,
      analysis: cvAnalysis ? {
        matchScore: cvAnalysis.match_score,
        status: cvAnalysis.status_text,
        summary: cvAnalysis.analysis_summary
      } : null
    });

  } catch (error) {
    console.error("Apply job error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get CV file from storage
async function getCVFileFromStorage(resumePath) {
  const fullPath = path.join(process.cwd(), resumePath);
  
  console.log(`🔍 Looking for CV: ${fullPath}`);
  
  if (fs.existsSync(fullPath)) {
    console.log(`✅ CV found, sending to ML service`);
    return fs.createReadStream(fullPath);
  }
  
  console.log(`❌ CV not found at: ${fullPath}`);
  return null;
}

// Candidate edits their application
export const editApplication = async (req, res) => {
  try {
    const { jobPostId } = req.params;
    const { resume, phoneNumber, coverLetter, portfolioLink } = req.body;
    const userId = req.user._id;

    const application = await JobApplication.findOne({ jobPostId, userId });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if job is still accepting applications
    const job = await Job.findById(jobPostId);
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({ message: "Cannot edit application after job deadline" });
    }

    // ===== FIX: Only validate resume if it's being updated =====
    if (resume) {
      // Validate selected resume
      const user = await User.findById(userId);
      if (!user.resumes || !user.resumes.includes(resume)) {
        return res.status(400).json({ message: "Selected resume not found in your profile" });
      }
      application.resume = resume;
    }

    // Update new fields if provided
    if (phoneNumber !== undefined) application.phoneNumber = phoneNumber;
    if (coverLetter !== undefined) application.coverLetter = coverLetter;
    if (portfolioLink !== undefined) application.portfolioLink = portfolioLink;
    
    await application.save();

    res.status(200).json({ 
      message: "Application updated successfully", 
      application 
    });
    
  } catch (error) {
    console.error("Error in editApplication:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete application
export const deleteApplication = async (req, res) => {
  try {
    const { jobPostId } = req.params;
    const userId = req.user._id;

    const application = await JobApplication.findOne({ jobPostId, userId });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await application.deleteOne();
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my application details
export const getMyApplication = async (req, res) => {
  try {
    const { jobPostId } = req.params;  // now matches route parameter
    const userId = req.user._id;

    const application = await JobApplication.findOne({ jobPostId, userId })
      .populate("jobPostId", "jobTitle publishDate applicationDeadline")
      .populate("userId", "name email");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // If application status is "Interview Scheduled", fetch interview details
    let interviewDetails = null;
    if (application.status === "Interview Scheduled") {
      const interview = await Interview.findOne({ 
        jobPostId: application.jobPostId._id, 
        userId: userId 
      }).select("scheduled_date scheduled_time interviewType meetingLink notes status");
      
      interviewDetails = interview;
    }

    // Return application with interview details if available
    res.status(200).json({
      ...application.toObject(),
      interview: interviewDetails
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all my applications
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const applications = await JobApplication.find({ userId })
      .populate("jobPostId", "jobTitle publishDate applicationDeadline")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await JobApplication.countDocuments({ userId });

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      applications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application status (for recruiter)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const recruiterId = req.user._id;

    const validStatuses = ["Applied", "Screening", "Interview Scheduled", "Interviewed", "Offered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Security check: only the recruiter who posted the job can update status
    const job = await Job.findById(application.jobPostId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.postedBy.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    const oldStatus = application.status;
    application.status = status;
    await application.save();

    // This sends notification to the candidate about status change
    if (oldStatus !== status) {
      await notifyCandidateOnStatusChange(applicationId, oldStatus, status);
    }

    res.status(200).json({ 
      message: "Application status updated successfully", 
      application 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications for own recruiter's jobs
export const getApplicationsForRecruiterJobs = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const applications = await JobApplication.find()
      .populate({
        path: "jobPostId",
        match: { postedBy: recruiterId }, // only recruiter jobs
        select: "jobTitle publishDate applicationDeadline"
      })
      .populate("userId", "name email resumes");

    // remove applications where jobPostId didn't match
    const filteredApplications = applications.filter(app => app.jobPostId !== null);

    res.status(200).json({
      total: filteredApplications.length,
      applications: filteredApplications
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//filter candidates for a specific job by status (for ownrecruiter)
export const getCandidatesForJob = async (req, res) => {
  try {
    const { jobPostId } = req.params;
    const { status } = req.query; // optional
    const recruiterId = req.user._id;

    const job = await Job.findById(jobPostId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Not authorized to view these applications" });
    }

    let query = { jobPostId };
    if (status) query.status = status; // filter if status provided

    const applications = await JobApplication.find(query)
      .populate("userId", "name email resumes")
      .populate("jobPostId", "jobTitle publishDate applicationDeadline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: applications.length,
      applications
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all applications for a recruiter's jobs (including deleted jobs)
export const getAllApplicationsForRecruiter = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    // Fetch all applications
    const applications = await JobApplication.find()
      .populate({
        path: "jobPostId",
        select: "jobTitle publishDate applicationDeadline postedBy"
      })
      .populate("userId", "name email resumes");

    // Map applications: mark jobDeleted if job is missing or not this recruiter's
    const mappedApplications = applications.map(app => {
      const job = app.jobPostId;
      const isRecruiterJob = job && job.postedBy.toString() === recruiterId.toString();

      return {
        ...app.toObject(),
        jobDeleted: !isRecruiterJob, // true if job is deleted or not this recruiter's
        jobInfo: job ? { 
          jobTitle: job.jobTitle, 
          publishDate: job.publishDate, 
          applicationDeadline: job.applicationDeadline 
        } : null
      };
    });

    res.status(200).json({
      total: mappedApplications.length,
      applications: mappedApplications
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//accept or reject offer by candidate
export const respondToOffer = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { response } = req.body; // "Accept" or "Reject"
    const userId = req.user._id;

    // ✅ Validate input
    if (!["Accept", "Reject"].includes(response)) {
      return res.status(400).json({
        message: "Response must be Accept or Reject"
      });
    }

    // 🔍 Find application
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // 🔐 Ensure correct candidate
    if (application.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    // 🚫 Only allow if status is Offered
    if (application.status !== "Offered") {
      return res.status(400).json({
        message: "No offer available to respond"
      });
    }

    // ✅ Candidate decision
    if (response === "Accept") {
      application.status = "Hired";     // 🔥 THIS IS WHAT YOU WANT
    }

    if (response === "Reject") {
      application.status = "Rejected";
    }

    await application.save();

    res.status(200).json({
      message:
        response === "Accept"
          ? "Offer accepted. You are hired!"
          : "Application not successful",
      application
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download resume from application 
export const downloadApplicationResume = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user._id;

    // Get application
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user is the job poster
    const job = await Job.findById(application.jobPostId);
    if (!job || job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Download the file
    res.download(application.resume);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};