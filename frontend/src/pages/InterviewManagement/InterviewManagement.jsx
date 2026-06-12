import React, { useState, useEffect } from "react";
import DeleteModal from "../../components/DeleteModal";
import InterviewDetails from "./InterviewDetails";
import EditInterview from "./EditInterview";
import ScheduleInterview from "./ScheduleInterview";
import InterviewFeedback from "./InterviewFeedback";
import Layout from "../../components/layout/Layout";
import API from "../../api/api";
import { getCurrentUserRole } from "../../services/roleService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

//const Layout = ({ children }) => <>{children}</>;

const InterviewManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isFeedback, setIsFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(getCurrentUserRole());

  const [interviews, setInterviews] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
  }, [role]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const endpoint =
        role === "candidate"
          ? "/interviews/candidate"
          : "/interviews/recruiter";
      const { data } = await API.get(endpoint);

      let profileName = "";
      try {
        const profileResponse = await API.get("/users/profile");
        profileName = profileResponse?.data?.user?.name || "";
      } catch (profileError) {
        console.error("Error fetching profile name:", profileError);
      }

      const missingJobIds = [
        ...new Set(
          (data.interviews || [])
            .filter(
              (inv) =>
                inv?.jobPostId?._id &&
                !inv?.jobPostId?.jobTitle &&
                !inv?.jobPostId?.topic &&
                !inv?.jobPostId?.position,
            )
            .map((inv) => inv.jobPostId._id),
        ),
      ];

      const jobTitleMap = {};
      if (missingJobIds.length > 0) {
        await Promise.all(
          missingJobIds.map(async (jobId) => {
            try {
              const jobResponse = await API.get(`/jobs/${jobId}`);
              const job = jobResponse?.data?.job;
              jobTitleMap[jobId] =
                job?.jobTitle ||
                job?.topic ||
                job?.position ||
                "Job position not set";
            } catch (jobError) {
              jobTitleMap[jobId] = "Job position not set";
            }
          }),
        );
      }

      // Map backend data to frontend structure
      const formattedInterviews = data.interviews.map((inv) => ({
        id: inv._id,
        candidateId: inv.userId?._id || "",
        jobPostId: inv.jobPostId?._id || "",
        name:
          role === "candidate"
            ? inv.recruiterId?.name || "Recruiter"
            : inv.userId?.name || "Unknown Candidate",
        role:
          inv.jobPostId?.jobTitle ||
          inv.jobPostId?.topic ||
          inv.jobPostId?.position ||
          jobTitleMap[inv.jobPostId?._id] ||
          "Job position not set",
        date: inv.scheduled_date
          ? inv.scheduled_date.split("T")[0]
          : "Date not set",
        time: inv.scheduled_time || "Time not set",
        type: inv.interviewType || "Not specified",
        manager:
          inv.recruiterId?.name ||
          profileName ||
          (role === "candidate" ? "Recruiter Team" : "Recruiter"),
        status: inv.status || "Pending",
        meetingLink: inv.meetingLink,
        notes: inv.notes,
      }));
      setInterviews(formattedInterviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  };

  const handleEditClick = (interview) => {
    setSelectedInterview(interview);
    setIsEditing(true);
  };

  const handleViewClick = (interview) => {
    setSelectedInterview(interview);
    setIsEditing(false);
  };

  const handleBackToManagement = () => {
    setSelectedInterview(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setSelectedInterview(null);
    setIsEditing(false);
  };

  const handleScheduleClick = () => {
    setIsScheduling(true);
  };

  const handleCancelSchedule = () => {
    setIsScheduling(false);
  };

  const handleFeedbackClick = (interview) => {
    navigate("/feedback", {
      state: {
        candidateId: interview.candidateId,
        interviewId: interview.id,
        jobPostId: interview.jobPostId,
        candidateName: interview.name,
        interviewRole: interview.role,
        interviewDate: interview.date,
      },
    });
  };

  const handleAddFeedbackClick = () => {
    setIsFeedback(true);
  };

  const handleCancelFeedback = () => {
    setIsFeedback(false);
    setSelectedInterview(null);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedInterview?.id) {
        toast.error("Interview id not found");
        return;
      }

      await API.delete(`/interviews/delete/${selectedInterview.id}`);
      setInterviews(
        interviews.filter((item) => item.id !== selectedInterview.id),
      );
      setSelectedInterview(null);
      setIsModalOpen(false);
      toast.success("Interview deleted permanently");
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete interview",
      );
    }
  };

  const handleAddInterview = async (newInterview) => {
    try {
      // Extract from ScheduleInterview formData
      const payload = {
        jobPostId: newInterview.jobPostId, // Need to make sure this is passed from form
        userId: newInterview.candidateId, // Need candidate ID
        scheduled_date: newInterview.date,
        scheduled_time: newInterview.time,
        interviewType: newInterview.type.toLowerCase(),
        meetingLink: newInterview.link,
        notes: newInterview.notes,
      };

      const { data } = await API.post("/interviews/schedule", payload);
      if (data.interview) {
        fetchInterviews();
        setIsScheduling(false);
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert(error.response?.data?.message || "Failed to schedule interview");
    }
  };

  const handleUpdateInterview = async (updatedInterview) => {
    try {
      const payload = {
        jobPostId: updatedInterview.jobPostId,
        role: updatedInterview.role,
        scheduled_date: updatedInterview.date,
        scheduled_time: updatedInterview.time,
        interviewType: updatedInterview.type?.toLowerCase(),
        meetingLink: updatedInterview.link,
        notes: updatedInterview.notes,
      };
      await API.put(`/interviews/update/${updatedInterview.id}`, payload);

      setInterviews((prevInterviews) =>
        prevInterviews.map((interviewItem) =>
          interviewItem.id === updatedInterview.id
            ? {
                ...interviewItem,
                jobPostId:
                  updatedInterview.jobPostId || interviewItem.jobPostId,
                role: updatedInterview.role || interviewItem.role,
                date: updatedInterview.date || interviewItem.date,
                time: updatedInterview.time || interviewItem.time,
                type: updatedInterview.type || interviewItem.type,
                meetingLink: updatedInterview.link || interviewItem.meetingLink,
                notes: updatedInterview.notes ?? interviewItem.notes,
                manager: updatedInterview.manager || interviewItem.manager,
              }
            : interviewItem,
        ),
      );

      setSelectedInterview(null);
      setIsEditing(false);
      toast.success("Interview updated successfully");
    } catch (error) {
      console.error("Error updating interview:", error);
      toast.error(
        error.response?.data?.message || "Failed to update interview",
      );
    }
  };

  const handleUpdateStatus = async (interviewId, newStatus) => {
    try {
      const { data } = await API.put(`/interviews/status/${interviewId}`, {
        status: newStatus,
      });
      toast.success(data.message || `Interview ${newStatus} successfully`);
      fetchInterviews();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleSubmitFeedback = (feedbackData) => {
    console.log("Feedback submitted:", feedbackData);
    setIsFeedback(false);
    setSelectedInterview(null);
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch = interview.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || interview.status === statusFilter;
    const matchesDate = !dateFilter || interview.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return { bg: "bg-[#e8fbf3] text-[#10b981]", dot: "bg-[#10b981]" };
      case "pending":
        return { bg: "bg-[#fff7ed] text-[#f59e0b]", dot: "bg-[#f59e0b]" };
      case "rejected":
        return { bg: "bg-[#fef2f2] text-[#ef4444]", dot: "bg-[#ef4444]" };
      case "scheduled":
        return { bg: "bg-[#e0f2fe] text-[#0ea5e9]", dot: "bg-[#0ea5e9]" };
      default:
        return { bg: "bg-gray-50 text-gray-700", dot: "bg-gray-500" };
    }
  };

  return (
    <Layout
      active={role === "candidate" ? "Interview Schedule" : "Interviews"}
      role={role}
    >
      <DeleteModal
        isOpen={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          if (!isEditing && !isScheduling && !isFeedback && selectedInterview) {
            // Keep selectedInterview if we are in details view
          } else {
            setSelectedInterview(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
      {isFeedback ? (
        <InterviewFeedback
          interview={selectedInterview}
          onCancel={handleCancelFeedback}
          onSubmit={handleSubmitFeedback}
        />
      ) : isScheduling ? (
        <ScheduleInterview
          onCancel={handleCancelSchedule}
          onSubmit={handleAddInterview}
        />
      ) : isEditing ? (
        <EditInterview
          interview={selectedInterview}
          onCancel={handleCancelEdit}
          onSubmit={handleUpdateInterview}
        />
      ) : selectedInterview ? (
        <InterviewDetails
          interview={selectedInterview}
          onBack={handleBackToManagement}
          onEdit={() => handleEditClick(selectedInterview)}
          onAddFeedback={handleAddFeedbackClick}
          onDelete={() => handleDeleteClick(selectedInterview)}
          role={role}
        />
      ) : (
        <div className="flex flex-col flex-grow bg-gray-50 text-gray-900 w-full h-full min-h-screen">
          {/* Main Content */}
          <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8">
            {" "}
            {/* Header Title */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Interview Management
              </h1>
              <p className="text-gray-500 text-sm">
                Manage and track all candidate interviews
              </p>
            </div>
            {/* Filters and Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="relative w-full lg:w-[400px]">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search candidate name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-auto">
                  <i className="far fa-calendar-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full sm:w-44 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-500 bg-white"
                  />
                </div>

                <div className="relative w-full sm:w-auto">
                  <i className="fas fa-filter absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none w-full sm:w-40 pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700 bg-white cursor-pointer"
                  >
                    <option>All Status</option>
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Rejected</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
                </div>

                {role !== "candidate" && (
                  <button
                    onClick={handleScheduleClick}
                    className="w-full sm:w-auto whitespace-nowrap bg-[#311c6d] text-white px-5 py-2 rounded-lg hover:bg-[#201247] transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <i className="fas fa-plus"></i> Schedule Interview
                  </button>
                )}
              </div>
            </div>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-y-10 md:gap-x-10 lg:gap-x-20">
              {filteredInterviews.map((interview, index) => {
                const styles = getStatusStyles(interview.status);
                return (
                  <div
                    key={index}
                    className="bg-white rounded-[1rem] shadow-sm border border-gray-100 p-8 flex flex-col hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-gray-800 leading-tight">
                        {interview.name}
                      </h3>
                      <span
                        className={`px-4 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-2 border border-transparent ${styles.bg}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${styles.dot}`}
                        ></span>
                        {interview.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[15px] font-medium mb-6">
                      {interview.role}
                    </p>

                    <div className="flex items-center text-gray-500 font-medium text-[15px] mb-4 gap-3">
                      <i className="far fa-calendar-alt text-gray-400"></i>
                      {interview.date} at {interview.time}
                    </div>

                    <p className="text-[14px] text-gray-400 mb-2 font-medium">
                      Type: {interview.type}
                    </p>
                    <p className="text-[14px] text-gray-400 mb-8 font-medium">
                      Manager: {interview.manager}
                    </p>

                    {role === "candidate" ? (
                      <div className="mt-auto flex flex-col gap-3">
                        {interview.status?.toLowerCase() === "pending" ||
                        interview.status?.toLowerCase() === "scheduled" ? (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() =>
                                handleUpdateStatus(interview.id, "confirmed")
                              }
                              className="flex justify-center items-center gap-2 bg-[#10b981] text-white rounded-lg py-2 text-[14px] font-bold hover:bg-[#059669] transition shadow-sm"
                            >
                              <i className="fas fa-check"></i> Confirm
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(interview.id, "rejected")
                              }
                              className="flex justify-center items-center gap-2 bg-[#ef4444] text-white rounded-lg py-2 text-[14px] font-bold hover:bg-[#dc2626] transition shadow-sm"
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-[14px] font-bold cursor-not-allowed"
                          >
                            Decision Taken
                          </button>
                        )}
                        <button
                          onClick={() => handleViewClick(interview)}
                          className="flex justify-center items-center gap-2 border border-gray-200 rounded-lg py-2 text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm"
                        >
                          <i className="far fa-eye text-gray-400"></i> View
                          Details
                        </button>
                      </div>
                    ) : (
                      <div className="mt-auto flex flex-col gap-3">
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 xl:gap-4">
                          <button
                            onClick={() => handleViewClick(interview)}
                            className="flex justify-center items-center gap-2 border border-gray-200 rounded-lg py-2 text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm"
                          >
                            <i className="far fa-eye text-gray-400"></i> View
                          </button>
                          <button
                            onClick={() => handleEditClick(interview)}
                            className="flex justify-center items-center gap-2 border border-gray-200 rounded-lg py-2 text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm"
                          >
                            <i className="far fa-edit text-gray-400"></i> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(interview)}
                            className="flex justify-center items-center border border-red-100 rounded-lg px-4 py-2 text-red-400 hover:bg-red-50 transition shadow-sm"
                          >
                            <i className="far fa-trash-alt"></i>
                          </button>
                        </div>
                        <button
                          onClick={() => handleFeedbackClick(interview)}
                          className="w-full flex justify-center items-center gap-2 bg-[#401A94] text-white rounded-lg py-2 text-[14px] font-bold hover:bg-[#311c6d] transition shadow-sm"
                        >
                          <i className="far fa-comment-dots"></i> Feedback
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      )}
    </Layout>
  );
};

export default InterviewManagement;
