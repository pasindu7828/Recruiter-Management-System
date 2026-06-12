import Feedback from "../models/Feedback.js";

// Create feedback for a candidate after interview
export const createFeedback = async (req, res) => {
  try {
    const {
      interview,
      jobApplication,
      candidate,
      overallRating,
      technicalSkills,
      communicationSkills,
      culturalFit,
      comments,
      hiringRecommendation,
    } = req.body;

    // Validate required fields
    if (
      !interview ||
      !jobApplication ||
      !candidate ||
      !overallRating ||
      !technicalSkills ||
      !communicationSkills ||
      !culturalFit ||
      !comments ||
      !hiringRecommendation
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      interview,
      jobApplication,
      candidate,
      interviewer: req.user._id,
      overallRating,
      technicalSkills,
      communicationSkills,
      culturalFit,
      comments,
      hiringRecommendation,
    });

    // Populate references
    await feedback.populate([
      { path: "interview", select: "scheduled_date scheduled_time interviewType" },
      { path: "jobApplication", select: "jobPostId userId" },
      { path: "candidate", select: "name email bio" },
      { path: "interviewer", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all feedbacks (Admin only)
export const getAllFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const feedbacks = await Feedback.find()
      .populate("interview", "scheduled_date scheduled_time interviewType")
      .populate("jobApplication", "jobPostId userId")
      .populate("candidate", "name email bio")
      .populate("interviewer", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments();

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single feedback by ID (Admin only)
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate("interview", "scheduled_date scheduled_time interviewType")
      .populate("jobApplication", "jobPostId userId")
      .populate("candidate", "name email bio")
      .populate("interviewer", "name email");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my feedbacks (Interviewer's given feedbacks or candidate's received feedbacks)
export const getMyFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // If user is admin, get all feedbacks; otherwise get based on role
    let query;
    if (req.user.role === "admin") {
      query = {};
    } else if (req.user.role === "recruiter" || req.user.role === "hr") {
      // Interviewers - get feedbacks they've given
      query = { interviewer: req.user._id };
    } else {
      // Candidate - get feedbacks about them
      query = { candidate: req.user._id };
    }

    const feedbacks = await Feedback.find(query)
      .populate("interview", "scheduled_date scheduled_time interviewType")
      .populate("jobApplication", "jobPostId userId")
      .populate("candidate", "name email bio")
      .populate("interviewer", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update feedback (Interviewer only)
export const updateFeedback = async (req, res) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Check if user is the interviewer
    if (feedback.interviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this feedback",
      });
    }

    feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete feedback (Interviewer or Admin)
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Check if user is the interviewer or admin
    if (
      feedback.interviewer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this feedback",
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
