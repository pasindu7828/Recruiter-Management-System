import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { getCurrentUserRole } from "../../services/roleService";

/* ─── TOKEN MAPS ─── */
const TYPE_CFG = {
  ft: { bg:"#EFF6FF", color:"#2563EB" },
  pt: { bg:"#F5F3FF", color:"#7C3AED" },
  ct: { bg:"#FFF7ED", color:"#EA580C" },
};
const LOC_CFG = {
  remote: { bg:"#F4F5F7", color:"#059669" },
  onsite: { bg:"#F4F5F7", color:"#EA580C" },
  hybrid: { bg:"#F0FDFA", color:"#0D9488" },
};
const STATUS_CFG = {
  active: { dot:"#059669", text:"#059669", label:"Active" },
  draft:  { dot:"#D97706", text:"#D97706", label:"Draft"  },
  closed: { dot:"#64748B", text:"#64748B", label:"Closed" },
  paused: { dot:"#D97706", text:"#D97706", label:"Paused" },
};

const COL = {
  title:   245.17, dept:    134.25, type:    122.58, loc:     122.58,
  apps:    116.75, closes:  128.42, status:  110.91, actions: 169.34,
};

/* ─── API HELPER ─── */
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

/* ─────────────────────────────────────────
   TOAST NOTIFICATION SYSTEM
───────────────────────────────────────── */
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`
            pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg
            min-w-[300px] max-w-[420px] border
            transition-all duration-300 animate-in slide-in-from-right
            ${t.type === "success" ? "bg-white border-[#D1FAE5] text-[#065F46]"
            : t.type === "error"   ? "bg-white border-[#FEE2E2] text-[#991B1B]"
            :                        "bg-white border-[#E8EAF0] text-[#1A1A2E]"}
          `}
        >
          {/* Icon */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${t.type === "success" ? "bg-[#D1FAE5]" : t.type === "error" ? "bg-[#FEE2E2]" : "bg-[#F4F5F7]"}`}>
            {t.type === "success" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            )}
            {t.type === "error" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {t.type === "info" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B92A5" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-semibold">{t.title}</div>
            {t.message && <div className="text-[12px] mt-0.5 opacity-75">{t.message}</div>}
          </div>

          {/* Close */}
          <button onClick={() => removeToast(t.id)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded opacity-50 hover:opacity-100 border-none bg-transparent cursor-pointer transition-opacity">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── useToast hook ─── */
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message = "", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, type, title, message }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast("success", title, message),
    error:   (title, message) => addToast("error",   title, message),
    info:    (title, message) => addToast("info",    title, message),
  };

  return { toasts, toast, removeToast };
}

/* ─────────────────────────────────────────
   ATOMS
───────────────────────────────────────── */
function DeltaArrow({ up }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      {up
        ? <polyline points="8.25,6.88 5.5,4.13 2.75,6.88" stroke="#00C48C" strokeWidth="1.38" strokeLinecap="round" strokeLinejoin="round"/>
        : <polyline points="2.75,4.13 5.5,6.88 8.25,4.13" stroke="#FF4757" strokeWidth="1.38" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  );
}

function StatCard({ value, label, delta, up, iconBg, icon }) {
  return (
    <div className="flex-1 flex items-center gap-3.5 bg-white px-5 py-[18px] rounded-xl outline outline-1 outline-[#E8EAF0] outline-offset-[-1px]">
      <div className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>{icon}</div>
      <div className="flex flex-col gap-[3px]">
        <div className="text-[28px] font-extrabold leading-[28px] text-[#1A1A2E]">{value}</div>
        <div className="text-[13px] font-medium text-[#8B92A5]">{label}</div>
        {delta && (
          <div className={`pt-[1px] flex items-center gap-[3px] text-[12.5px] font-semibold ${up ? "text-[#00C48C]" : "text-[#FF4757]"}`}>
            <DeltaArrow up={up} />{delta}
          </div>
        )}
      </div>
    </div>
  );
}

function TypePill({ type, typeKey }) {
  const c = TYPE_CFG[typeKey] || TYPE_CFG.ft;
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded-[6px]" style={{ background: c.bg }}>
      <span className="text-[13px] font-semibold leading-[13px]" style={{ color: c.color }}>{type}</span>
    </div>
  );
}

function LocPill({ location, locationKey, locationIcon }) {
  const c = LOC_CFG[locationKey] || LOC_CFG.remote;
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded-[6px]" style={{ background: c.bg }}>
      <span className="text-[13px] font-semibold leading-[13px]" style={{ color: c.color }}>{locationIcon} {location}</span>
    </div>
  );
}

function StatusBadge({ statusKey }) {
  const c = STATUS_CFG[statusKey] || STATUS_CFG.active;
  return (
    <div className="inline-flex items-center bg-[#F4F5F7] rounded-[6px] px-2.5 py-1 h-[22px]">
      <div className="w-[6px] h-[6px] rounded-full mr-2 flex-shrink-0" style={{ background: c.dot }} />
      <span className="text-[13px] font-semibold leading-[13px]" style={{ color: c.text }}>{c.label}</span>
    </div>
  );
}

/* ─── ACTION BUTTONS ───
   Logic:
   - Active/Draft jobs:  Close + Edit
   - Closed jobs (admin): Close (disabled/greyed) + Delete (red)
   - Closed jobs (non-admin): Close (disabled/greyed) + Edit
*/
function ActionButtons({ job, onClose, onEdit, onDelete, isRecruiter }) {
  const isClosed = job.statusKey === "closed";

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* ── CLOSE ── always present, disabled when already closed ── */}
      <button
        disabled={isClosed}
        onClick={(e) => { e.stopPropagation(); if (!isClosed) onClose(job); }}
        className={`
          h-8 px-3.5 rounded-[6px] flex items-center justify-center border-none
          text-[13px] font-semibold leading-[13px] transition-colors
          ${isClosed
            ? "bg-[#F1F5F9] text-[#94A3B8] outline outline-1 outline-[#CBD5E1] outline-offset-[-1px] cursor-not-allowed opacity-55"
            : "bg-[#FEF2F2] text-[#DC2626] outline outline-1 outline-[#FECACA] outline-offset-[-1px] cursor-pointer hover:bg-[#FEE2E2]"}
        `}
      >
        Close
      </button>

      {/* ── DELETE (admin + closed) or EDIT (otherwise) ── */}
      {isClosed && isRecruiter ? (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(job); }}
          className="h-8 px-3.5 rounded-[6px] flex items-center justify-center border-none bg-[#FEF2F2] text-[#DC2626] text-[13px] font-semibold leading-[13px] outline outline-1 outline-[#FECACA] outline-offset-[-1px] cursor-pointer hover:bg-[#FEE2E2] transition-colors"
        >
          Delete
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(job.id); }}
          className="h-8 px-3.5 rounded-[6px] flex items-center justify-center border-none bg-[#F4F5F7] text-[#374151] text-[13px] font-semibold leading-[13px] outline outline-1 outline-[#E0E3EA] outline-offset-[-1px] cursor-pointer hover:bg-[#E8EAF0] transition-colors"
        >
          Edit
        </button>
      )}
    </div>
  );
}

/* ─── MOBILE CARD ─── */
function MobileCard({ job, onClose, onEdit, onDelete, isRecruiter }) {
  return (
    <div className="p-4 border-b border-[#F0F2F5]">
      <div className="flex justify-between items-start gap-2.5 mb-2.5">
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-[#1A1A2E] truncate">{job.title}</div>
          <div className="text-[12.5px] text-[#9CA3AF] mt-0.5">Manager: {job.manager}</div>
        </div>
        <StatusBadge statusKey={job.statusKey} />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        <TypePill type={job.type} typeKey={job.typeKey} />
        <LocPill location={job.location} locationKey={job.locationKey} locationIcon={job.locationIcon} />
        <span className="text-[13px] text-[#374151] font-medium self-center">{job.department}</span>
      </div>
      <div className="flex gap-6 mb-3">
        <div>
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.8px]">Applicants</div>
          <div className="mt-1 text-[14px] font-bold text-[#1A1A2E]">{job.applicants ?? 0}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.8px]">Closes</div>
          <div className="mt-1 text-[13px] text-[#9CA3AF] font-medium">{job.closes ?? "—"}</div>
        </div>
      </div>
      <ActionButtons job={job} onClose={onClose} onEdit={onEdit} onDelete={onDelete} isRecruiter={isRecruiter} />
    </div>
  );
}

/* ─── CLOSE CONFIRM POPUP ─── */
function ClosePopup({ job, onConfirm, onCancel, loading }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="h-1 w-full bg-red-500 rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1A1A2E]">Close this vacancy?</h3>
              <p className="text-[13px] text-[#8B92A5] mt-1">You're about to close</p>
              <div className="mt-2 px-3 py-2 bg-[#F4F5F7] rounded-lg">
                <span className="text-[13.5px] font-semibold text-[#1A1A2E]">{job.title}</span>
                <span className="text-[12px] text-[#9CA3AF] ml-2">{job.department}</span>
              </div>
              <p className="text-[13px] text-[#8B92A5] mt-3">
                This will stop new applications from being accepted. Existing applicants won't be affected.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onCancel} disabled={loading}
              className="h-9 px-5 bg-[#F4F5F7] border border-[#E0E3EA] rounded-[9px] text-[13px] font-semibold text-[#374151] cursor-pointer hover:bg-[#E8EAF0] transition-colors font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button onClick={() => onConfirm(job)} disabled={loading}
              className="h-9 px-5 bg-[#DC2626] rounded-[9px] text-[13px] font-semibold text-white cursor-pointer hover:bg-red-700 transition-colors border-none font-['Inter'] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5">
              {loading
                ? <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Closing…</>
                : "Yes, Close Vacancy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DELETE CONFIRM POPUP ─── */
function DeletePopup({ job, onConfirm, onCancel, loading }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="h-1 w-full bg-red-600 rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1A1A2E]">Permanently delete this job?</h3>
              <p className="text-[13px] text-[#8B92A5] mt-1">You're about to permanently delete</p>
              <div className="mt-2 px-3 py-2 bg-[#F4F5F7] rounded-lg">
                <span className="text-[13.5px] font-semibold text-[#1A1A2E]">{job.title}</span>
                <span className="text-[12px] text-[#9CA3AF] ml-2">{job.department}</span>
              </div>
              <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[12px] text-red-700 font-medium">
                  This action cannot be undone. All job data will be permanently removed from the system.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onCancel} disabled={loading}
              className="h-9 px-5 bg-[#F4F5F7] border border-[#E0E3EA] rounded-[9px] text-[13px] font-semibold text-[#374151] cursor-pointer hover:bg-[#E8EAF0] transition-colors font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button onClick={() => onConfirm(job)} disabled={loading}
              className="h-9 px-5 bg-[#DC2626] rounded-[9px] text-[13px] font-semibold text-white cursor-pointer hover:bg-red-700 transition-colors border-none font-['Inter'] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5">
              {loading
                ? <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Deleting…</>
                : <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    </svg>
                    Yes, Delete Permanently
                  </>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function JobDashboard() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();
  const [userRole] = useState(() => getCurrentUserRole() || "recruiter");

  const activeTabLabel = userRole === "admin"
    ? "Job Management"
    : userRole === "manager"
      ? "Job Requests"
      : "Job Openings"; // recruiter

  /* ── State ── */
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState(0);
  const [search,     setSearch]     = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [sort,       setSort]       = useState("Sort: Newest First");
  const [page,       setPage]       = useState(1);

  /* Popups */
  const [confirmJob, setConfirmJob] = useState(null);  // close popup
  const [deleteJob,  setDeleteJob]  = useState(null);  // delete popup
  const [isClosing,  setIsClosing]  = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* Application stats from API */
  const [appStats, setAppStats] = useState({
    total:      null,   // null = still loading
    avgDays:    null,
    hiringRate: null,
  });

  /* ── Format API job → UI shape ── */
  const formatApiJob = (apiJob, applicantCount = 0) => {
    const typeMap   = { "Full-time":"ft", "Part-time":"pt", "Contract":"ct", "Internship":"ct" };
    const locMap    = { "Remote":"remote", "On-site":"onsite", "Hybrid":"hybrid" };
    const statusMap = { "Published":"active", "Draft":"draft", "Closed":"closed" };
    return {
      id:          apiJob._id,
      title:       apiJob.jobTitle || "Untitled",
      manager:     apiJob.hiringManager?.name || apiJob.hiringManager || "Unassigned",
      department:  apiJob.department || "N/A",
      type:        apiJob.employmentType || "Full-time",
      typeKey:     typeMap[apiJob.employmentType] || "ft",
      location:    apiJob.workArrangement || "Remote",
      locationKey: locMap[apiJob.workArrangement] || "remote",
      locationIcon:apiJob.workArrangement === "Remote" ? "🌐" : apiJob.workArrangement === "On-site" ? "🏢" : "⚡",
      applicants:  applicantCount,
      closes:      apiJob.applicationDeadline
                     ? new Date(apiJob.applicationDeadline).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })
                     : "—",
      status:      apiJob.status === "Published" ? "Active" : apiJob.status,
      statusKey:   statusMap[apiJob.status] || "active",
    };
  };

  /* ── Get user role from token ── */
  const getUserRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role;
      }
    } catch {
      return null;
    }
    return null;
  };

  /* ── Detect recruiter status from token ── */
  const [isRecruiter, setIsRecruiter] = useState(null);
  useEffect(() => {
    setIsRecruiter(getUserRole() === "recruiter");
  }, []);

  /* ── Fetch jobs + applicant counts in parallel ── */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      /* Step 1 — detect role and select appropriate endpoint */
      const userRole = getUserRole();
      const endpoint = userRole === "recruiter" 
        ? "/jobs/recruiter/my-jobs?limit=100" 
        : userRole === "admin" 
          ? "/jobs/admin/all?limit=100"
          : "/jobs?limit=100";
      
      const data = await apiRequest(endpoint);
      if (!data.success) return;

      const rawJobs = data.jobs;

      /* Step 2 — fetch applicant count for every job concurrently
         Route: GET /applications/job/:jobPostId/candidates
         We only need the `total` field, so failures are silenced per-job. */
      const counts = await Promise.all(
        rawJobs.map(async (job) => {
          try {
            const res = await apiRequest(`/applications/job/${job._id}/candidates`);
            return res.total ?? 0;
          } catch {
            return 0; // if a single job fails, show 0 rather than breaking the whole list
          }
        })
      );

      /* Step 3 — merge counts into formatted jobs */
      setJobs(rawJobs.map((job, i) => formatApiJob(job, counts[i])));
    } catch (err) {
      toast.error("Failed to load jobs", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  /* ── Fetch application stats → GET /applications/recruiter-applications ── */
  useEffect(() => {
    const fetchApplicationStats = async () => {
      try {
        const data = await apiRequest("/applications/recruiter-applications");
        const applications = data.applications || [];

        /* ── Total Applicants ── */
        const total = applications.length;

        /* ── Avg. Time-to-Hire ──────────────────────────────────────
           Definition: for every application with status "Offered",
           measure how many days elapsed from the job's publishDate
           to the application's createdAt date (the day it was submitted).
           Average those durations.
           Falls back to "—" if no offers exist yet.
        ─────────────────────────────────────────────────────────── */
        const offeredApps = applications.filter(a => a.status === "Offered");

        let avgDays = null;
        if (offeredApps.length > 0) {
          const totalDays = offeredApps.reduce((sum, a) => {
            const publishDate = new Date(a.jobPostId?.publishDate || a.createdAt);
            const appliedDate = new Date(a.createdAt);
            const diffMs   = appliedDate - publishDate;
            const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
            return sum + diffDays;
          }, 0);
          avgDays = Math.round(totalDays / offeredApps.length);
        }

        /* ── Hiring Rate ────────────────────────────────────────────
           Definition: (applications with status "Offered" / total
           applications) × 100, rounded to one decimal place.
           Falls back to "—" if there are no applications yet.
        ─────────────────────────────────────────────────────────── */
        const hiringRate = total > 0
          ? Math.round((offeredApps.length / total) * 1000) / 10  // one decimal
          : null;

        setAppStats({ total, avgDays, hiringRate });
      } catch (err) {
        // Non-critical — stats cards will show "—" on failure
        console.warn("Could not load application stats:", err.message);
        setAppStats({ total: 0, avgDays: null, hiringRate: null });
      }
    };

    fetchApplicationStats();
  }, []); // run once on mount — re-fetch manually after close/delete if needed

  /* ── Derived / tabs ── */
  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q);
    const matchDept   = department === "All Departments" || j.department === department;
    const matchTab    = activeTab === 0
      || (activeTab === 1 && j.statusKey === "active")
      || (activeTab === 2 && j.statusKey === "draft")
      || (activeTab === 3 && j.statusKey === "closed");
    return matchSearch && matchDept && matchTab;
  });

  const TABS = [
    { label:"All",    count: jobs.length },
    { label:"Active", count: jobs.filter(j => j.statusKey === "active").length },
    { label:"Draft",  count: jobs.filter(j => j.statusKey === "draft").length  },
    { label:"Closed", count: jobs.filter(j => j.statusKey === "closed").length },
  ];

  /* ── Display helpers for stat cards ── */
  const totalApplicantsDisplay = appStats.total === null ? "…"
    : appStats.total.toString();

  const avgTimeDisplay = appStats.avgDays === null ? "—"
    : `${appStats.avgDays}d`;

  const hiringRateDisplay = appStats.hiringRate === null ? "—"
    : `${appStats.hiringRate}%`;

  const STATS = [
    { value: TABS[1].count.toString(), label:"Active Vacancies",  up:true,  iconBg:"#EFF6FF",
      icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="1.83" y="6.42" width="18.33" height="12.83" rx="1.5" stroke="#2563EB" strokeWidth="1.83"/><rect x="7.33" y="2.75" width="7.33" height="3.67" rx="0.5" stroke="#2563EB" strokeWidth="1.83"/></svg> },
    { value: totalApplicantsDisplay,   label:"Total Applicants",  up:true,  iconBg:"#F5F3FF",
      icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M1 20v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="#7C3AED" strokeWidth="1.83" strokeLinecap="round"/><circle cx="7" cy="7" r="4" stroke="#7C3AED" strokeWidth="1.83"/><path d="M19 20v-2a4 4 0 0 0-3-3.87" stroke="#7C3AED" strokeWidth="1.83" strokeLinecap="round"/><path d="M15 3.13a4 4 0 0 1 0 7.75" stroke="#7C3AED" strokeWidth="1.83" strokeLinecap="round"/></svg> },
    { value: avgTimeDisplay,           label:"Avg. Time-to-Hire", up: appStats.avgDays !== null && appStats.avgDays <= 21, iconBg:"#F4F5F7",
      icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9.17" stroke="#D97706" strokeWidth="1.83"/><polyline points="11,5.5 11,11 14.67,12.83" stroke="#D97706" strokeWidth="1.83" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { value: hiringRateDisplay,        label:"Hiring Rate",       up: appStats.hiringRate !== null && appStats.hiringRate >= 50, iconBg:"#F4F5F7",
      icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><polyline points="20.17,11 16.5,11 13.75,19.25 8.25,2.75 5.5,11 1.83,11" stroke="#059669" strokeWidth="1.83" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  ];

  /* ── CLOSE JOB → PUT /jobs/:id { status: "Closed" } ── */
  const handleConfirmClose = async (job) => {
    setIsClosing(true);
    try {
      await apiRequest(`/jobs/${job.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Closed" }),
      });
      toast.success("Vacancy closed", `"${job.title}" is now closed to new applications.`);
      await fetchJobs();
    } catch (err) {
      toast.error("Failed to close vacancy", err.message);
    } finally {
      setIsClosing(false);
      setConfirmJob(null);
    }
  };

  /* ── DELETE JOB → DELETE /jobs/:id ── */
  const handleConfirmDelete = async (job) => {
    setIsDeleting(true);
    try {
      await apiRequest(`/jobs/${job.id}`, { method: "DELETE" });
      toast.success("Job deleted", `"${job.title}" has been permanently removed.`);
      await fetchJobs();
    } catch (err) {
      toast.error("Failed to delete job", err.message);
    } finally {
      setIsDeleting(false);
      setDeleteJob(null);
    }
  };

  const handleEdit    = (id)  => navigate(`/job_details/${id}`);
  const handlePostNew = ()    => navigate("/job_post");

  /* ── Table styles ── */
  const th = (w) => ({
    width:w, minWidth:w, maxWidth:w, padding:"12px 14px",
    borderBottom:"1px #E8EAF0 solid", color:"#9CA3AF", fontSize:12, fontWeight:700,
    textTransform:"uppercase", letterSpacing:0.8, textAlign:"left", whiteSpace:"nowrap",
    boxSizing:"border-box", fontFamily:"Inter,sans-serif", background:"#FAFBFC",
  });
  const td = (w, pt=14, pb=14) => ({
    width:w, minWidth:w, maxWidth:w,
    paddingLeft:14, paddingRight:14, paddingTop:pt, paddingBottom:pb,
    borderBottom:"1px #F0F2F5 solid", overflow:"hidden", boxSizing:"border-box", verticalAlign:"middle",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .jv{font-family:'Inter',sans-serif}
        .jv-tab{padding:11px 16px;border:none;background:none;border-right:1px solid #E8EAF0;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#8B92A5;cursor:pointer;white-space:nowrap;height:38px;display:inline-flex;align-items:center;transition:background .15s}
        .jv-tab:last-child{border-right:none}
        .jv-tab.on{background:#401A94;color:#fff}
        .jv-tab:hover:not(.on){background:#F4F5F7}
        .jv-sel{height:38px;border:none;border-radius:9px;outline:1px #E8EAF0 solid;outline-offset:-1px;background:#fff;padding:0 28px 0 13px;font-family:'Inter',sans-serif;font-size:13px;color:#1A1A2E;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 13' fill='none'%3E%3Cpolyline points='3.25,4.88 6.5,8.13 9.75,4.88' stroke='%238B92A5' stroke-width='1.35' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;background-size:13px}
        .jv-si{border:none;outline:none;background:none;font-family:'Inter',sans-serif;font-size:13px;color:#1A1A2E;width:100%}
        .jv-si::placeholder{color:#9CA3AF;font-size:13px}
        .jv-pb{height:40px;padding:0 20px;background:#401A94;border-radius:9px;border:none;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:#fff;cursor:pointer;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;transition:background .15s}
        .jv-pb:hover{background:#5B2FBF}
        .jv-pg{width:32px;height:32px;border-radius:6px;border:none;background:#fff;outline:1px #E8EAF0 solid;outline-offset:-1px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#8B92A5;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .13s}
        .jv-pg.on{background:#401A94;color:#fff;outline-color:#401A94}
        .jv-pg:hover:not(.on){background:#F4F5F7;color:#1A1A2E}
        .jv-tr:hover>td{background:#FAFBFC}
        .jv-tr:last-child>td{border-bottom:none!important}
        .jv-desktop{display:block}
        .jv-mobile{display:none}
        @media(max-width:860px){.jv-desktop{display:none!important}.jv-mobile{display:block!important}.jv-stats{grid-template-columns:repeat(2,1fr)!important}.jv-header{flex-direction:column!important;align-items:flex-start!important;gap:12px!important}}
        @media(max-width:500px){.jv-stats{grid-template-columns:1fr 1fr!important;gap:10px!important}.jv-tabs-row{display:none!important}}
        @keyframes slide-in-from-right{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        .animate-in{animation:slide-in-from-right 0.25s ease-out}
        @keyframes spin{to{transform:rotate(360deg)}}
        .animate-spin{animation:spin 0.8s linear infinite}
      `}</style>

      {/* ── TOAST LAYER ── */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── POPUPS ── */}
      <ClosePopup
        job={confirmJob}
        onConfirm={handleConfirmClose}
        onCancel={() => setConfirmJob(null)}
        loading={isClosing}
      />
      <DeletePopup
        job={deleteJob}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteJob(null)}
        loading={isDeleting}
      />

      <Layout active={activeTabLabel} role={userRole}>
        <div className="jv bg-[#F4F5F7] min-h-screen p-6 sm:p-7">

          {/* PAGE HEADER */}
          <div className="jv-header flex justify-between items-center mb-5">
            <div className="flex flex-col gap-0.5">
              <div className="text-[20px] font-bold text-[#1A1A2E]">Job Vacancies</div>
              <div className="text-[14px] text-[#8B92A5]">Manage and track all job postings</div>
            </div>
            <button className="jv-pb" onClick={handlePostNew}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="7.5" y1="2" x2="7.5" y2="13"/><line x1="2" y1="7.5" x2="13" y2="7.5"/>
              </svg>
              Post New Job
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="jv-stats grid grid-cols-4 gap-3.5 mb-5">
            {STATS.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* TOOLBAR */}
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <div className="h-[38px] px-3.5 bg-white rounded-[9px] outline outline-1 outline-[#E8EAF0] outline-offset-[-1px] flex items-center gap-2 min-w-[240px]">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.88" cy="6.88" r="5" stroke="#8B92A5" strokeWidth="1.25"/>
                <line x1="11.16" y1="11.16" x2="13.41" y2="13.41" stroke="#8B92A5" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
              <input className="jv-si" placeholder="Search job title, department…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="jv-tabs-row h-[38px] bg-white rounded-[9px] outline outline-1 outline-[#E8EAF0] outline-offset-[-1px] overflow-hidden flex">
              {TABS.map((t, i) => (
                <button key={i} className={`jv-tab${activeTab === i ? " on" : ""}`} onClick={() => setActiveTab(i)}>
                  {t.label}&nbsp;<span className="opacity-60 text-[12px]">({t.count})</span>
                </button>
              ))}
            </div>

            <select className="jv-sel" value={department} onChange={e => setDepartment(e.target.value)}>
              <option>All Departments</option>
              <option>Engineering</option><option>Design</option>
              <option>Marketing</option><option>Finance</option>
            </select>

            <select className="jv-sel" value={sort} onChange={e => setSort(e.target.value)}>
              <option>Sort: Newest First</option>
              <option>Sort: Most Applied</option>
              <option>Sort: Closing Soon</option>
            </select>
          </div>

          {/* TABLE CARD */}
          <div className="bg-white rounded-xl outline outline-1 outline-[#E8EAF0] outline-offset-[-1px] overflow-hidden">
            <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#E8EAF0]">
              <span className="text-[15px] font-bold text-[#1A1A2E]">All Job Postings</span>
              <span className="px-2.5 py-[3px] bg-[#F4F5F7] rounded-full text-[13px] font-medium text-[#8B92A5]">
                {filtered.length} jobs
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-[#8B92A5]">
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span className="text-[14px]">Loading jobs…</span>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="jv-desktop overflow-x-auto">
                  <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed", fontFamily:"Inter,sans-serif" }}>
                    <colgroup>
                      <col style={{ width:COL.title   }}/><col style={{ width:COL.dept    }}/>
                      <col style={{ width:COL.type    }}/><col style={{ width:COL.loc     }}/>
                      <col style={{ width:COL.apps    }}/><col style={{ width:COL.closes  }}/>
                      <col style={{ width:COL.status  }}/><col style={{ width:COL.actions }}/>
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={th(COL.title)}>Job Title</th>
                        <th style={th(COL.dept)}>Department</th>
                        <th style={th(COL.type)}>Type</th>
                        <th style={th(COL.loc)}>Location</th>
                        <th style={th(COL.apps)}>Applicants</th>
                        <th style={th(COL.closes)}>Closes</th>
                        <th style={th(COL.status)}>Status</th>
                        <th style={th(COL.actions)}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-10 text-[14px] text-[#9CA3AF]">No jobs found.</td></tr>
                      ) : filtered.map(job => {
                        /* Progress bar width = this job's count as % of the highest count in the filtered list */
                        const maxApplicants = Math.max(...filtered.map(j => j.applicants), 1);
                        const barPct = Math.round((job.applicants / maxApplicants) * 100);
                        return (
                        <tr key={job.id} className="jv-tr cursor-pointer" onClick={() => handleEdit(job.id)}>
                          <td style={td(COL.title, 14, 14)}>
                            <div className="text-[14px] font-bold text-[#1A1A2E] truncate">{job.title}</div>
                            <div className="text-[13px] text-[#9CA3AF] mt-0.5 truncate">Manager: {job.manager}</div>
                          </td>
                          <td style={td(COL.dept, 22, 22)}>
                            <span className="text-[14px] font-medium text-[#374151]">{job.department}</span>
                          </td>
                          <td style={td(COL.type, 20, 20)}>
                            <TypePill type={job.type} typeKey={job.typeKey} />
                          </td>
                          <td style={td(COL.loc, 20, 20)}>
                            <LocPill location={job.location} locationKey={job.locationKey} locationIcon={job.locationIcon} />
                          </td>
                          <td style={td(COL.apps, 19, 19)}>
                            <div className="flex flex-col gap-[5px]">
                              <span className="text-[14px] font-bold leading-[14px] text-[#1A1A2E]">{job.applicants}</span>
                              <div style={{ width:56, height:4, background:"#F0F2F5", borderRadius:3 }}>
                                <div style={{ width:`${barPct}%`, height:4, background:"#401A94", borderRadius:3, transition:"width 0.4s ease" }}/>
                              </div>
                            </div>
                          </td>
                          <td style={td(COL.closes, 22, 22)}>
                            <span className="text-[13px] font-medium text-[#9CA3AF]">{job.closes}</span>
                          </td>
                          <td style={td(COL.status, 20, 20)}>
                            <StatusBadge statusKey={job.statusKey} />
                          </td>
                          <td style={{ ...td(COL.actions, 15, 15), overflow:"visible" }}>
                            <ActionButtons
                              job={job}
                              onClose={(j) => setConfirmJob(j)}
                              onEdit={handleEdit}
                              onDelete={(j) => setDeleteJob(j)}
                              isRecruiter={isRecruiter}
                            />
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="jv-mobile">
                  {filtered.length === 0
                    ? <div className="py-8 px-4 text-center text-[#9CA3AF]">No jobs found.</div>
                    : filtered.map(job => (
                        <MobileCard
                          key={job.id} job={job}
                          onClose={(j) => setConfirmJob(j)}
                          onEdit={handleEdit}
                          onDelete={(j) => setDeleteJob(j)}
                          isRecruiter={isRecruiter}
                        />
                      ))}
                </div>

                {/* PAGINATION */}
                <div className="flex justify-between items-center px-5 py-3 border-t border-[#E8EAF0]">
                  <span className="text-[13px] text-[#8B92A5]">
                    Showing 1–{filtered.length} of {jobs.length} jobs
                  </span>
                  <div className="flex gap-1">
                    {["‹", 1, "›"].map((p, i) => (
                      <button key={i} className={`jv-pg${p === page ? " on" : ""}`}
                        onClick={() => typeof p === "number" && setPage(p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}