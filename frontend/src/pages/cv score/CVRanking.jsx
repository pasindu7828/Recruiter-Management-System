import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import { toast } from "react-hot-toast";

const apiRequest = async (path, options = {}) => {
  const BASE = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION}`;
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

/* ─── Profile Modal Sub-component ─── */
function CandidateProfileModal({ isOpen, onClose, application, onFeedbackSubmit }) {
  const [recruiterScore, setRecruiterScore] = useState(application?.recruiterScore || application?.matchScore || 70);
  const [recruiterComments, setRecruiterComments] = useState(application?.recruiterComments || "");
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onFeedbackSubmit(application._id, { recruiterScore, recruiterComments });
      onClose();
    } catch (err) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCV = async () => {
    setDownloading(true);
    try {
      const BASE = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION}`;
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${BASE}/applications/download-resume/${application._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `CV_${application.userId?.name || "Candidate"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Could not download CV. File may be missing on server.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePortfolioClick = () => {
    if (application.portfolioLink) {
      // Ensure link has a protocol
      const url = application.portfolioLink.startsWith("http") 
        ? application.portfolioLink 
        : `https://${application.portfolioLink}`;
      window.open(url, "_blank");
    } else {
      toast.error("No portfolio link provided by candidate");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {application.userId?.name?.[0] || "?"}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">{application.userId?.name || "Candidate Profile"}</h2>
              <p className="text-slate-500 font-medium">{application.userId?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick Action Buttons */}
            <button 
              onClick={handleDownloadCV}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-200 text-sm shadow-sm disabled:opacity-50"
              title="Download Resume"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
              {downloading ? "Preparing..." : "Download CV"}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Ring */}
            <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Match</span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-200" />
                  <circle 
                    cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" 
                    strokeDasharray={364} strokeDashoffset={364 - (364 * application.matchScore) / 100}
                    className={`${application.matchScore >= 80 ? 'text-emerald-500' : 'text-indigo-500'} transition-all duration-1000`} 
                  />
                </svg>
                <span className="absolute text-3xl font-black text-slate-800">{application.matchScore}%</span>
              </div>
              <p className="mt-4 text-sm font-bold text-slate-500 capitalize">{application.matchStatus || "Screened"}</p>
            </div>

            {/* Detailed Info */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Rank</p>
                <p className="text-lg font-bold text-slate-800">#{application.rank || "N/A"}</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Phone</p>
                <p className="text-lg font-bold text-slate-800">{application.userId?.phone || application.phoneNumber || "—"}</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Portfolio / Profile</p>
                {application.portfolioLink ? (
                  <button 
                    onClick={handlePortfolioClick}
                    className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
                  >
                    View Link
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                ) : (
                  <p className="text-slate-400 font-medium">None provided</p>
                )}
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Status</p>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg uppercase">
                  {application.status}
                </span>
              </div>
            </div>
          </div>

          {/* AI Analysis Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Skills Analysis
              </h3>
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-500">Extracted Skills</p>
                <div className="flex flex-wrap gap-2">
                  {application.extractedSkills?.length > 0 ? (
                    application.extractedSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">{s}</span>
                    ))
                  ) : <span className="text-slate-400 italic text-sm">None detected</span>}
                </div>
                
                <p className="text-sm font-bold text-slate-500 mt-4">Missing Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {application.missingSkills?.length > 0 ? (
                    application.missingSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-100">{s}</span>
                    ))
                  ) : <span className="text-emerald-600 italic text-sm">All key skills present!</span>}
                </div>
              </div>
            </div>

            {/* Experience & Recommendations */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                </svg>
                AI Insights & Recommendations
              </h3>
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                <ul className="space-y-2">
                  {application.recommendations?.length > 0 ? (
                    application.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-indigo-500 mt-1">•</span> {r}
                      </li>
                    ))
                  ) : <li className="text-slate-400 italic text-sm">No specific recommendations</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="bg-slate-50 p-8 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Recruiter Feedback</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Recruiter Score (0-100)</label>
                  <input 
                    type="number" min="0" max="100" 
                    value={recruiterScore} 
                    onChange={e => setRecruiterScore(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-bold text-lg"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Recruiter Comments</label>
                  <textarea 
                    rows="3"
                    value={recruiterComments}
                    onChange={e => setRecruiterComments(e.target.value)}
                    placeholder="Add your thoughts on this candidate's fit..."
                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800">Cancel</button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CVRanking() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [error, setError] = useState(null);

  /* Modal State */
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch recruiter's jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/jobs/recruiter/my-jobs?limit=100");
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Fetch candidates for selected job
  const fetchCandidates = async (jobId) => {
    setCandidatesLoading(true);
    try {
      const data = await apiRequest(`/cv-analysis/jobs/${jobId}/ranked`);
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    fetchCandidates(job._id);
  };

  const resetSelection = () => {
    setSelectedJob(null);
    setCandidates([]);
  };

  const handleViewProfile = (app) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const handleFeedbackSubmit = async (applicationId, feedbackData) => {
    try {
      const data = await apiRequest(`/cv-analysis/applications/${applicationId}/feedback`, {
        method: "POST",
        body: JSON.stringify(feedbackData),
      });
      toast.success("Feedback recorded successfully");
      // Refresh candidates list to show updated score if needed
      if (selectedJob) fetchCandidates(selectedJob._id);
    } catch (err) {
      console.error("Feedback error:", err);
      throw err;
    }
  };

  return (
    <Layout active="Recruitment Analytics" role="recruiter">
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-['Inter',sans-serif]">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedJob ? "Candidate Rankings" : "Resume Screening & Scoring"}
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              {selectedJob 
                ? `Top candidates for ${selectedJob.jobTitle}` 
                : "Select a job post to view AI-scored and ranked candidates based on job requirements."}
            </p>
          </div>

          {!selectedJob ? (
            // Jobs Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                ))
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <div 
                    key={job._id}
                    onClick={() => handleJobClick(job)}
                    className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-indigo-50 text-indigo-600 p-2 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-col h-full">
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                          {job.department || "General"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                        {job.jobTitle}
                      </h3>
                      <div className="flex items-center text-slate-500 text-sm mb-6">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.workArrangement || "Remote"}
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs font-medium uppercase tracking-tighter">Status</span>
                          <span className={`${job.status === 'Published' ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-xs font-medium uppercase tracking-tighter">Closing</span>
                          <div className="text-slate-700 font-semibold italic">
                            {new Date(job.applicationDeadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 text-lg">No job postings found.</p>
                </div>
              )}
            </div>
          ) : (
            // Ranked Candidates View
            <div className="space-y-6">
              {/* Back Button */}
              <button 
                onClick={resetSelection}
                className="flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Jobs
              </button>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Top Candidates</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Top 5 candidates based on match score</p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-xl border border-indigo-100 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium uppercase mr-2 tracking-wide">Total Applications</span>
                    <span className="text-indigo-600 font-extrabold text-lg">{candidates.length}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                        <th className="px-8 py-4 w-20">Rank</th>
                        <th className="px-8 py-4">Candidate</th>
                        <th className="px-8 py-4">Score</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {candidatesLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan="5" className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                          </tr>
                        ))
                      ) : candidates.length > 0 ? (
                        candidates.slice(0, 5).map((app, index) => (
                          <tr key={app._id} className="hover:bg-indigo-50/20 transition-colors">
                            <td className="px-8 py-6">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg 
                                ${index === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' : 
                                  index === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' : 
                                  index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
                                  'bg-slate-50 text-slate-400'}`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-slate-900 font-bold text-base">{app.userId?.name || "Anonymous"}</span>
                                <span className="text-slate-500 text-sm">{app.userId?.email || "No email provided"}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-xs font-bold mb-1">
                                  <span className={`${app.matchScore >= 80 ? 'text-emerald-600' : app.matchScore >= 60 ? 'text-indigo-600' : 'text-slate-500'}`}>
                                    {app.matchScore}% Match
                                  </span>
                                </div>
                                <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      app.matchScore >= 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                      app.matchScore >= 60 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 
                                      'bg-slate-400'
                                    }`}
                                    style={{ width: `${app.matchScore}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter
                                ${app.matchStatus === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' : 
                                  app.matchStatus === 'Needs Review' ? 'bg-amber-100 text-amber-700' : 
                                  'bg-slate-100 text-slate-600'}`}>
                                {app.matchStatus || "Analyzed"}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => handleViewProfile(app)}
                                className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-200 text-sm shadow-sm"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-8 py-20 text-center text-slate-500 italic">
                            No ranked candidates found for this job yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {candidates.length > 5 && (
                  <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 text-center">
                    <p className="text-slate-500 text-sm">
                      Showing top 5 of {candidates.length} candidates. 
                      <button className="ml-2 text-indigo-600 font-bold hover:underline">View All Candidates</button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CandidateProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        application={selectedApp}
        onFeedbackSubmit={handleFeedbackSubmit}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
    </Layout>
  );
}
