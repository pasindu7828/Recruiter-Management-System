// services/candidateDashboardService.js
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';
const API_VERSION = import.meta.env.VITE_API_VERSION || '/api/v1';
const API_URL = `${API_BASE_URL}${API_VERSION}`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const candidateDashboardService = {
  fetchDashboardData: async () => {
    const [applicationsRes, interviewsRes, jobsRes, profileRes] =
      await Promise.allSettled([
        api.get('/applications/getMyAll', { params: { page: 1, limit: 1000 } }),
        api.get('/interviews/candidate'),
        api.get('/jobs'),
        api.get('/users/profile'),
      ]);

    const applicationsRaw =
      applicationsRes.status === 'fulfilled'
        ? applicationsRes.value.data
        : [];
    const applications = Array.isArray(applicationsRaw)
      ? applicationsRaw
      : applicationsRaw?.applications || [];
    const totalApplications =
      typeof applicationsRaw?.total === 'number'
        ? applicationsRaw.total
        : applications.length;

    const interviewsRaw =
      interviewsRes.status === 'fulfilled' ? interviewsRes.value.data : [];
    const interviews = Array.isArray(interviewsRaw)
      ? interviewsRaw
      : interviewsRaw?.interviews || [];

    const jobsRaw =
      jobsRes.status === 'fulfilled' ? jobsRes.value.data : [];
    const jobs = Array.isArray(jobsRaw) ? jobsRaw : jobsRaw?.jobs || [];

    const profile =
      profileRes.status === 'fulfilled' ? profileRes.value.data : null;

    return { applications, totalApplications, interviews, jobs, profile };
  },

  processStats: (applications, interviews, totalApplications) => {
    const offers = applications.filter(
      (a) => (a.status || '').toLowerCase() === 'offered',
    ).length;

    const interviewCount = interviews.length;

    const profileViews = (() => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        return u.profileViews || 0;
      } catch {
        return 0;
      }
    })();

    return {
      totalApplications:
        typeof totalApplications === 'number'
          ? totalApplications
          : applications.length,
      interviews: interviewCount,
      offers,
      profileViews,
    };
  },

  processRecentApplications: (applications, limit = 5) =>
    [...applications]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      )
      .slice(0, limit)
      .map((app) => ({
        id: app._id,
        jobTitle:
          app.jobPostId?.jobTitle || app.jobPostId?.topic || 'Unknown Position',
        company:
          app.jobPostId?.companyName || app.companyName || 'Unknown Company',
        status: app.status || 'Applied',
        appliedDate: app.createdAt || null,
      })),

  processUpcomingInterviews: (interviews, limit = 3) =>
    [...interviews]
      .filter((i) => i.scheduled_date && new Date(i.scheduled_date) >= new Date())
      .sort(
        (a, b) =>
          new Date(a.scheduled_date) - new Date(b.scheduled_date),
      )
      .slice(0, limit)
      .map((i) => ({
        id: i._id,
        jobTitle: i.jobPostId?.jobTitle || i.jobPostId?.topic || 'Position',
        company: i.jobPostId?.companyName || 'Company',
        date: i.scheduled_date,
        time: i.scheduled_time || '',
        manager: i.manager || 'Hiring Manager',
        type: i.type || 'Video Call',
        meetLink: i.meetLink || null,
      })),

  processRecommendedJobs: (jobs, applications, limit = 6) => {
    const appliedJobIds = new Set(
      applications.map((a) => a.jobPostId?._id || a.jobPostId),
    );
    return jobs
      .filter((j) => !appliedJobIds.has(j._id))
      .slice(0, limit)
      .map((j) => ({
        id: j._id,
        title: j.topic || 'Untitled Job',
        company: j.companyName || 'Company',
        location: j.location || 'Remote',
        salary: j.salary || '',
        badge: j.featured ? 'Featured' : 'New',
        category: j.category || 'General',
      }));
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('/users/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteResume: async (index) => {
    const response = await api.delete(`/users/delete-resume/${index}`);
    return response.data;
  },

  downloadResume: async (userId, index) => {
    const response = await api.get(`/users/download-resume/${userId}/${index}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export const candidateUtils = {
  getCandidateName: () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}').name || 'Candidate';
    } catch {
      return 'Candidate';
    }
  },

  getRelativeTime: (dateString) => {
    if (!dateString) return 'N/A';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  },

  formatInterviewDate: (dateString, timeString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return timeString ? `${datePart} at ${timeString}` : datePart;
  },

  getStatusStyle: (status) => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '_');
    const map = {
      applied: { bg: '#eff6ff', color: '#2563eb', label: 'Applied' },
      screening: { bg: '#f5f3ff', color: '#7c3aed', label: 'Screening' },
      interview_scheduled: { bg: '#ecfdf5', color: '#059669', label: 'Interview Scheduled' },
      interviewed: { bg: '#fffbeb', color: '#d97706', label: 'Interviewed' },
      offered: { bg: '#f0fdf4', color: '#16a34a', label: 'Offered' },
      rejected: { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
    };
    return map[s] || { bg: '#f9fafb', color: '#6b7280', label: status || 'Unknown' };
  },

  getAvatarColor: (name) => {
    const palette = [
      ['#7c3aed', '#ede9fe'],
      ['#ea580c', '#ffedd5'],
      ['#16a34a', '#dcfce7'],
      ['#2563eb', '#dbeafe'],
      ['#db2777', '#fce7f3'],
    ];
    const idx = (name?.charCodeAt(0) || 0) % palette.length;
    return { color: palette[idx][0], bg: palette[idx][1] };
  },

  getInitials: (name) =>
    (name || '?')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
};

export { api };
