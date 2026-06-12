import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import mlService from "../services/mlService.js";

// Get ranked applications for a specific job (by match score)
export const getRankedApplicationsForJob = async (req, res) => {
  try {
    const { jobPostId } = req.params;
    const { minScore, status } = req.query;
    const recruiterId = req.user._id;

    // Verify job belongs to this recruiter
    const job = await Job.findById(jobPostId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.postedBy.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Build query
    let query = { jobPostId };
    if (minScore) query.matchScore = { $gte: parseInt(minScore) };
    if (status) query.matchStatus = status;

    // Get applications sorted by match score (highest first)
    const applications = await JobApplication.find(query)
      .populate("userId", "name email phone resumes")
      .populate("jobPostId", "jobTitle description")
      .sort({ matchScore: -1, createdAt: -1 });

    // Add ranking and statistics
    const rankedApplications = applications.map((app, index) => ({
      rank: index + 1,
      ...app.toObject(),
      matchPercentage: app.matchScore || 0,
      isTopCandidate: app.matchScore >= 80,
      isGoodCandidate: app.matchScore >= 65 && app.matchScore < 80,
      isPotential: app.matchScore >= 50 && app.matchScore < 65
    }));

    const stats = {
      total: rankedApplications.length,
      topCandidates: rankedApplications.filter(a => a.matchScore >= 80).length,
      goodCandidates: rankedApplications.filter(a => a.matchScore >= 65 && a.matchScore < 80).length,
      potential: rankedApplications.filter(a => a.matchScore >= 50 && a.matchScore < 65).length,
      rejected: rankedApplications.filter(a => a.matchScore < 50).length,
      notAnalyzed: rankedApplications.filter(a => !a.matchScore).length,
      averageScore: rankedApplications.filter(a => a.matchScore).reduce((sum, a) => sum + a.matchScore, 0) / 
                    rankedApplications.filter(a => a.matchScore).length || 0
    };

    res.status(200).json({
      job: { id: job._id, title: job.jobTitle },
      stats,
      candidates: rankedApplications
    });

  } catch (error) {
    console.error("Error in getRankedApplicationsForJob:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get top N candidates (shortlist)
export const getTopCandidates = async (req, res) => {
  try {
    const { jobPostId } = req.params;
    const { limit = 10, minScore = 65 } = req.query;
    const recruiterId = req.user._id;

    const job = await Job.findById(jobPostId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const topCandidates = await JobApplication.find({ 
      jobPostId, 
      matchScore: { $gte: parseInt(minScore) } 
    })
      .populate("userId", "name email phone resumes")
      .sort({ matchScore: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      job: { id: job._id, title: job.jobTitle },
      shortlist: topCandidates.map((c, i) => ({
        rank: i + 1,
        ...c.toObject(),
        matchScore: c.matchScore
      }))
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get candidate match analysis details
export const getCandidateMatchAnalysis = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const recruiterId = req.user._id;

    const application = await JobApplication.findById(applicationId)
      .populate("userId", "name email")
      .populate("jobPostId", "jobTitle description");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify job belongs to this recruiter
    if (application.jobPostId.postedBy.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({
      candidate: {
        id: application.userId._id,
        name: application.userId.name,
        email: application.userId.email
      },
      job: {
        id: application.jobPostId._id,
        title: application.jobPostId.jobTitle,
        description: application.jobPostId.description
      },
      analysis: {
        matchScore: application.matchScore,
        status: application.matchStatus,
        extractedSkills: application.extractedSkills,
        extractedExperience: application.extractedExperience,
        extractedEducation: application.extractedEducation,
        missingSkills: application.missingSkills,
        recommendations: application.recommendations,
        fullAnalysis: application.mlAnalysis
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recruiter dashboard stats
export const getRecruiterDashboardStats = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    // Get all jobs by this recruiter
    const jobs = await Job.find({ postedBy: recruiterId });
    const jobIds = jobs.map(job => job._id);

    // Get all applications for these jobs
    const applications = await JobApplication.find({ jobPostId: { $in: jobIds } });

    const stats = {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      avgMatchScore: applications.filter(a => a.matchScore).reduce((sum, a) => sum + a.matchScore, 0) / 
                      applications.filter(a => a.matchScore).length || 0,
      shortlisted: applications.filter(a => a.matchScore >= 65).length,
      strongShortlist: applications.filter(a => a.matchScore >= 80).length,
      needsReview: applications.filter(a => a.matchScore >= 50 && a.matchScore < 65).length,
      rejected: applications.filter(a => a.matchScore < 50).length,
      notAnalyzed: applications.filter(a => !a.matchScore).length,
      byJob: jobs.map(job => ({
        jobId: job._id,
        jobTitle: job.jobTitle,
        applications: applications.filter(a => a.jobPostId.toString() === job._id.toString()).length,
        avgScore: applications.filter(a => a.jobPostId.toString() === job._id.toString() && a.matchScore)
                  .reduce((sum, a) => sum + a.matchScore, 0) / 
                  applications.filter(a => a.jobPostId.toString() === job._id.toString() && a.matchScore).length || 0,
        topCandidate: applications.filter(a => a.jobPostId.toString() === job._id.toString())
                      .sort((a, b) => b.matchScore - a.matchScore)[0]
      }))
    };

    res.status(200).json(stats);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit recruiter feedback to improve ML model
export const submitRecruiterFeedback = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { recruiterScore, recruiterComments, hired } = req.body;
    const recruiterId = req.user._id;

    const application = await JobApplication.findById(applicationId)
      .populate("jobPostId", "postedBy");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify job belongs to this recruiter
    if (application.jobPostId.postedBy.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update with recruiter feedback
    application.recruiterScore = recruiterScore;
    application.recruiterComments = recruiterComments;
    application.hired = hired || false;
    
    if (hired) {
      application.status = "Offered";
    }

    await application.save();

    // Send feedback to ML service for future improvement
    try {
      await mlService.sendFeedback({
        applicationId: application._id,
        aiScore: application.matchScore,
        recruiterScore: recruiterScore,
        hired: hired,
        comments: recruiterComments
      });
      console.log(`✅ Feedback sent to ML service for application ${applicationId}`);
    } catch (mlError) {
      console.error("Failed to send feedback to ML service:", mlError.message);
    }

    res.status(200).json({
      message: "Recruiter feedback recorded. Thank you for helping improve our system!",
      application
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};