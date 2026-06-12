import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";

/* ─── SELECT ARROW ─── */
const SEL_ARROW = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238B92A5' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat:   "no-repeat",
  backgroundPosition: "right 10px center",
  backgroundSize:     "13px",
  paddingRight:       30,
};

/* ─── SHARED FIELD CLASSES ─── */
const fieldBase = `w-full px-3 py-2 rounded-lg text-[13px] text-[#1A1A2E] outline-none transition-all bg-[#FAFBFC] border font-['Inter'] placeholder-[#9CA3AF]`;
const fieldFocus = `border-[#401A94] bg-white ring-[3px] ring-[#401A94]/[.08]`;
const fieldBlur  = `border-[#E0E3EA]`;

/* ─── SECTION DIVIDER ─── */
function Divider({ label }) {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-px bg-[#F0F2F5]" />
      <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.8px]">{label}</span>
      <div className="flex-1 h-px bg-[#F0F2F5]" />
    </div>
  );
}

/* ─────────────────────────────────────────
   ATOMS
───────────────────────────────────────── */
function Card({ children, nomb }) {
  return (
    <div className={`bg-white rounded-xl p-5 border border-[#E8EAF0] ${nomb ? "" : "mb-4 last:mb-0"}`}>
      {children}
    </div>
  );
}

function CardTitle({ iconBg, iconColor, iconPaths, children }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#F0F2F5]">
      <div className={`w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth="2">
          {iconPaths}
        </svg>
      </div>
      <span className="text-[13.5px] font-bold text-[#1A1A2E]">{children}</span>
    </div>
  );
}

function FLabel({ label }) {
  return label
    ? <label className="text-[12px] font-semibold block mb-[5px] text-[#374151]">{label}</label>
    : null;
}

function FInput({ label, value, onChange, type = "text", placeholder, min }) {
  const [f, setF] = useState(false);
  return (
    <div className="mb-3.5 last:mb-0">
      <FLabel label={label} />
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} min={min}
        className={`${fieldBase} ${f ? fieldFocus : fieldBlur}`}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
      />
    </div>
  );
}

function FSelect({ label, value, onChange, children }) {
  const [f, setF] = useState(false);
  return (
    <div className="mb-3.5 last:mb-0">
      <FLabel label={label} />
      <select
        value={value} onChange={onChange}
        className={`${fieldBase} cursor-pointer appearance-none ${f ? fieldFocus : fieldBlur}`}
        style={SEL_ARROW}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
      >
        {children}
      </select>
    </div>
  );
}

function FTextarea({ label, value, onChange, minH = 90 }) {
  const [f, setF] = useState(false);
  return (
    <div className="mb-3.5 last:mb-0">
      <FLabel label={label} />
      <textarea
        value={value} onChange={onChange}
        className={`${fieldBase} resize-y ${f ? fieldFocus : fieldBlur}`}
        style={{ minHeight: minH }}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
      />
    </div>
  );
}

function Tag({ label, onRemove }) {
  return (
    <span onClick={onRemove}
      className="inline-flex items-center px-2.5 py-1 rounded-[5px] text-[12px] font-semibold cursor-pointer transition-colors bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] hover:bg-[#EDE9FE]">
      {label} ×
    </span>
  );
}

function InfoRow({ k, v }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#F0F2F5] last:border-b-0 text-[12.5px]">
      <span className="text-[#8B92A5] font-medium">{k}</span>
      <span className="text-[#1A1A2E] font-semibold">{v}</span>
    </div>
  );
}

/* ─── PUBLISH DRAFT POPUP ─── */
function PublishPopup({ jobTitle, department, onConfirm, onCancel, isPublishing }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="h-1 w-full bg-[#401A94] rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#F5F3FF] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#401A94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1A1A2E]">Publish this job?</h3>
              <p className="text-[13px] text-[#8B92A5] mt-1">You're about to make this draft live</p>
              <div className="mt-2 px-3 py-2 bg-[#F4F5F7] rounded-lg">
                <span className="text-[13.5px] font-semibold text-[#1A1A2E]">{jobTitle || "Untitled Job"}</span>
                <span className="text-[12px] text-[#9CA3AF] ml-2">{department}</span>
              </div>
              <p className="text-[13px] text-[#8B92A5] mt-3">
                This will immediately publish the vacancy to the board, allowing candidates to view it and apply.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onCancel}
              disabled={isPublishing}
              className="h-9 px-5 bg-[#F4F5F7] border border-[#E0E3EA] rounded-[9px] text-[13px] font-semibold text-[#374151] cursor-pointer hover:bg-[#E8EAF0] transition-colors font-['Inter'] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPublishing}
              className="h-9 px-5 bg-[#401A94] rounded-[9px] text-[13px] font-semibold text-white cursor-pointer hover:bg-[#5B2FBF] transition-colors border-none font-['Inter'] disabled:opacity-50 flex items-center gap-1.5"
            >
              {isPublishing
                ? <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Publishing…</>
                : "Yes, Publish Job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CLOSE VACANCY POPUP ─── */
function ClosePopup({ jobTitle, department, onConfirm, onCancel, isClosing }) {
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
                <span className="text-[13.5px] font-semibold text-[#1A1A2E]">{jobTitle || "Untitled Job"}</span>
                <span className="text-[12px] text-[#9CA3AF] ml-2">{department}</span>
              </div>
              <p className="text-[13px] text-[#8B92A5] mt-3">
                This will stop new applications from being accepted. Existing applicants won't be affected.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onCancel}
              disabled={isClosing}
              className="h-9 px-5 bg-[#F4F5F7] border border-[#E0E3EA] rounded-[9px] text-[13px] font-semibold text-[#374151] cursor-pointer hover:bg-[#E8EAF0] transition-colors font-['Inter'] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isClosing}
              className="h-9 px-5 bg-[#DC2626] rounded-[9px] text-[13px] font-semibold text-white cursor-pointer hover:bg-red-700 transition-colors border-none font-['Inter'] disabled:opacity-50"
            >
              {isClosing ? "Closing..." : "Yes, Close Vacancy"}
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
export default function JobDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null); 

  // Form States
  const [title,        setTitle]        = useState("");
  const [dept,         setDept]         = useState("Engineering");
  const [empType,      setEmpType]      = useState("Full-time");
  const [arrangement,  setArrangement]  = useState("Remote");
  const [manager,      setManager]      = useState("");
  const [openings,     setOpenings]     = useState("1");
  const [minSalary,    setMinSalary]    = useState("");
  const [maxSalary,    setMaxSalary]    = useState("");
  const [currency,     setCurrency]     = useState("LKR / Monthly");
  const [overview,     setOverview]     = useState("");
  const [resp,         setResp]         = useState("");
  const [requirements, setRequirements] = useState("");
  const [deadline,     setDeadline]     = useState("");
  const [skills,       setSkills]       = useState([]);
  const [status,       setStatus]       = useState("Published");
  const [publishDate,  setPublishDate]  = useState("");
  
  const [skillInput,   setSkillInput]   = useState("");
  const [dirty,        setDirty]        = useState(false);
  const [skillFocus,   setSkillFocus]   = useState(false);
  
  // Popup Controls
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [showPublishPopup, setShowPublishPopup] = useState(false); 

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION}`;
  const token = localStorage.getItem("token");

  // Format Helpers
  const formatArrayForTextarea = (arr) => Array.isArray(arr) ? arr.join('\n') : (arr || "");
  const formatDateForInput = (isoString) => isoString ? new Date(isoString).toISOString().split('T')[0] : "";

  // 1. Fetch Job Data on Mount
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/jobs/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.job) {
          const job = data.job;
          setOriginalData(job);
          populateStates(job);
        } else {
          console.error("Failed to load job details:", data.message);
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id, API_URL, token]);

  const populateStates = (job) => {
    setTitle(job.jobTitle || "");
    setDept(job.department || "Engineering");
    setEmpType(job.employmentType || "Full-time");
    setArrangement(job.workArrangement || "Remote");
    setManager(job.hiringManager?.name || job.hiringManager || "");
    setOpenings(job.openings?.toString() || "1");
    setMinSalary(job.minSalary?.toString() || "");
    setMaxSalary(job.maxSalary?.toString() || "");
    setCurrency(job.currency || "LKR / Monthly");
    setOverview(job.overview || "");
    setResp(formatArrayForTextarea(job.keyResponsibilities));
    setRequirements(formatArrayForTextarea(job.requirements));
    setDeadline(formatDateForInput(job.applicationDeadline));
    setSkills(job.requiredSkills || []);
    setStatus(job.status || "Published");
    setPublishDate(job.publishDate);
    setDirty(false);
  };

  // 2. Save Changes (Updates current status without changing it)
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        jobTitle: title,
        department: dept,
        employmentType: empType,
        workArrangement: arrangement,
        hiringManager: manager || undefined, // Correctly mapped to string!
        openings: Number(openings),
        minSalary: minSalary ? Number(minSalary) : undefined,
        maxSalary: maxSalary ? Number(maxSalary) : undefined,
        currency,
        overview,
        keyResponsibilities: resp, 
        requirements,
        applicationDeadline: deadline,
        requiredSkills: skills,
      };

      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        navigate("/jobs");
      } else {
        alert("Failed to save: " + data.message);
      }
    } catch (err) {
      console.error("Error saving job:", err);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // 3. Confirm Publish Draft (Triggered from Custom Popup)
  const confirmPublishDraft = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/jobs/publish/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          jobTitle: title,
          department: dept,
          employmentType: empType,
          workArrangement: arrangement,
          hiringManager: manager || undefined, // Correctly mapped to string!
          openings: Number(openings),
          minSalary: minSalary ? Number(minSalary) : undefined,
          maxSalary: maxSalary ? Number(maxSalary) : undefined,
          currency,
          overview,
          keyResponsibilities: resp, 
          requirements,
          applicationDeadline: deadline,
          requiredSkills: skills,
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowPublishPopup(false);
        navigate("/jobs");
      } else {
        alert("Failed to publish draft: " + data.message);
      }
    } catch (err) {
      console.error("Error publishing job:", err);
      alert("An error occurred while publishing the draft.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Confirm Close Vacancy (Triggered from Custom Popup)
  const confirmCloseVacancy = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Closed" })
      });

      const data = await response.json();
      if (data.success) {
        setShowClosePopup(false);
        navigate("/jobs");
      } else {
        alert("Failed to close vacancy: " + data.message);
      }
    } catch (err) {
      console.error("Error closing job:", err);
      alert("An error occurred while closing the vacancy.");
    } finally {
      setSaving(false);
    }
  };

  // Quick State Setters
  const md = setter => e => { setter(e.target.value); setDirty(true); };

  const addSkill = e => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills(p => [...p, skillInput.trim()]);
      setSkillInput(""); setDirty(true);
    }
  };

  const removeSkill = s => { setSkills(p => p.filter(x => x !== s)); setDirty(true); };
  
  // 5. Discard & Navigate Away
  const handleDiscard = () => {
    if (dirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        navigate("/jobs");
      }
    } else {
      navigate("/jobs");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
          <span className="text-[#8B92A5] font-medium">Loading job details...</span>
        </div>
      </Layout>
    );
  }

  // Calculate Days Active for Sidebar
  const calculateDaysActive = () => {
    if (!publishDate || status === "Draft") return "N/A";
    const start = new Date(publishDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + " days";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .jd { font-family: 'Inter', sans-serif; }
        
        @keyframes spin{to{transform:rotate(360deg)}}
        .animate-spin{animation:spin 0.8s linear infinite}
      `}</style>

      {/* Conditionally render the Custom Popups */}
      {showClosePopup && (
        <ClosePopup
          jobTitle={title}
          department={dept}
          isClosing={saving}
          onConfirm={confirmCloseVacancy}
          onCancel={() => setShowClosePopup(false)}
        />
      )}
      
      {showPublishPopup && (
        <PublishPopup
          jobTitle={title}
          department={dept}
          isPublishing={saving}
          onConfirm={confirmPublishDraft}
          onCancel={() => setShowPublishPopup(false)}
        />
      )}

      <Layout>
        <div className="jd min-h-screen flex flex-col bg-[#F4F5F7]">
          <div className="flex-1 p-5 sm:p-7 pb-24">

            {/* ── BANNER ── */}
            <div className="rounded-2xl p-5 sm:p-6 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white"
              style={{ background: "linear-gradient(120deg,#401A94,#6C3FD4)" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[20px] font-extrabold tracking-tight">{title || "Untitled Job"}</div>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {[`📁 ${dept}`, `🌐 ${arrangement}`, `⏱ ${empType}`].map((c, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-[5px] text-[12px] font-medium"
                        style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                        {c}
                      </span>
                    ))}
                    
                    {/* Status Badge Rendering */}
                    {status === "Published" && (
                      <span className="px-2.5 py-0.5 rounded-[5px] text-[12px] font-semibold text-[#86EFAC]"
                        style={{ background: "rgba(34,197,94,0.13)", border: "1px solid rgba(34,197,94,0.3)" }}>
                        ● Active
                      </span>
                    )}
                    {status === "Draft" && (
                      <span className="px-2.5 py-0.5 rounded-[5px] text-[12px] font-semibold text-[#FCD34D]"
                        style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                        ● Draft
                      </span>
                    )}
                    {status === "Closed" && (
                      <span className="px-2.5 py-0.5 rounded-[5px] text-[12px] font-semibold text-[#CBD5E1]"
                        style={{ background: "rgba(203,213,225,0.15)", border: "1px solid rgba(203,213,225,0.3)" }}>
                        ● Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* Conditional Top Action Button */}
                {status === "Draft" ? (
                  <button 
                    onClick={() => setShowPublishPopup(true)} 
                    disabled={saving}
                    className="h-[34px] px-5 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-colors text-[#401A94] bg-white hover:bg-[#F5F3FF] font-['Inter'] shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Publish Job
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowClosePopup(true)} 
                    disabled={saving || status === "Closed"}
                    className="h-[34px] px-4 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-colors bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2] font-['Inter'] disabled:opacity-50"
                  >
                    {status === "Closed" ? "Vacancy Closed" : "Close Vacancy"}
                  </button>
                )}
                
              </div>
            </div>

            {/* ── TWO-COL LAYOUT ── */}
            <div className="flex flex-col lg:flex-row gap-4 items-start">

              {/* ════ LEFT ════ */}
              <div className="flex-1 min-w-0">

                {/* Basic Info */}
                <Card>
                  <CardTitle iconBg="bg-[#EFF6FF]" iconColor="#2563EB"
                    iconPaths={<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>}>
                    Basic Information
                  </CardTitle>

                  <FInput label="Job Title" value={title} onChange={md(setTitle)} />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <FSelect label="Department" value={dept} onChange={md(setDept)}>
                      <option>Engineering</option><option>Design</option>
                      <option>Marketing</option><option>Finance</option><option>Operations</option>
                    </FSelect>
                    <FSelect label="Employment Type" value={empType} onChange={md(setEmpType)}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </FSelect>
                    <FSelect label="Work Arrangement" value={arrangement} onChange={md(setArrangement)}>
                      <option>Remote</option><option>On-site</option><option>Hybrid</option>
                    </FSelect>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                    <FInput
                      label="Hiring Manager"
                      placeholder="e.g. Tharaka Silva"
                      value={manager}
                      onChange={md(setManager)}
                    />
                    <FInput label="No. of Openings" type="number" value={openings} onChange={md(setOpenings)} min="1" />
                  </div>

                  {/* ── Compensation ── */}
                  <Divider label="Compensation" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <FInput label="Min Salary" placeholder="80000" type="number" value={minSalary} onChange={md(setMinSalary)} />
                    <FInput label="Max Salary" placeholder="120000" type="number" value={maxSalary} onChange={md(setMaxSalary)} />
                    <FSelect label="Currency / Period" value={currency} onChange={md(setCurrency)}>
                      <option>LKR / Monthly</option>
                      <option>USD / Monthly</option>
                      <option>USD / Annual</option>
                    </FSelect>
                  </div>
                </Card>

                {/* Job Description */}
                <Card>
                  <CardTitle iconBg="bg-[#FFF7ED]" iconColor="#EA580C"
                    iconPaths={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}>
                    Job Description
                  </CardTitle>
                  <FTextarea label="Role Overview"        value={overview}      onChange={md(setOverview)}      minH={76}  />
                  <FTextarea label="Key Responsibilities" value={resp}          onChange={md(setResp)}          minH={110} />
                  <FTextarea label="Requirements"         value={requirements}  onChange={md(setRequirements)}  minH={100} />
                </Card>

                {/* Skills */}
                <Card>
                  <CardTitle iconBg="bg-[#F5F3FF]" iconColor="#7C3AED"
                    iconPaths={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>}>
                    Required Skills
                  </CardTitle>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skills.map(s => <Tag key={s} label={s} onRemove={() => removeSkill(s)} />)}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter…"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    className={`${fieldBase} ${skillFocus ? fieldFocus : fieldBlur}`}
                    onFocus={() => setSkillFocus(true)}
                    onBlur={() => setSkillFocus(false)}
                  />
                </Card>
              </div>

              {/* ════ RIGHT SIDEBAR ════ */}
              <div className="w-full lg:w-[290px] flex-shrink-0 flex flex-col gap-4">
                <Card nomb>
                  <CardTitle iconBg="bg-[#FFF7ED]" iconColor="#F59E0B"
                    iconPaths={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}>
                    Posting Details
                  </CardTitle>
                  <FInput label="Application Deadline" type="date" value={deadline} onChange={md(setDeadline)} />
                  <InfoRow k="Posted"      v={status === "Draft" ? "Draft" : publishDate ? new Date(publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"} />
                  <InfoRow k="Days Active" v={calculateDaysActive()} />
                  <InfoRow k="Status"      v={status} />
                  <InfoRow k="Openings"    v={`${openings} positions`} />
                </Card>
              </div>
            </div>
          </div>

          {/* ── STICKY SAVE BAR ── */}
          <div className="fixed bottom-0 left-0 right-0 sm:left-64 z-40 flex items-center justify-between px-5 sm:px-7 py-3 bg-white border-t border-[#E8EAF0] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {dirty ? (
              <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#D97706]">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                You have unsaved changes
              </div>
            ) : (
              <div className="text-[12.5px] text-[#8B92A5]">All changes saved</div>
            )}
            <div className="flex gap-2">
              <button onClick={handleDiscard} disabled={saving}
                className="h-9 px-4 rounded-lg text-[13px] font-semibold cursor-pointer transition-colors bg-[#F4F5F7] text-[#646B75] border border-[#E8EAF0] hover:bg-[#E8EAF0] font-['Inter'] disabled:opacity-50">
                Discard
              </button>
              <button onClick={handleSave} disabled={!dirty || saving}
                className={`h-9 px-4 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors border-none font-['Inter'] ${
                  !dirty ? "bg-[#E0E3EA] text-[#8B92A5]" : "bg-[#401A94] text-white hover:bg-[#5B2FBF]"
                }`}>
                {saving ? "Saving..." : (
                  <>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}