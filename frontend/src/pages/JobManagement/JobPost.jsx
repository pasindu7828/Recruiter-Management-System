import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/Layout";

/* ─────────────────────────────────────────
   API CONFIG
   Base URL — matches your Vite .env setup
───────────────────────────────────────── */
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION}`,
});

// Attach JWT token from localStorage on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── STEPS ─── */
const STEPS = [
  { n: 1, label: "Basic Info"    },
  { n: 2, label: "Description"  },
  { n: 3, label: "Requirements" },
  { n: 4, label: "Schedule"     },
];

/* ─────────────────────────────────────────
   COLLAPSIBLE CARD
───────────────────────────────────────── */
function Card({ iconBg, icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-[#E8EAF0] mb-4 last:mb-0 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <span className="text-[14px] font-bold text-[#1A1A2E]">{title}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B92A5" strokeWidth="2.5"
          className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-[#F0F2F5]">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-px bg-[#F0F2F5]" />
      <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.8px]">{label}</span>
      <div className="flex-1 h-px bg-[#F0F2F5]" />
    </div>
  );
}

/* ─── FORM ATOMS ─── */
function FG({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-[5px] mb-[14px] last:mb-0">
      {label && (
        <label className="text-[12px] font-semibold tracking-tight text-[#374151]">
          {label}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint  && <p className="text-[11.5px] text-[#8B92A5]">{hint}</p>}
      {error && <p className="text-[11.5px] text-red-500">{error}</p>}
    </div>
  );
}

const fieldCls = `
  w-full px-3 py-2 rounded-lg text-[13px] text-[#1A1A2E]
  bg-white border border-[#E0E3EA] outline-none transition-all
  placeholder-[#B0B5C3] font-['Inter']
  focus:border-[#401A94] focus:ring-[3px] focus:ring-[#401A94]/[.08]
`;

function FInput({ placeholder, type = "text", value, onChange, ...rest }) {
  return <input type={type} placeholder={placeholder} value={value} onChange={onChange} className={fieldCls} {...rest} />;
}

function FTextarea({ placeholder, minHeight = 90, value, onChange }) {
  return (
    <textarea placeholder={placeholder} value={value} onChange={onChange}
      className={`${fieldCls} resize-y`} style={{ minHeight }} />
  );
}

function FSelect({ children, value, onChange }) {
  return (
    <select value={value} onChange={onChange}
      className="w-full px-3 py-2 pr-8 rounded-lg text-[13px] text-[#1A1A2E] bg-white border border-[#E0E3EA] outline-none cursor-pointer appearance-none font-['Inter'] focus:border-[#401A94]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 13' fill='none'%3E%3Cpolyline points='3.25,4.88 6.5,8.13 9.75,4.88' stroke='%238B92A5' stroke-width='1.35' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "13px",
      }}>
      {children}
    </select>
  );
}

function RadioOpt({ label, name, checked, onChange }) {
  return (
    <label className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer text-[12.5px] font-medium transition-all border ${checked ? "border-[#401A94] bg-[#F5F3FF] text-[#401A94]" : "border-[#E0E3EA] bg-white text-gray-500"}`}>
      <div className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 bg-white ${checked ? "border border-[#401A94]" : "border border-[#9CA3AF]"}`}>
        {checked && <div className="w-2 h-2 rounded-full bg-[#401A94]" />}
      </div>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}

function SkillTag({ label, onRemove }) {
  return (
    <div onClick={onRemove}
      className="h-6 px-2.5 py-1 rounded-[5px] inline-flex items-center text-[12px] font-semibold cursor-pointer bg-[#EDE9FE] text-[#7C3AED] outline outline-1 outline-[#DDD6FE] outline-offset-[-1px] hover:bg-[#DDD6FE] transition-colors">
      {label} ×
    </div>
  );
}

/* ─── PUBLISH CONFIRM POPUP ─── */
function PublishPopup({ onConfirm, onCancel, jobTitle, loading }) {
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
              <p className="text-[13px] text-[#8B92A5] mt-1">You're about to publish</p>
              <div className="mt-2 px-3 py-2 bg-[#F4F5F7] rounded-lg">
                <span className="text-[13.5px] font-semibold text-[#1A1A2E]">
                  {jobTitle.trim() || "Untitled Job"}
                </span>
              </div>
              <p className="text-[13px] text-[#8B92A5] mt-3">
                This will make the vacancy live and visible to candidates immediately. You can pause or close it at any time.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onCancel} disabled={loading}
              className="h-9 px-5 rounded-lg text-[13px] font-semibold cursor-pointer bg-[#F4F5F7] border border-[#E0E3EA] text-[#374151] hover:bg-[#E8EAF0] font-['Inter'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={loading}
              className="h-9 px-5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer bg-[#401A94] text-white border-none hover:bg-[#5B2FBF] font-['Inter'] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {loading ? "Publishing…" : "Yes, Publish Job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP NAV ─── */
function StepNav({ step, onPrev, onNext }) {
  return (
    <div className="flex justify-between mt-4">
      <button type="button" onClick={onPrev} disabled={step === 1}
        className={`h-9 px-5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 border-none font-['Inter'] transition-colors
          ${step === 1 ? "bg-[#F4F5F7] text-[#9CA3AF] cursor-not-allowed" : "bg-[#F4F5F7] text-[#374151] cursor-pointer hover:bg-[#E8EAF0]"}`}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        Previous
      </button>
      <button type="button" onClick={onNext} disabled={step === 4}
        className={`h-9 px-5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 border-none font-['Inter'] transition-colors
          ${step === 4 ? "bg-[#F4F5F7] text-[#9CA3AF] cursor-not-allowed" : "bg-[#401A94] text-white cursor-pointer hover:bg-[#5B2FBF]"}`}>
        Next
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}

/* ─── ERROR BANNER ─── */
function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 p-4 mb-4 bg-red-50 border border-red-200 rounded-xl">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" className="flex-shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p className="text-[13px] text-red-700 flex-1">{message}</p>
      <button type="button" onClick={onClose} className="text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   HELPERS — build API payload from form state
───────────────────────────────────────── */

const parseCurrency = (currencyPeriod) => {
  const [cur, per] = currencyPeriod.split("/").map(s => s.trim());
  const periodMap = {
    Monthly: "Monthly",
    Annual:  "Yearly",
    Hourly:  "Hourly",
    Weekly:  "Weekly",
  };
  return {
    currency:  cur  || "LKR",
    payPeriod: periodMap[per] || "Monthly",
  };
};

const mapArrangement = (w) => {
  const map = { remote: "Remote", onsite: "On-site", hybrid: "Hybrid" };
  return map[w] || "Remote";
};

const buildPayload = (form) => {
  const { currency, payPeriod } = parseCurrency(form.currency);

  return {
    jobTitle:            form.jobTitle,
    department:          form.dept        || undefined,
    hiringManager:       form.manager     || undefined, // Correctly mapped to string!
    employmentType:      form.empType     || undefined,
    experienceLevel:     form.expLevel    || undefined,
    openings:            form.openings    ? Number(form.openings) : 1,
    workArrangement:     mapArrangement(form.work),
    location:            form.location    || undefined,
    minSalary:           form.minSalary   ? Number(form.minSalary.toString().replace(/,/g, "")) : undefined,
    maxSalary:           form.maxSalary   ? Number(form.maxSalary.toString().replace(/,/g, "")) : undefined,
    currency,
    payPeriod,
    overview:            form.overview    || undefined,
    keyResponsibilities: form.responsibilities || undefined,
    requirements:        form.requirements     || undefined,
    requiredSkills:      form.skills,
    publishDate:         form.publishDate      || undefined,
    applicationDeadline: form.deadline         || undefined,
  };
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function PostJob() {
  const navigate = useNavigate();

  /* Step */
  const [activeStep,  setActiveStep]  = useState(1);
  const [showPublish, setShowPublish] = useState(false);
  const prev = () => setActiveStep(s => Math.max(1, s - 1));
  const next = () => setActiveStep(s => Math.min(4, s + 1));

  /* UI state */
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");

  /* Form state */
  const [work,             setWork]            = useState("remote");
  const [skills,           setSkills]          = useState([]);
  const [skillInput,       setSkillInput]      = useState("");
  const [publishDate,      setPublishDate]     = useState("");
  const [deadline,         setDeadline]        = useState("");
  const [jobTitle,         setJobTitle]        = useState("");
  const [dept,             setDept]            = useState("");
  const [manager,          setManager]         = useState("");
  const [empType,          setEmpType]         = useState("Full-time");
  const [expLevel,         setExpLevel]        = useState("Senior (5+ yrs)");
  const [openings,         setOpenings]        = useState("1");
  const [location,         setLocation]        = useState("");
  const [minSalary,        setMinSalary]       = useState("");
  const [maxSalary,        setMaxSalary]       = useState("");
  const [currency,         setCurrency]        = useState("LKR / Monthly");
  const [overview,         setOverview]        = useState("");
  const [responsibilities, setResp]            = useState("");
  const [requirements,     setRequirements]    = useState("");

  /* Skills */
  const handleSkillKey = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills(p => [...p, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const removeSkill = (s) => setSkills(skills.filter(x => x !== s));

  /* Assemble form into one object for payload builder */
  const formState = {
    jobTitle, dept, manager, empType, expLevel, openings,
    work, location, minSalary, maxSalary, currency,
    overview, responsibilities, requirements, skills,
    publishDate, deadline,
  };

  /* ── SAVE AS DRAFT → POST /api/v1/jobs/draft ── */
  const handleSaveDraft = async () => {
    if (!jobTitle.trim()) {
      setApiError("Job title is required to save a draft.");
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const { data } = await API.post("/jobs/draft", buildPayload(formState));
      if (data.success) navigate("/jobs");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save draft. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── PUBLISH → POST /api/v1/jobs ── */
  const handlePublish = async () => {
    setLoading(true);
    setApiError("");
    try {
      const payload = { ...buildPayload(formState), status: "Published" };
      const { data } = await API.post("/jobs", payload);
      if (data.success) {
        setShowPublish(false);
        navigate("/jobs");
      }
    } catch (err) {
      setShowPublish(false);
      setApiError(err.response?.data?.message || "Failed to publish job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <Layout>
        {showPublish && (
          <PublishPopup
            jobTitle={jobTitle}
            loading={loading}
            onCancel={() => setShowPublish(false)}
            onConfirm={handlePublish}
          />
        )}

        <div className="min-h-screen p-6 sm:p-7 bg-[#F4F5F7] font-['Inter']">

          {/* ── PAGE HEADER ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[18px] font-bold text-[#1A1A2E]">Post a New Job</h1>
              <p className="text-[13px] text-[#8B92A5]">Fill in the details below to create a new vacancy</p>
            </div>
            {/* Header quick-action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => navigate("/jobs")}
                className="h-9 px-4 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer bg-[#F4F5F7] border border-[#E8EAF0] text-gray-500 hover:bg-[#E8EAF0] font-['Inter'] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Cancel
              </button>
              <button type="button" onClick={handleSaveDraft} disabled={loading}
                className="h-9 px-4 rounded-lg text-[13px] font-semibold cursor-pointer bg-white border border-[#401A94] text-[#401A94] hover:bg-[#F5F3FF] font-['Inter'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Saving…" : "Save as Draft"}
              </button>
              <button type="button" onClick={() => setShowPublish(true)} disabled={loading}
                className="h-9 px-4 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer bg-[#401A94] text-white border-none hover:bg-[#5B2FBF] font-['Inter'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Publish Job
              </button>
            </div>
          </div>

          {/* Error banner */}
          <ErrorBanner message={apiError} onClose={() => setApiError("")} />

          {/* ── STEP PROGRESS BAR ── */}
          <div className="flex mb-5 rounded-xl overflow-hidden bg-white border border-[#E8EAF0]">
            {STEPS.map((s, i) => {
              const isActive = activeStep === s.n;
              const isDone   = activeStep > s.n;
              return (
                <button key={s.n} type="button" onClick={() => setActiveStep(s.n)}
                  className={`
                    flex-1 flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold
                    cursor-pointer transition-colors border-none font-['Inter']
                    ${i < STEPS.length - 1 ? "border-r border-[#E8EAF0]" : ""}
                    ${isActive ? "bg-[#F5F3FF] text-[#401A94]" : "bg-[#FAFBFC] text-[#8B92A5] hover:bg-[#F4F5F7]"}
                  `}>
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                    text-[11px] font-bold border-2 transition-all
                    ${isActive ? "bg-[#401A94] border-[#401A94] text-white"
                      : isDone  ? "bg-[#059669] border-[#059669] text-white"
                      :           "bg-transparent border-[#8B92A5] text-[#8B92A5]"}
                  `}>
                    {isDone
                      ? <svg width="9" height="9" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : s.n}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── MAIN LAYOUT ── */}
          <div className="flex flex-col lg:flex-row gap-4 items-start">

            {/* ════ LEFT: STEP CONTENT ════ */}
            <div className="flex-1 min-w-0">

              {/* ══ STEP 1 — Basic Info + Compensation ══ */}
              {activeStep === 1 && (
                <>
                  <Card iconBg="bg-[#EFF6FF]" title="Basic Information"
                    icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>}>

                    <FG label="Job Title" required hint="Use a clear, specific job title candidates would search for">
                      <FInput placeholder="e.g. Senior Frontend Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                    </FG>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <FG label="Department" required>
                        <FSelect value={dept} onChange={e => setDept(e.target.value)}>
                          <option value="">Select department</option>
                          <option>Engineering</option>
                          <option>Design</option>
                          <option>Marketing</option>
                          <option>Finance</option>
                          <option>Operations</option>
                        </FSelect>
                      </FG>
                      <FG label="Hiring Manager">
                        <FInput
                          placeholder="e.g. Tharaka Silva"
                          value={manager}
                          onChange={e => setManager(e.target.value)}
                        />
                      </FG>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <FG label="Employment Type" required>
                        <FSelect value={empType} onChange={e => setEmpType(e.target.value)}>
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                        </FSelect>
                      </FG>
                      <FG label="Experience Level">
                        <FSelect value={expLevel} onChange={e => setExpLevel(e.target.value)}>
                          <option>Entry (0–2 yrs)</option>
                          <option>Mid (2–5 yrs)</option>
                          <option>Senior (5+ yrs)</option>
                          <option>Lead</option>
                        </FSelect>
                      </FG>
                      <FG label="No. of Openings">
                        <FInput type="number" value={openings} onChange={e => setOpenings(e.target.value)} min="1" />
                      </FG>
                    </div>

                    <FG label="Work Arrangement" required>
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <RadioOpt label="🌐 Remote"  name="work" checked={work === "remote"} onChange={() => setWork("remote")} />
                        <RadioOpt label="🏢 On-site" name="work" checked={work === "onsite"} onChange={() => setWork("onsite")} />
                        <RadioOpt label="⚡ Hybrid"  name="work" checked={work === "hybrid"} onChange={() => setWork("hybrid")} />
                      </div>
                    </FG>

                    <FG label="Location">
                      <FInput placeholder="e.g. Colombo, Sri Lanka (leave blank if fully remote)" value={location} onChange={e => setLocation(e.target.value)} />
                    </FG>

                    <Divider label="Compensation" />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <FG label="Min Salary">
                        <FInput placeholder="80,000" type="number" value={minSalary} onChange={e => setMinSalary(e.target.value)} />
                      </FG>
                      <FG label="Max Salary">
                        <FInput placeholder="120,000" type="number" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} />
                      </FG>
                      <FG label="Currency / Period">
                        <FSelect value={currency} onChange={e => setCurrency(e.target.value)}>
                          <option>LKR / Monthly</option>
                          <option>USD / Monthly</option>
                          <option>USD / Annual</option>
                        </FSelect>
                      </FG>
                    </div>
                  </Card>
                  <StepNav step={activeStep} onPrev={prev} onNext={next} />
                </>
              )}

              {/* ══ STEP 2 — Job Description ══ */}
              {activeStep === 2 && (
                <>
                  <Card iconBg="bg-[#FFF7ED]" title="Job Description"
                    icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#EA580C" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}>
                    <FG label="Role Overview" required>
                      <FTextarea placeholder="Brief description of the role and what the team does…" minHeight={80} value={overview} onChange={e => setOverview(e.target.value)} />
                    </FG>
                    <FG label="Key Responsibilities" required hint="Add each responsibility on a new line">
                      <FTextarea placeholder={"• Responsibility one\n• Responsibility two\n• Responsibility three"} minHeight={110} value={responsibilities} onChange={e => setResp(e.target.value)} />
                    </FG>
                  </Card>
                  <StepNav step={activeStep} onPrev={prev} onNext={next} />
                </>
              )}

              {/* ══ STEP 3 — Requirements + Skills ══ */}
              {activeStep === 3 && (
                <>
                  <Card iconBg="bg-[#F0FDF4]" title="Requirements"
                    icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}>
                    <FG label="Requirements & Qualifications" required hint="Add each requirement on a new line">
                      <FTextarea placeholder={"• Required qualification one\n• Required qualification two"} minHeight={130} value={requirements} onChange={e => setRequirements(e.target.value)} />
                    </FG>
                  </Card>

                  <Card iconBg="bg-[#F5F3FF]" title="Required Skills"
                    icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#7C3AED" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}>
                    <FG label="Add skills (press Enter to add)">
                      <FInput
                        placeholder="e.g. React.js, TypeScript, REST APIs…"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKey}
                      />
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {skills.map(s => <SkillTag key={s} label={s} onRemove={() => removeSkill(s)} />)}
                        </div>
                      )}
                    </FG>
                  </Card>
                  <StepNav step={activeStep} onPrev={prev} onNext={next} />
                </>
              )}

              {/* ══ STEP 4 — Schedule ══ */}
              {activeStep === 4 && (
                <>
                  <Card iconBg="bg-[#FEF2F2]" title="Posting Schedule"
                    icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#F87171" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <FG label="Publish Date" required>
                        <FInput type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} />
                      </FG>
                      <FG label="Application Deadline" required>
                        <FInput type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                      </FG>
                    </div>
                  </Card>

                  <div className="flex justify-between mt-4">
                    <button type="button" onClick={prev}
                      className="h-9 px-5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 border-none bg-[#F4F5F7] text-[#374151] cursor-pointer hover:bg-[#E8EAF0] font-['Inter'] transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                      Previous
                    </button>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleSaveDraft} disabled={loading}
                        className="h-9 px-4 rounded-lg text-[13px] font-semibold cursor-pointer bg-white border border-[#401A94] text-[#401A94] hover:bg-[#F5F3FF] font-['Inter'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Saving…" : "Save as Draft"}
                      </button>
                      <button type="button" onClick={() => setShowPublish(true)} disabled={loading}
                        className="h-9 px-5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 border-none bg-[#401A94] text-white cursor-pointer hover:bg-[#5B2FBF] font-['Inter'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Publish Job
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ════ RIGHT SIDEBAR ════ */}
            <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-3.5">
              <div className="rounded-xl p-5 flex flex-col gap-3.5 bg-[#FFFBEB] border border-[#FDE68A]">
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span className="text-[12.5px] font-bold text-[#D97706]">Tips for Better Results</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {[
                    "Use specific job titles for better reach",
                    "List 5–8 key responsibilities",
                    "Add a salary range to attract more applicants",
                    "Set a clear closing date",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[12px] text-[#92400E]">
                      <span className="text-[#D97706] flex-shrink-0">→</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}