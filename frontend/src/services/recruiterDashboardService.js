// services/recruiterDashboardService.js
import axios from 'axios';
import toast from 'react-hot-toast';

// API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION ;
const API_URL = `${API_BASE_URL}${API_VERSION}`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  },
);

// CV Service 
export const cvService = {
  // Download resume using application ID
  downloadResume: async (applicationId, candidateName, jobTitle) => {
    try {
      console.log('===== DEBUG: downloadResume =====');
      console.log('Application ID:', applicationId);
      
      if (!applicationId) {
        toast.error('No application ID available');
        return { success: false, error: 'No application ID available' };
      }
      
      const token = localStorage.getItem('token');
      // Use the applications download endpoint
      const downloadUrl = `${API_URL}/applications/download-resume/${applicationId}`;
      
      console.log('Downloading from URL:', downloadUrl);
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed:', errorText);
        throw new Error(`Failed to download: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `resume_${candidateName?.replace(/\s/g, '_') || 'candidate'}_${jobTitle?.replace(/\s/g, '_') || 'application'}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded successfully');
      return { success: true };
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download resume');
      return { success: false, error: error.message };
    }
  },
  
  // View resume in new tab
  viewResume: async (applicationId) => {
    if (!applicationId) {
      toast.error('No application ID available');
      return;
    }
    
    const token = localStorage.getItem('token');
    const viewUrl = `${API_URL}/applications/download-resume/${applicationId}`;
    
    // Open in new tab
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Loading Resume...</title></head>
          <body style="margin:0; padding:0;">
            <div style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
              <div>Loading resume...</div>
            </div>
            <script>
              fetch('${viewUrl}', {
                headers: { 'Authorization': 'Bearer ${token}' }
              })
              .then(res => {
                if (!res.ok) throw new Error('Failed to load: ' + res.status);
                return res.blob();
              })
              .then(blob => {
                const url = URL.createObjectURL(blob);
                window.location.href = url;
                setTimeout(() => URL.revokeObjectURL(url), 10000);
              })
              .catch(err => {
                console.error('Error:', err);
                document.body.innerHTML = '<div style="text-align:center; padding:20px;">' +
                  'Failed to load resume.<br/>' +
                  '<button onclick="window.close()" style="margin-top:10px; padding:8px 16px;">Close</button>' +
                  '</div>';
              });
            </script>
          </body>
        </html>
      `);
    } else {
      toast.error('Please allow popups to view resumes');
    }
  }
};

// Dashboard Data Service
export const recruiterDashboardService = {
  // Fetch all dashboard data
  fetchDashboardData: async () => {
    try {
      const [jobsRes, applicationsRes, interviewsRes] = await Promise.allSettled([
        api.get('/jobs/recruiter/my-jobs'),
        api.get('/applications/recruiter-applications'),
        api.get('/interviews/recruiter'),
      ]);

      // Handle jobs response
      const jobsData = jobsRes.status === 'fulfilled' ? jobsRes.value.data : [];
      let jobs = [];
      if (jobsData) {
        if (jobsData.jobs && Array.isArray(jobsData.jobs)) {
          jobs = jobsData.jobs;
        } else if (Array.isArray(jobsData)) {
          jobs = jobsData;
        }
      }

      const applicationsData = applicationsRes.status === 'fulfilled' ? applicationsRes.value.data : [];
      const applicationsArray = Array.isArray(applicationsData) ? applicationsData : applicationsData?.applications || [];

      const interviewsData = interviewsRes.status === 'fulfilled' ? interviewsRes.value.data : [];
      const interviewsArray = Array.isArray(interviewsData) ? interviewsData : interviewsData?.interviews || [];

      return { jobs, applicationsArray, interviewsArray };
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load some dashboard data');
      throw err;
    }
  },

  // Process stats from data
  processStats: (jobs, applicationsArray, interviewsArray) => {
    const today = new Date().toDateString();
    const interviewsToday = interviewsArray.filter((interview) => {
      if (!interview.scheduled_date) return false;
      const interviewDate = new Date(interview.scheduled_date).toDateString();
      return interviewDate === today;
    }).length;

    const activeVacancies = jobs.filter((job) => {
      if (job.applicationDeadline) {
        return new Date(job.applicationDeadline) > new Date();
      }
      return job.status === 'Published';
    }).length;

    return {
      activeVacancies: activeVacancies,
      totalInterviews: interviewsArray.length,
      interviewsToday: interviewsToday,
      totalApplications: applicationsArray.length,
    };
  },

  // Process recent applications
  processRecentApplications: (applicationsArray, limit = 5) => {
    return [...applicationsArray]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, limit)
      .map((app) => ({
        id: app._id,
        candidateName: app.userId?.name || 'Unknown Candidate',
        candidateEmail: app.userId?.email || '',
        jobTitle: app.jobPostId?.jobTitle || app.jobPostId?.topic || 'Unknown Position',
        appliedDate: app.createdAt || 'N/A',
        status: app.status || 'Applied',
        resume: app.resume,
        phoneNumber: app.phoneNumber,
        coverLetter: app.coverLetter,
        portfolioLink: app.portfolioLink,
        interview: app.interview,
      }));
  },

  // Process recent interviews
  processRecentInterviews: (interviewsArray, limit = 5) => {
    return interviewsArray.slice(0, limit).map((interview) => {
      const isJobDeleted = !interview.jobPostId || 
                          (!interview.jobPostId.jobTitle && !interview.jobPostId.topic);
      
      return {
        id: interview._id,
        name: interview.userId?.name || 'Unknown',
        email: interview.userId?.email || '',
        role: isJobDeleted 
          ? 'Role is no longer available' 
          : (interview.jobPostId?.jobTitle || interview.jobPostId?.topic || 'Position'),
        date: interview.scheduled_date
          ? new Date(interview.scheduled_date).toLocaleDateString('en-CA')
          : 'N/A',
        time: interview.scheduled_time || 'N/A',
        status: interview.status || 'Pending',
        type: interview.type || 'Video Call',
        manager: interview.manager || 'HR Team',
        notes: interview.notes || 'Focus on React and TypeScript experience. Discuss previous projects.',
        isJobDeleted: isJobDeleted, 
      };
    });
  },

  // Process recent vacancies
  processRecentVacancies: (jobs, applicationsArray, limit = 2) => {
    return jobs
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, limit)
      .map((job) => {
        const appCount = applicationsArray.filter(
          (app) => app.jobPostId?._id === job._id,
        ).length;
        const daysAgo = job.createdAt
          ? Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24))
          : 0;
        return {
          title: job.jobTitle || job.topic || 'Untitled Position',
          apps: appCount,
          ago: daysAgo === 0 ? 'Today' : `${daysAgo}d ago`,
        };
      });
  },
};

// Notification Service
export const notificationService = {
  fetchNotifications: async () => {
    try {
      const token = localStorage.getItem('token');
      const [notificationsRes, summaryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}${API_VERSION}/notifications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}${API_VERSION}/notifications/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      return {
        notifications: notificationsRes.data.notifications || [],
        summary: summaryRes.data.summary,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}${API_VERSION}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
};

// Utility Functions
export const dashboardUtils = {
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  formatDateLong: (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  getStatusStyles: (status) => {
    switch (status) {
      case 'Applied':
        return { bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'Screening':
        return { bg: 'bg-purple-100', text: 'text-purple-700' };
      case 'Interview Scheduled':
        return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'Interviewed':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'Offered':
        return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
      case 'Hired':
        return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'Rejected':
        return { bg: 'bg-red-100', text: 'text-red-700' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  },

  getInterviewStatusStyles: (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-[#e8fbf3] text-[#10b981]';
      case 'pending':
        return 'bg-[#fff7ed] text-[#f59e0b]';
      case 'rejected':
        return 'bg-[#fef2f2] text-[#ef4444]';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  },

  getAvatarColors: (name) => {
    const colors = [
      ['bg-purple-100', 'text-purple-700'],
      ['bg-orange-100', 'text-orange-700'],
      ['bg-green-100', 'text-green-700'],
      ['bg-blue-100', 'text-blue-700'],
      ['bg-red-100', 'text-red-700'],
    ];
    const idx = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
  },

  getInitials: (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2) || '?';
  },

  isRecruiter: () => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    try {
      const userData = JSON.parse(user);
      return userData.role === 'recruiter';
    } catch {
      return false;
    }
  },

  getRecruiterName: () => {
    const user = localStorage.getItem('user');
    if (!user) return 'Recruiter';
    try {
      const userData = JSON.parse(user);
      return userData.name || 'Recruiter';
    } catch {
      return 'Recruiter';
    }
  },
};

export { api };