import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { getCurrentUserRole } from "../../services/roleService";
import {
  getMyJobs,
  getApplicationsForMyJobs,
  getMyInterviews,
  updateApplicationStatus,
} from "../../services/managerService";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const fmtDateTime = (date, time) => {
  const d = fmtDate(date);
  return time ? `${d}  ${time}` : d;
};

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-pink-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
];
const avatarColor = (name = "") => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

// Maps application status → pipeline column key
const STATUS_MAP = {
  Applied: "Applied",
  Screening: "Screening",
  "Interview Scheduled": "Interview",
  Interviewed: "Interview",
  Offered: "Offer",
};

const PIPELINE_COLS = [
  { key: "Applied", label: "Applied", dot: "bg-slate-400" },
  { key: "Screening", label: "Screening", dot: "bg-sky-500" },
  { key: "Interview", label: "Interview", dot: "bg-amber-500" },
  { key: "Offer", label: "Offer", dot: "bg-violet-500" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon, delta, deltaPositive, color }) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-slate-800">{value ?? "—"}</p>
        {delta !== undefined && (
          <p
            className={`mt-2 flex items-center gap-1 text-xs font-semibold ${deltaPositive ? "text-emerald-500" : "text-rose-500"}`}
          >
            <span>{deltaPositive ? "▲" : "▼"}</span>
            {Math.abs(delta)} this month
          </p>
        )}
      </div>
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${color}`}
      >
        {icon}
      </span>
    </div>
  );
}

function Avatar({ name, size = "md" }) {
  const sz = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${sz} ${avatarColor(name)}`}
    >
      {initials(name)}
    </span>
  );
}

function StatusBadge({ status }) {
  const variants = {
    Applied: "bg-slate-100 text-slate-600",
    Screening: "bg-sky-50 text-sky-600",
    "Interview Scheduled": "bg-amber-50 text-amber-600",
    Interviewed: "bg-purple-50 text-purple-600",
    Offered: "bg-emerald-50 text-emerald-600",
    Rejected: "bg-rose-50 text-rose-600",
    pending: "bg-amber-50 text-amber-600",
    confirmed: "bg-emerald-50 text-emerald-600",
    rejected: "bg-rose-50 text-rose-600",
  };
  const label =
    {
      "Interview Scheduled": "Interview",
      Rejected: "Rejected",
      pending: "Pending",
      confirmed: "Confirmed",
      rejected: "Rejected",
    }[status] ?? status;

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {label}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}

function CandidateReviewModal({
  isOpen,
  application,
  interview,
  onClose,
  onUpdateStatus,
  actionLoading,
}) {
  if (!isOpen || !application) return null;

  const candidateName = application.userId?.name ?? "Unknown";
  const candidateEmail = application.userId?.email ?? "—";
  const candidatePhone = application.userId?.phone ?? "—";
  const jobTitle = application.jobPostId?.topic ?? "—";
  const appliedDate = fmtDate(application.createdAt);

  const interviewerName =
    interview?.interviewerId?.name ??
    interview?.interviewerName ??
    interview?.interviewer?.name ??
    "—";
  const interviewDateTime = interview
    ? fmtDateTime(interview.scheduled_date, interview.scheduled_time)
    : "—";
  const interviewType = interview?.interviewType
    ? interview.interviewType === "online"
      ? "Online"
      : "In-Person"
    : "—";
  const feedbackText = interview?.feedback ?? interview?.notes ?? "No feedback provided yet.";
  const recommendation =
    interview?.recommendation ?? interview?.decision ?? interview?.result ?? "—";
  const rating = interview?.rating ?? "—";

  const isOffered = application.status === "Offered";
  const isRejected = application.status === "Rejected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Candidate Review</h3>
            <p className="mt-1 text-sm text-slate-500">
              Review candidate details and interviewer feedback before final decision.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close review popup"
            title="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Candidate Details</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow label="Candidate Name" value={candidateName} />
              <DetailRow label="Email" value={candidateEmail} />
              <DetailRow label="Phone" value={candidatePhone} />
              <DetailRow label="Job Title" value={jobTitle} />
              <DetailRow label="Applied Date" value={appliedDate} />
              <DetailRow label="Current Status" value={application.status} />
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Interviewer Feedback</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow label="Interviewer" value={interviewerName} />
              <DetailRow label="Interview Date & Time" value={interviewDateTime} />
              <DetailRow label="Interview Type" value={interviewType} />
              <DetailRow label="Recommendation" value={recommendation} />
              <DetailRow label="Rating" value={String(rating)} />
            </div>
            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Feedback Notes
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{feedbackText}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={() => onUpdateStatus("Rejected")}
            disabled={actionLoading || isRejected}
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading ? "Updating..." : isRejected ? "Already Not Hired" : "Not Hired"}
          </button>
          <button
            onClick={() => onUpdateStatus("Offered")}
            disabled={actionLoading || isOffered}
            className="rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading ? "Updating..." : isOffered ? "Already Hired" : "Hired"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──── Charts (pure SVG/CSS) ──────────────────────────────────────────────────

function BarChart({ data }) {
  const normalizedData = data.map((d) => ({
    ...d,
    value: Number(d.value) || 0,
  }));

  const max = Math.max(...normalizedData.map((d) => d.value), 1);

  // Fixed dimensions — bars are always the same width regardless of count
  const BAR_W = 36;
  const BAR_GAP = 20;
  const CHART_H = 130;
  const PAD = { top: 20, right: 12, bottom: 40, left: 32 };

  const innerW = normalizedData.length * (BAR_W + BAR_GAP) - BAR_GAP;
  const totalW = PAD.left + innerW + PAD.right;
  const totalH = PAD.top + CHART_H + PAD.bottom;

  const yTicks = [0, Math.ceil(max / 2), max].filter(
    (v, i, arr) => arr.indexOf(v) === i,
  );
  const yOf = (v) => PAD.top + CHART_H - (v / max) * CHART_H;
  const xOf = (i) => PAD.left + i * (BAR_W + BAR_GAP);

  return (
    // Outer div scrolls horizontally when there are many bars
    <div className="w-full overflow-x-auto">
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{ display: "block", minWidth: `${totalW}px` }}
      >
        {/* Y-axis grid lines + labels */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              y1={yOf(t)}
              x2={PAD.left + innerW}
              y2={yOf(t)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 6}
              y={yOf(t) + 4}
              textAnchor="end"
              fontSize="9"
              fill="#94a3b8"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + CHART_H}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        <line
          x1={PAD.left}
          y1={PAD.top + CHART_H}
          x2={PAD.left + innerW}
          y2={PAD.top + CHART_H}
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        {/* Bars */}
        {normalizedData.map((d, i) => {
          const barH = Math.max((d.value / max) * CHART_H, 4);
          const x = xOf(i);
          const y = PAD.top + CHART_H - barH;

          // Truncate label to ~8 chars so it fits under the bar
          const shortLabel =
            d.label.length > 8 ? `${d.label.substring(0, 8)}…` : d.label;

          return (
            <g key={`${d.label}-${i}`}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={barH}
                rx="5"
                fill="#411B94"
                opacity="0.87"
              >
                <title>{`${d.label}: ${d.value} candidates`}</title>
              </rect>

              {/* Value label above bar */}
              <text
                x={x + BAR_W / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="9"
                fill="#411B94"
                fontWeight="700"
              >
                {d.value}
              </text>

              {/* X-axis label — rotated so it never overlaps neighbours */}
              <text
                x={x + BAR_W / 2}
                y={PAD.top + CHART_H + 14}
                textAnchor="end"
                fontSize="9"
                fill="#64748b"
                transform={`rotate(-35, ${x + BAR_W / 2}, ${PAD.top + CHART_H + 14})`}
              >
                {shortLabel}
              </text>
            </g>
          );
        })}

        {/* Y-axis title */}
        <text
          x={10}
          y={PAD.top + CHART_H / 2}
          textAnchor="middle"
          fontSize="8"
          fill="#94a3b8"
          transform={`rotate(-90, 10, ${PAD.top + CHART_H / 2})`}
        >
          Candidates
        </text>
      </svg>
    </div>
  );
}

function DonutChart({ hired, inProcess, rejected }) {
  const total = hired + inProcess + rejected || 1;
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;

  const segments = [
    { value: hired, color: "#10b981", label: "Hired" },
    { value: inProcess, color: "#f59e0b", label: "In Process" },
    { value: rejected, color: "#ef4444", label: "Rejected" },
  ];

  let offset = 0;
  const arcs = segments.map((s) => {
    const dash = (s.value / total) * circ;
    const arc = { ...s, dash, offset };
    offset += dash;
    return arc;
  });

  const pct = (v) => Math.round((v / total) * 100) + "%";

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="18"
        />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth="18"
            strokeDasharray={`${a.dash} ${circ - a.dash}`}
            strokeDashoffset={-a.offset + circ * 0.25}
            strokeLinecap="round"
          />
        ))}
        <text
          x={cx}
          y={cy - 3}
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="#0f172a"
        >
          {hired}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize="9"
          fill="#64748b"
        >
          Hired
        </text>
      </svg>
      <div className="w-full space-y-2">
        {segments.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-slate-600">{s.label}</span>
            </div>
            <span className="font-semibold text-slate-700">
              {pct(s.value)} ({s.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ months, hires, interviews }) {
  const allVals = [...hires, ...interviews, 0];
  const maxV = Math.max(...allVals, 1);
  const W = 340;
  const H = 120;
  const pad = { t: 10, r: 10, b: 30, l: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const n = months.length;

  const xOf = (i) => pad.l + (i / (n - 1)) * innerW;
  const yOf = (v) => pad.t + innerH - (v / maxV) * innerH;

  const polyline = (arr) => arr.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");

  const yticks = [0, Math.round(maxV / 2), maxV].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Y grid */}
      {yticks.map((v) => (
        <g key={v}>
          <line
            x1={pad.l}
            y1={yOf(v)}
            x2={W - pad.r}
            y2={yOf(v)}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <text
            x={pad.l - 4}
            y={yOf(v) + 4}
            textAnchor="end"
            fontSize="8"
            fill="#94a3b8"
          >
            {v}
          </text>
        </g>
      ))}
      {/* Lines */}
      <polyline
        points={polyline(hires)}
        fill="none"
        stroke="#411B94"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={polyline(interviews)}
        fill="none"
        stroke="#a855f7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="5 3"
      />
      {/* Dots */}
      {hires.map((v, i) => (
        <circle key={i} cx={xOf(i)} cy={yOf(v)} r="3" fill="#411B94" />
      ))}
      {interviews.map((v, i) => (
        <circle key={i} cx={xOf(i)} cy={yOf(v)} r="3" fill="#a855f7" />
      ))}
      {/* X labels */}
      {months.map((m, i) => (
        <text
          key={m}
          x={xOf(i)}
          y={H - 4}
          textAnchor="middle"
          fontSize="8"
          fill="#94a3b8"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RecruiterManagerDashboard() {
  const currentRole = getCurrentUserRole();
  const isRecruiterManager =
    currentRole === "recruiter" || currentRole === "manager";

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusActionLoading, setStatusActionLoading] = useState(false);

  useEffect(() => {
    if (!isRecruiterManager) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [jobsRes, appsRes, intRes] = await Promise.all([
          getMyJobs(),
          getApplicationsForMyJobs(),
          getMyInterviews(),
        ]);
        setJobs(jobsRes.jobs ?? []);
        setApplications(appsRes.applications ?? []);
        setInterviews(intRes.interviews ?? []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isRecruiterManager]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const openPositions = useMemo(
    () =>
      jobs.filter((j) => !j.endDate || new Date(j.endDate) >= new Date())
        .length,
    [jobs],
  );
  const totalCandidates = applications.length;
  const scheduledInterviews = useMemo(
    () => interviews.filter((i) => i.status !== "rejected").length,
    [interviews],
  );
  const positionsFilled = useMemo(
    () => applications.filter((a) => a.status === "Offered").length,
    [applications],
  );

  // ── Pipeline ───────────────────────────────────────────────────────────────
  const pipeline = useMemo(() => {
    const cols = { Applied: [], Screening: [], Interview: [], Offer: [] };
    applications.forEach((app) => {
      const col = STATUS_MAP[app.status];
      if (col) cols[col].push(app);
    });
    return cols;
  }, [applications]);

  // ── Upcoming interviews (next 10, sorted) ─────────────────────────────────
  const upcomingInterviews = useMemo(
    () =>
      [...interviews]
        .filter((i) => i.status !== "rejected")
        .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
        .slice(0, 10),
    [interviews],
  );

  // ── Recent applications (last 8) ──────────────────────────────────────────
  const recentApplications = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8),
    [applications],
  );

  const selectedInterview = useMemo(() => {
    if (!selectedApplication) return null;

    const candidateId = selectedApplication.userId?._id;
    const jobId = selectedApplication.jobPostId?._id;

    const related = interviews.filter((iv) => {
      const sameCandidate =
        !candidateId ||
        iv.userId?._id === candidateId ||
        iv.candidateId?._id === candidateId;
      const sameJob = !jobId || iv.jobPostId?._id === jobId;
      return sameCandidate && sameJob;
    });

    if (related.length === 0) return null;
    return [...related].sort(
      (a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date),
    )[0];
  }, [selectedApplication, interviews]);

  const openReviewModal = (application) => {
    setSelectedApplication(application);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedApplication(null);
  };

  const handleReviewStatusUpdate = async (status) => {
    if (!selectedApplication?._id) return;

    try {
      setStatusActionLoading(true);
      setError(null);
      await updateApplicationStatus(selectedApplication._id, status);

      setApplications((prev) =>
        prev.map((app) =>
          app._id === selectedApplication._id ? { ...app, status } : app,
        ),
      );
      setSelectedApplication((prev) => (prev ? { ...prev, status } : prev));
      setReviewModalOpen(false);
    } catch (e) {
      setError(e.message || "Failed to update candidate status.");
    } finally {
      setStatusActionLoading(false);
    }
  };

  // ── Analytics data ────────────────────────────────────────────────────────
  const barData = useMemo(() => {
    const counts = {};
    applications.forEach((a) => {
      const topic = a.jobPostId?.topic ?? "Unknown";
      counts[topic] = (counts[topic] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30) // supports up to 30 bars — chart scrolls horizontally
      .map(([label, value]) => ({ label, value }));
  }, [applications]);

  const donutData = useMemo(() => {
    const hired = applications.filter((a) => a.status === "Offered").length;
    const rejected = 0;
    const inProcess = applications.length - hired;
    return { hired, inProcess, rejected };
  }, [applications]);

  // Build a 6-month window ending THIS month
  const lineData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString("en-US", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    const hires = months.map(
      ({ year, month }) =>
        applications.filter((a) => {
          const d = new Date(a.createdAt);
          return (
            d.getFullYear() === year &&
            d.getMonth() === month &&
            a.status === "Offered"
          );
        }).length,
    );
    const intCounts = months.map(
      ({ year, month }) =>
        interviews.filter((i) => {
          const d = new Date(i.scheduled_date);
          return d.getFullYear() === year && d.getMonth() === month;
        }).length,
    );
    return { labels: months.map((m) => m.label), hires, interviews: intCounts };
  }, [applications, interviews]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!isRecruiterManager) {
    return (
      <Layout role={currentRole} active="Dashboard">
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
            <h1 className="text-lg font-semibold">Access denied</h1>
            <p className="mt-2 text-sm">
              Recruiter Manager Dashboard is available only for users with the
              recruiter role.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout role="recruiter" active="Dashboard">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#411B94] border-t-transparent" />
            <p className="text-sm text-slate-500">Loading dashboard…</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="recruiter" active="Dashboard">
      <div className="min-h-screen bg-white px-4 py-8 sm:px-8 lg:px-16">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Recruiter Manager Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your recruitment pipeline at a glance
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
            ⚠ {error} — showing available data.
          </div>
        )}

        {/* ── 1. Overall Status ─────────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Open Positions"
              value={openPositions}
              color="bg-[#411B94]"
              deltaPositive
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="7"
                    width="20"
                    height="14"
                    rx="2"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              }
            />
            <StatCard
              label="Candidates in Pipeline"
              value={totalCandidates}
              color="bg-sky-500"
              deltaPositive
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
                  <path
                    d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 3.13a4 4 0 0 1 0 7.75"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M21 21v-2a4 4 0 0 0-3-3.87"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
            <StatCard
              label="Interviews Scheduled"
              value={scheduledInterviews}
              color="bg-emerald-500"
              deltaPositive
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 2v4M8 2v4M3 10h18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 16l2 2 4-4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <StatCard
              label="Positions Filled"
              value={positionsFilled}
              color="bg-amber-500"
              deltaPositive={false}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </div>
        </section>

        {/* ── 2. Candidate Pipeline ─────────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">
              Candidate Pipeline
            </h2>
            <button className="text-xs font-semibold text-[#411B94] hover:underline">
              View All Candidates
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE_COLS.map(({ key, label, dot }) => {
              const items = pipeline[key] ?? [];
              return (
                <div key={key} className="min-h-[160px]">
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                    <span className="text-sm font-semibold text-slate-700">
                      {label}
                    </span>
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                        No candidates
                      </p>
                    )}
                    {items.slice(0, 4).map((app) => {
                      const name = app.userId?.name ?? "Unknown";
                      const job = app.jobPostId?.topic ?? "—";
                      const date = fmtDate(app.createdAt);
                      return (
                        <div
                          key={app._id}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-[#411B94]/30 hover:bg-violet-50/40 transition"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar name={name} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-slate-800">
                                {name}
                              </p>
                              <p className="truncate text-[11px] text-slate-500">
                                {job}
                              </p>
                            </div>
                          </div>
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M3 10h18"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                            {date}
                          </div>
                        </div>
                      );
                    })}
                    {items.length > 4 && (
                      <p className="text-center text-[11px] text-slate-400">
                        +{items.length - 4} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. Upcoming Interviews ────────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">
              Upcoming Interviews
            </h2>
            <button className="text-xs font-semibold text-[#411B94] hover:underline">
              View Full Schedule
            </button>
          </div>

          {upcomingInterviews.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No upcoming interviews.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      "Candidate Name",
                      "Position",
                      "Interview Type",
                      "Date & Time",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-left text-xs font-semibold text-slate-500 pr-4 last:pr-0"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {upcomingInterviews.map((iv) => {
                    const name = iv.userId?.name ?? "Unknown";
                    const job = iv.jobPostId?.topic ?? "—";
                    return (
                      <tr
                        key={iv._id}
                        className="group hover:bg-slate-50/60 transition"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={name} size="sm" />
                            <span className="font-medium text-slate-800">
                              {name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{job}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            {iv.interviewType === "online" ? (
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="text-sky-500"
                              >
                                <rect
                                  x="2"
                                  y="3"
                                  width="20"
                                  height="14"
                                  rx="2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M8 21h8M12 17v4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="text-amber-500"
                              >
                                <path
                                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx="9"
                                  cy="7"
                                  r="4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M23 21v-2a4 4 0 0 0-3-3.87"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M16 3.13a4 4 0 0 1 0 7.75"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                            <span className="capitalize">
                              {iv.interviewType === "online"
                                ? "Online"
                                : "In-Person"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-slate-400"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M3 10h18"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                            {fmtDateTime(iv.scheduled_date, iv.scheduled_time)}
                          </div>
                        </td>
                        <td className="py-3">
                          <StatusBadge status={iv.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── 4. Recent Applications ────────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">
              Recent Applications
            </h2>
            <button className="text-xs font-semibold text-[#411B94] hover:underline">
              View Full Applications
            </button>
          </div>

          {recentApplications.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No applications yet.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      "Candidate",
                      "Job Title",
                      "Applied Date",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-left text-xs font-semibold text-slate-500 pr-4 last:pr-0"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentApplications.map((app) => {
                    const name = app.userId?.name ?? "Unknown";
                    const job = app.jobPostId?.topic ?? "—";
                    const dated = fmtDate(app.createdAt);
                    return (
                      <tr
                        key={app._id}
                        className="group hover:bg-slate-50/60 transition"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={name} size="sm" />
                            <span className="font-medium text-slate-800">
                              {name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{job}</td>
                        <td className="py-3 pr-4 text-slate-500">{dated}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openReviewModal(app)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                            >
                              Review
                            </button>
                            <button className="rounded-lg border border-[#411B94] bg-[#411B94] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#311472] transition flex items-center gap-1">
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="18"
                                  rx="2"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M3 10h18M16 2v4M8 2v4"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                              Schedule
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── 5. Hiring Analytics ──────────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-slate-800">
            Hiring Analytics
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bar */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Candidates per Job
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Top roles by number of applicants
              </p>
              {barData.length === 0 ? (
                <p className="py-10 text-center text-xs text-slate-400">
                  No data
                </p>
              ) : (
                <>
                  {/* Chart scrolls horizontally for large datasets */}
                  <div className="mt-3">
                    <BarChart data={barData} />
                  </div>
                  {/* Summary list — always shows top 5 */}
                  <div className="mt-3 space-y-1.5">
                    {barData.slice(0, 5).map((item, idx) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-xs"
                      >
                        <span className="truncate text-slate-600">
                          {idx + 1}. {item.label}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Donut */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Interview to Hire Ratio
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Current funnel conversion
              </p>
              <div className="mt-3 flex justify-center">
                <div className="w-48">
                  <DonutChart {...donutData} />
                </div>
              </div>
            </div>

            {/* Line */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Hiring Progress (6 Months)
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Monthly hires vs interviews
              </p>
              <div className="mt-3">
                <LineChart
                  months={lineData.labels}
                  hires={lineData.hires}
                  interviews={lineData.interviews}
                />
              </div>
              <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-4 rounded-full bg-[#411B94]" />
                  Hires
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-4 rounded-full bg-purple-400" />
                  Interviews
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white px-2.5 py-2 text-xs">
                  <p className="text-slate-400">Total Interviews</p>
                  <p className="font-semibold text-slate-700">
                    {interviews.length}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-2 text-xs">
                  <p className="text-slate-400">Total Hires</p>
                  <p className="font-semibold text-slate-700">
                    {positionsFilled}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CandidateReviewModal
        isOpen={reviewModalOpen}
        application={selectedApplication}
        interview={selectedInterview}
        onClose={closeReviewModal}
        onUpdateStatus={handleReviewStatusUpdate}
        actionLoading={statusActionLoading}
      />
    </Layout>
  );
}
