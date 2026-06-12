import Interview from "../models/Interview.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import { notifyCandidateOnInterview } from "./notificationController.js";

// Schedule Interview
export const scheduleInterview = async (req, res) => {
  try {

    const recruiterId = req.user._id;
    const { jobPostId, userId, scheduled_date, scheduled_time, interviewType, meetingLink, notes } = req.body;

    // Check job exists
    const job = await Job.findById(jobPostId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Security check (only job owner recruiter)
    if (job.postedBy.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Not authorized to schedule interview for this job" });
    }

    // Check candidate applied to this job
    const application = await JobApplication.findOne({ jobPostId, userId });

    if (!application) {
      return res.status(400).json({ message: "Candidate has not applied for this job" });
    }

    // Create interview
    const interview = await Interview.create({
      jobPostId,
      userId,
      recruiterId,
      scheduled_date,
      scheduled_time,
      interviewType,
      meetingLink: interviewType === "online" ? meetingLink : null,
      notes
    });

    const populatedInterview = await Interview.findById(interview._id)
      .populate("userId", "name email")
      .populate("jobPostId", "topic")
      .populate("recruiterId", "name email");

      //NOTIFY CANDIDATE ABOUT SCHEDULED INTERVIEW
    await notifyCandidateOnInterview(interview._id, 'scheduled');

    res.status(201).json({
      message: "Interview scheduled successfully",
      interview: populatedInterview
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recruiter interviews
export const getRecruiterInterviews = async (req, res) => {
  try {

    const recruiterId = req.user._id;

    const interviews = await Interview.find({ recruiterId })
      .populate("userId", "name email")
      .populate("jobPostId", "topic")
      .sort({ scheduled_date: 1 });

    res.status(200).json({
      total: interviews.length,
      interviews
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get candidate interviews
export const getCandidateInterviews = async (req, res) => {
  try {

    const userId = req.user._id;

    const interviews = await Interview.find({ userId })
      .populate("jobPostId", "topic")
      .populate("recruiterId", "name email")
      .sort({ scheduled_date: 1 });

    res.status(200).json({
      total: interviews.length,
      interviews
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update interview (reschedule)
export const updateInterview = async (req, res) => {
  try {

    const recruiterId = req.user._id;
    const { interviewId } = req.params;
    const { scheduled_date, scheduled_time, interviewType, meetingLink, notes } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.recruiterId.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this interview" });
    }

    // ===== VALIDATION FOR INTERVIEW TYPE CHANGES =====
    if (interviewType && !["online", "physical"].includes(interviewType)) {
      return res.status(400).json({ 
        message: "Interview type must be 'online' or 'physical'" 
      });
    }

    // If changing to online, meeting link is required
    if (interviewType === "online" && !meetingLink && !interview.meetingLink) {
      return res.status(400).json({ 
        message: "Meeting link is required for online interviews" 
      });
    }

    // Store old values to check if anything changed
    const oldDate = interview.scheduled_date;
    const oldTime = interview.scheduled_time;
    const oldType = interview.interviewType;
    const oldMeetingLink = interview.meetingLink;

    interview.scheduled_date = scheduled_date || interview.scheduled_date;
    interview.scheduled_time = scheduled_time || interview.scheduled_time;
    interview.notes = notes !== undefined ? notes : interview.notes;
    
    // Handle interview type and meeting link
    if (interviewType) {
      interview.interviewType = interviewType;
      
      if (interviewType === "online") {
        // For online, set meeting link
        interview.meetingLink = meetingLink || interview.meetingLink;
      } else if (interviewType === "physical") {
        // For physical, clear meeting link
        interview.meetingLink = null;
      }
    } else {
      // If type not changed, update meeting link if provided
      if (meetingLink !== undefined) {
        interview.meetingLink = meetingLink;
      }
    }

    await interview.save();

    // Only notify if something actually changed
    if (oldDate !== interview.scheduled_date || oldTime !== interview.scheduled_time || oldType !== interview.interviewType || oldMeetingLink !== interview.meetingLink) {
      await notifyCandidateOnInterview(interview._id, 'updated');
    }

    res.status(200).json({
      message: "Interview updated successfully",
      interview
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Candidate confirm or reject interview
export const updateInterviewStatus = async (req, res) => {
  try {

    const userId = req.user._id;
    const { interviewId } = req.params;
    const { status } = req.body;

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be confirmed or rejected"
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Only the candidate can update their interview
    if (interview.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this interview"
      });
    }

    interview.status = status;

    await interview.save();

    res.status(200).json({
      message: `Interview ${status} successfully`,
      interview
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recruiter interviews by status
export const getRecruiterInterviewsByStatus = async (req, res) => {
  try {

    const recruiterId = req.user._id;
    const { status } = req.params;

    // Validate status
    if (!["pending", "confirmed", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be pending, confirmed, or rejected"
      });
    }

    const interviews = await Interview.find({
      recruiterId,
      status
    })
      .populate("userId", "name email")
      .populate("jobPostId", "topic")
      .sort({ scheduled_date: 1 });

    res.status(200).json({
      total: interviews.length,
      status,
      interviews
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete interview
export const deleteInterview = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Only recruiter who scheduled (job owner) can delete
    if (interview.recruiterId.toString() !== recruiterId.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this interview"
      });
    }

    await Interview.findByIdAndDelete(interviewId);

    res.status(200).json({
      message: "Interview deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};