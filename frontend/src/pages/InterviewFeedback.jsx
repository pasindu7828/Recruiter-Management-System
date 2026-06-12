import { useEffect, useState } from "react";
import {
  createFeedback,
  getUserById,
  getApplicationByJobAndCandidate,
} from "../api/feedbackApi";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";

const InterviewFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const candidateId = location.state?.candidateId || "";
  const interviewId = location.state?.interviewId || "";
  const jobPostId = location.state?.jobPostId || "";
  const candidateName = location.state?.candidateName || "";
  const interviewRole = location.state?.interviewRole || "";
  const interviewDate = location.state?.interviewDate || "";
  const [candidate, setCandidate] = useState(null);
  const [jobApplicationId, setJobApplicationId] = useState("");

  const [rating, setRating] = useState(4);
  const [comments, setComments] = useState("");
  const [technicalSkills, setTechnicalSkills] = useState("Good (3)");
  const [communicationSkills, setCommunicationSkills] = useState("Good (3)");
  const [culturalFit, setCulturalFit] = useState("Very Good (4)");
  const [hiringRecommendation, setHiringRecommendation] = useState("Confirmed");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!candidateId || !interviewId) {
      alert("Missing candidate or interview data ❌");
      navigate(-1);
      return;
    }

    const fetchCandidate = async () => {
      try {
        const { data } = await getUserById(candidateId);
        setCandidate(data?.candidate || data);
      } catch (error) {
        console.error("Failed to fetch candidate:", error);
      }
    };

    const fetchApplication = async () => {
      try {
        const { data } = await getApplicationByJobAndCandidate(jobPostId);
        const allApps = data?.applications || [];
        const match = allApps.find(
          (a) => a.userId?._id === candidateId || a.userId === candidateId,
        );
        setJobApplicationId(match?._id || "");
      } catch (error) {
        console.error("Failed to fetch application:", error);
      }
    };

    fetchCandidate();
    fetchApplication();
  }, [candidateId, interviewId]);

  const handleSubmit = async () => {
    try {
      if (!interviewId || !jobApplicationId || !candidateId) {
        return alert("Missing required data ❌");
      }

      setLoading(true);

      const payload = {
        interview: interviewId,
        jobApplication: jobApplicationId,
        candidate: candidateId,
        overallRating: rating,
        technicalSkills,
        communicationSkills,
        culturalFit,
        comments,
        hiringRecommendation,
      };

      await createFeedback(payload);
      alert("Feedback submitted successfully ");
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error submitting ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout active="Interviews" role="manager">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Submit Interview Feedback</h1>
          <button
            className="px-4 py-2 border rounded-lg text-sm border-[#401A94]"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* LEFT CARD */}
          <div className="col-span-2 bg-white p-6 rounded-xl shadow border border-[#401A94]">
            <div className="border border-[#401A94] border-dashed p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Interview Details</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Candidate:</span>{" "}
                {candidateName || candidate?.name || candidateId}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Position:</span>{" "}
                {interviewRole || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Interview Date:</span>{" "}
                {interviewDate || "N/A"}
              </p>
            </div>

            {/* Rating */}
            <div className="border border-[#401A94] border-dashed p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Overall Rating</h3>
              <div className="flex gap-1 text-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={`cursor-pointer ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {rating} out of 5 stars
              </p>
            </div>

            {/* Skill Dropdowns */}
            <div className="space-y-3 mb-4">
              {/* Technical Skills */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Technical Skills
                </label>
                <select
                  value={technicalSkills}
                  onChange={(e) => setTechnicalSkills(e.target.value)}
                  className="w-full border border-[#401A94] p-2 rounded-lg"
                >
                  <option>Poor (1)</option>
                  <option>Fair (2)</option>
                  <option>Good (3)</option>
                  <option>Very Good (4)</option>
                  <option>Excellent (5)</option>
                </select>
              </div>

              {/* Communication Skills */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Communication Skills
                </label>
                <select
                  value={communicationSkills}
                  onChange={(e) => setCommunicationSkills(e.target.value)}
                  className="w-full border border-[#401A94] p-2 rounded-lg"
                >
                  <option>Poor (1)</option>
                  <option>Fair (2)</option>
                  <option>Good (3)</option>
                  <option>Very Good (4)</option>
                  <option>Excellent (5)</option>
                </select>
              </div>

              {/* Cultural Fit */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Cultural Fit
                </label>
                <select
                  value={culturalFit}
                  onChange={(e) => setCulturalFit(e.target.value)}
                  className="w-full border border-[#401A94] p-2 rounded-lg"
                >
                  <option>Poor (1)</option>
                  <option>Fair (2)</option>
                  <option>Good (3)</option>
                  <option>Very Good (4)</option>
                  <option>Excellent (5)</option>
                </select>
              </div>
            </div>

            {/* Comments */}
            <div className="border border-[#401A94] border-dashed p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Detailed Comments</h3>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border rounded-lg p-2 border-[#401A94]"
                placeholder="Write your feedback..."
              />
            </div>

            {/* Hiring Recommendation */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Hiring Recommendation</h3>
              <div className="flex gap-3">
                {["Confirmed", "Pending", "Rejected"].map((item) => (
                  <span
                    key={item}
                    onClick={() => setHiringRecommendation(item)}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                      hiringRecommendation === item
                        ? "bg-[#401A94] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-white px-5 py-2 rounded-lg"
                style={{ backgroundColor: "#401A94" }}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2 border rounded-lg border-[#401A94]"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-[#401A94]">
            <h3 className="font-semibold mb-4">Candidate Summary</h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center bg-[#401A94] text-white rounded-full">
                {candidate?.name
                  ? candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : candidateName
                    ? candidateName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "?"}
              </div>
              <div>
                <p className="font-medium">
                  {candidate?.name || candidateName || "Loading..."}
                </p>
                <p className="text-sm text-gray-500">
                  {candidate?.bio || "No bio available"}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-2 mb-4">
              <p>📧 {candidate?.email || "-"}</p>
              <p>📞 {candidate?.phone || "-"}</p>
              <p>
                🎂{" "}
                {candidate?.dateOfBirth
                  ? new Date(candidate.dateOfBirth).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            {/* Resume Section */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Resumes</h4>
              {candidate?.resumes?.length > 0 ? (
                <ul className="text-sm text-blue-600 space-y-1">
                  {candidate.resumes.map((resume, index) => (
                    <li key={index}>
                      <a href={resume} target="_blank" rel="noreferrer">
                        View Resume {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No resumes uploaded</p>
              )}
            </div>

            {/* Position */}
            <div>
              <h4 className="font-medium mb-2">Applied Position</h4>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {interviewRole || "N/A"}
              </span>
            </div>

            {/* Skills */}
            {/*<div>
            <h4 className="font-medium mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {["Communication", "Teamwork", "Problem Solving"].map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>*/}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InterviewFeedback;
