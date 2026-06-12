import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import {
  candidateDashboardService,
  candidateUtils,
} from '../../services/candidateDashboardService';

/* ─────────────────────────────────────────────
   Inline Styles & Design Tokens
───────────────────────────────────────────── */
const PURPLE = '#4f46e5';
const PURPLE_DARK = '#3730a3';
const PURPLE_LIGHT = '#ede9fe';

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5fa',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    maxWidth: 1100,
    margin: '0 auto',
    padding: '100px 24px 40px',
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 24,
  },
  // Stats row
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
    marginBottom: 32,
    maxWidth: 860,
    margin: '0 auto 32px',
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    border: '1px solid #f0f0f5',
  },
  statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#111827' },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Section headers
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#111827' },
  viewAll: {
    fontSize: 14,
    color: PURPLE,
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'none',
  },
  // Quick Actions
  quickActionsRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  btnPrimary: {
    background: PURPLE,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'background .2s',
  },
  btnOutline: {
    background: '#fff',
    color: '#374151',
    border: '1.5px solid #e5e7eb',
    borderRadius: 8,
    padding: '10px 20px',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'border-color .2s',
  },
  // Table
  tableCard: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    border: '1px solid #f0f0f5',
    overflow: 'hidden',
    marginBottom: 32,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 600,
    borderBottom: '1px solid #f0f0f5',
    background: '#fafafa',
  },
  td: {
    padding: '14px 16px',
    fontSize: 14,
    color: '#374151',
    borderBottom: '1px solid #f9fafb',
    verticalAlign: 'middle',
  },
  thCenter: { textAlign: 'center' },
  tdCenter: { textAlign: 'center' },
  // Interview cards
  interviewCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #f0f0f5',
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 16,
    flexWrap: 'wrap',
  },
  // Job cards grid
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  jobCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #f0f0f5',
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    padding: '18px 18px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  applyBtn: {
    marginTop: 6,
    background: PURPLE,
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    padding: '9px 0',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    width: '100%',
    transition: 'background .2s',
  },
};

/* ─────────────────────────────────────────────
   Sub-Components
───────────────────────────────────────────── */

function Avatar({ name, size = 40 }) {
  const { color, bg } = candidateUtils.getAvatarColor(name);
  const initials = candidateUtils.getInitials(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = candidateUtils.getStatusStyle(status);
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}

function StatCard({ label, value, icon, iconBg }) {
  return (
    <div style={styles.statCard}>
      <div>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statValue}>{value}</div>
      </div>
      <div style={{ ...styles.statIconWrap, background: iconBg }}>
        {icon}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
      <div
        style={{
          display: 'inline-block',
          width: 36,
          height: 36,
          border: `3px solid ${PURPLE_LIGHT}`,
          borderTopColor: PURPLE,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ marginTop: 14, fontSize: 14 }}>Loading your dashboard…</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Application View Modal
───────────────────────────────────────────── */
function ApplicationViewModal({ app, onClose }) {
  if (!app) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(79,70,229,0.18)',
          width: '100%',
          maxWidth: 480,
          padding: '32px 28px 24px',
          position: 'relative',
          animation: 'popIn .22s cubic-bezier(.4,0,.2,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: '#f3f4f6', border: 'none', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280', fontSize: 18, lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: PURPLE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{app.jobTitle}</div>
            {app.company && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{app.company}</div>}
          </div>
        </div>

        {/* Detail rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DetailRow
            label="Status"
            value={<StatusBadge status={app.status} />}
          />
          <DetailRow
            label="Applied"
            value={candidateUtils.getRelativeTime(app.appliedDate)}
          />
          {app.location && <DetailRow label="Location" value={app.location} />}
          {app.jobType && <DetailRow label="Job Type" value={app.jobType} />}
          {app.salary && <DetailRow label="Salary" value={app.salary} />}
          {app.notes && <DetailRow label="Notes" value={app.notes} />}
        </div>

        {/* Footer button */}
        <button
          style={{
            marginTop: 26,
            width: '100%',
            background: PURPLE,
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: '12px 0',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'background .2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = PURPLE_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.background = PURPLE)}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, minWidth: 90 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalApplications: 0,
    interviews: 0,
    offers: 0,
    profileViews: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [viewApplication, setViewApplication] = useState(null);
  const [jobFilter, setJobFilter] = useState('All Categories');
  const [locationFilter, setLocationFilter] = useState('Sri Lanka');
  const candidateName = candidateUtils.getCandidateName();
  const [resumes, setResumes] = useState([]);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = React.useRef(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { applications, totalApplications, interviews, jobs, profile } =
        await candidateDashboardService.fetchDashboardData();

      setResumes(profile?.resumes || []);

      setStats(
        candidateDashboardService.processStats(
          applications,
          interviews,
          totalApplications,
        ),
      );
      setRecentApplications(
        candidateDashboardService.processRecentApplications(applications),
      );
      setUpcomingInterviews(
        candidateDashboardService.processUpcomingInterviews(interviews),
      );
      setRecommendedJobs(
        candidateDashboardService.processRecommendedJobs(jobs, applications)

      );
      console.log(candidateDashboardService.processRecommendedJobs(jobs, applications));

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const response = await candidateDashboardService.uploadResume(file);
      if (response && response.resumes) {
        setResumes(response.resumes);
      } else {
        loadData();
      }
    } catch (err) {
      alert('Failed to upload resume');
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadResume = async (index, fileName) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || user.id;
      if (!userId) {
        alert('User not found');
        return;
      }
      const blob = await candidateDashboardService.downloadResume(userId, index);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to download resume');
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredJobs = recommendedJobs.filter((j) => {
    const catMatch =
      jobFilter === 'All Categories' || j.category === jobFilter;
    const locMatch =
      locationFilter === 'All Locations' ||
      (j.location || '').includes(locationFilter.replace('Sri Lanka', '').trim()) ||
      locationFilter === 'Sri Lanka';
    return catMatch && locMatch;
  });

  // Unique categories for filter
  const categories = [
    'All Categories',
    ...new Set(recommendedJobs.map((j) => j.category)),
  ];

  return (
    <div style={styles.page}>
      <Header active="Dashboard" role="candidate" />

      <main style={styles.main}>
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#b91c1c',
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {/* Welcome */}
        <h1 style={styles.welcomeTitle}>Welcome back, {candidateName}!</h1>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* ── Stats Row ── */}
            <div style={styles.statsRow}>
              <StatCard
                label="Applications"
                value={stats.totalApplications}
                iconBg="#ede9fe"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                }
              />
              <StatCard
                label="Interviews"
                value={stats.interviews}
                iconBg="#dbeafe"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
              <StatCard
                label="Offers"
                value={stats.offers}
                iconBg="#fef3c7"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                }
              />
            </div>

            {/* ── Quick Actions ── */}
            <div style={{ marginBottom: 8 }}>
              <h2 style={{ ...styles.sectionTitle, marginBottom: 14 }}>Quick Actions</h2>
              <div style={styles.quickActionsRow}>
                <button
                  style={styles.btnPrimary}
                  onClick={() => navigate('/jobs')}
                  onMouseEnter={(e) => (e.currentTarget.style.background = PURPLE_DARK)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = PURPLE)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  Browse Jobs
                </button>
                <button
                  style={styles.btnOutline}
                  onClick={() => navigate('/profile')}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = PURPLE)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Update Profile
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                />
                <button
                  style={styles.btnOutline}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingResume}
                  onMouseEnter={(e) => { if (!uploadingResume) e.currentTarget.style.borderColor = PURPLE }}
                  onMouseLeave={(e) => { if (!uploadingResume) e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                </button>
                {/* <button
                  style={styles.btnOutline}
                  onClick={() => navigate('/applications')}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = PURPLE)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  Track Applications
                </button> */}
              </div>
            </div>

            {/* ── Recent Applications ── */}
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Recent Applications</h2>
                <span
                  style={styles.viewAll}
                  onClick={() => navigate('/applications')}
                >
                  View All
                </span>
              </div>
              <div style={styles.tableCard}>
                {recentApplications.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                    No applications yet.{' '}
                    <span
                      style={{ color: PURPLE, cursor: 'pointer' }}
                      onClick={() => navigate('/jobs')}
                    >
                      Browse jobs →
                    </span>
                  </div>
                ) : (
                  <table style={styles.table}>
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={styles.th}>Job Title</th>
                        <th style={{ ...styles.th, ...styles.thCenter }}>Status</th>
                        <th style={{ ...styles.th, ...styles.thCenter }}>Applied</th>
                        <th style={{ ...styles.th, ...styles.thCenter }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app) => (
                        <tr key={app.id} style={{ transition: 'background .15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ ...styles.td, fontWeight: 600 }}>
                            {app.jobTitle}
                          </td>
                          <td style={{ ...styles.td, ...styles.tdCenter }}>
                            <StatusBadge status={app.status} />
                          </td>
                          <td style={{ ...styles.td, ...styles.tdCenter, color: '#9ca3af', fontSize: 13 }}>
                            {candidateUtils.getRelativeTime(app.appliedDate)}
                          </td>
                          <td style={{ ...styles.td, ...styles.tdCenter }}>
                            <span
                              style={{ color: PURPLE, fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: '4px 12px', borderRadius: 6, background: PURPLE_LIGHT, display: 'inline-block' }}
                              onClick={() => setViewApplication(app)}
                            >
                              View
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* ── Upcoming Interviews ── */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ ...styles.sectionTitle, marginBottom: 14 }}>
                Upcoming Interviews
              </h2>
              {upcomingInterviews.length === 0 ? (
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #f0f0f5',
                    padding: '24px 20px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: 14,
                  }}
                >
                  No upcoming interviews scheduled.
                </div>
              ) : (
                upcomingInterviews.map((interview) => (
                  <div key={interview.id} style={styles.interviewCard}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div
                        style={{
                          ...styles.statIconWrap,
                          background: PURPLE_LIGHT,
                          flexShrink: 0,
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                          {interview.jobTitle}
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                          {interview.company}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            marginTop: 6,
                          }}
                        >
                          <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {candidateUtils.formatInterviewDate(
                              interview.date,
                              interview.time,
                            )}
                          </span>
                          <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            Hiring Manager: {interview.manager}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {interview.meetLink ? (
                        <a
                          href={interview.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            ...styles.btnPrimary,
                            textDecoration: 'none',
                            fontSize: 13,
                            padding: '9px 18px',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                          Join Interview
                        </a>
                      ) : (
                        <button
                          style={{
                            ...styles.btnOutline,
                            fontSize: 13,
                            padding: '9px 18px',
                          }}
                          onClick={() => navigate('/interviews')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                          </svg>
                          Prepare
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Recommended Jobs ── */}
            {/* <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Recommended Jobs</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    style={{
                      fontSize: 13,
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      padding: '5px 10px',
                      color: '#374151',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    style={{
                      fontSize: 13,
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      padding: '5px 10px',
                      color: '#374151',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    {['Sri Lanka', 'All Locations'].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #f0f0f5',
                    padding: '24px 20px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: 14,
                  }}
                >
                  No recommended jobs available right now.
                </div>
              ) : (
                <div style={styles.jobsGrid}>
                  {filteredJobs.map((job) => (
                    <div key={job.id} style={styles.jobCard}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Avatar name={job.company} size={42} />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: job.badge === 'Featured' ? '#d97706' : '#16a34a',
                            background: job.badge === 'Featured' ? '#fef3c7' : '#dcfce7',
                            padding: '3px 9px',
                            borderRadius: 20,
                          }}
                        >
                          {job.badge}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginTop: 4 }}>
                        {job.jobPostId?.jobTitle}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{job.company}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {job.location}
                        </span>
                        {job.salary && (
                          <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23" />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            {job.salary}
                          </span>
                        )}
                      </div>
                      <button
                        style={styles.applyBtn}
                        onClick={() => navigate(`/job_details/${job.id}`)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = PURPLE_DARK)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = PURPLE)}
                      >
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div> */}
          </>
        )}
      </main>

      <Footer />
      <ApplicationViewModal app={viewApplication} onClose={() => setViewApplication(null)} />
    </div>
  );
}
