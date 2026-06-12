// RecruiterDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  FileText,
  UserPlus,
  Calendar,
  User,
  Watch,
  Plus,
  Send,
  Eye,
} from 'lucide-react';
import ApplicationGrowthChart from '../../components/RecruiterDashboard/ApplicationGrowthChart';
import InterviewDetailsModal from './InterviewDetailsModal';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import NotificationWidget from '../../components/RecruiterDashboard/NotificationWidget';
import {
  recruiterDashboardService,
  dashboardUtils,
} from '../../services/recruiterDashboardService';
import Layout from '../../components/layout/Layout';

// Avatar component
const Avatar = ({ name }) => {
  const [bg, fg] = dashboardUtils.getAvatarColors(name);
  const initials = dashboardUtils.getInitials(name);

  return (
    <div
      className={`w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-full ${bg} ${fg} flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 border-2 border-white shadow-sm`}
    >
      {initials}
    </div>
  );
};

// Stat Card
const StatCard = ({ icon, label, value, iconColor = '#401A94' }) => {
  const IconComponent = icon;

  return (
    <div className="flex-1 min-w-[130px] sm:min-w-[150px] md:min-w-[180px] bg-white rounded-xl sm:rounded-[16px] border border-gray-100 p-4 sm:p-[24px_22px] shadow-sm">
      <div className="mb-2">
        <IconComponent
          size={20}
          sm:size={24}
          color={iconColor}
          strokeWidth={1.8}
        />
      </div>
      <p className="text-gray-400 text-xs sm:text-sm mb-1">{label}</p>
      <p className="text-2xl sm:text-[32px] font-extrabold text-gray-900 tracking-tight">
        {value}
      </p>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Applied: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Applied' },
    Screening: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      label: 'Screening',
    },
    'Interview Scheduled': {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Interview Scheduled',
    },
    Interviewed: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Interviewed',
    },
    Offered: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Offered' },
  };

  const config = statusConfig[status] || statusConfig['Applied'];

  return (
    <span
      className={`${config.bg} ${config.text} text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium`}
    >
      {config.label}
    </span>
  );
};

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State for data
  const [stats, setStats] = useState({
    activeVacancies: 0,
    totalInterviews: 0,
    interviewsToday: 0,
    totalApplications: 0,
  });

  const [interviews, setInterviews] = useState([]);
  const [recentVacancies, setRecentVacancies] = useState([]);
  const [recruiterName, setRecruiterName] = useState('');
  const [applications, setApplications] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);

  // State for modals
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  // Check authentication and role on mount
  useEffect(() => {
    if (!dashboardUtils.isRecruiter()) {
      navigate('/signin');
      return;
    }
    setRecruiterName(dashboardUtils.getRecruiterName());
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { jobs, applicationsArray, interviewsArray } =
        await recruiterDashboardService.fetchDashboardData();

      setApplications(applicationsArray);
      setStats(
        recruiterDashboardService.processStats(
          jobs,
          applicationsArray,
          interviewsArray,
        ),
      );
      setRecentApplications(
        recruiterDashboardService.processRecentApplications(
          applicationsArray,
          5,
        ),
      );
      setInterviews(
        recruiterDashboardService.processRecentInterviews(interviewsArray, 5),
      );
      setRecentVacancies(
        recruiterDashboardService.processRecentVacancies(
          jobs,
          applicationsArray,
          5,
        ),
      );
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadDashboardData();
    }
  }, []);

  const handleManageInterview = (interviewId) => {
    const interview = interviews.find((i) => i.id === interviewId);
    setSelectedInterview(interview);
    setIsInterviewModalOpen(true);
  };

  const handleCloseInterviewModal = () => {
    setIsInterviewModalOpen(false);
    setSelectedInterview(null);
  };

  const handleViewApplication = (applicationId) => {
    const application = recentApplications.find(
      (app) => app.id === applicationId,
    );
    setSelectedApplication(application);
    setIsApplicationModalOpen(true);
  };

  const handleCloseApplicationModal = () => {
    setIsApplicationModalOpen(false);
    setSelectedApplication(null);
  };

  const handleUpdateStatusFromModal = (applicationId) => {
    setIsApplicationModalOpen(false);
    setSelectedApplication(null);
    navigate(`/recruiter/applications/${applicationId}/status`);
  };

  const handleCreateJob = () => navigate('/job_post');
  const handleViewJobs = () => navigate('/jobs');
  const handleScheduleInterview = () => navigate('/interviews');

  if (loading) {
    return (
      <Layout role="recruiter" active="Dashboard">
        <div className="min-h-screen w-full bg-gray-50 font-sans flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#401A94] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">
              Loading dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="recruiter" active="Dashboard">
      <div className="min-h-screen w-full bg-gray-50 font-sans">
        <div className="w-full px-3 sm:px-4 lg:px-[32px] py-3 sm:py-4 lg:py-[28px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-[24px]">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#401A94] m-0">
                Welcome back, {recruiterName}!
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl">
                View real-time performance and user engagement metrics in here.
              </p>
            </div>
            <button
              onClick={handleCreateJob}
              className="bg-[#401A94] text-white rounded-lg sm:rounded-xl px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-base font-bold flex items-center justify-center gap-2 hover:bg-[#2f1370] transition w-full sm:w-auto"
            >
              <Plus size={16} sm:size={20} /> Create Job
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-[14px] mb-4 sm:mb-5 lg:mb-[20px]">
            <StatCard
              icon={Briefcase}
              label="Active Vacancies"
              value={stats.activeVacancies}
            />
            <StatCard
              icon={Users}
              label="Total Interviews"
              value={stats.totalInterviews}
            />
            <StatCard
              icon={Clock}
              label="Interviews Today"
              value={stats.interviewsToday.toString().padStart(2, '0')}
              iconColor="#f59e0b"
            />
            <StatCard
              icon={CheckCircle}
              label="Total Applications"
              value={stats.totalApplications}
              iconColor="#14b8a6"
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-3 sm:gap-4">
              {/* Application Growth Chart */}
              <ApplicationGrowthChart applications={applications} />

              {/* Upcoming Interviews Table with Scrollbar */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 lg:p-[18px_20px]">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
                    Upcoming Interviews
                  </h2>
                  <button
                    onClick={() => navigate('/interviews')}
                    className="text-xs sm:text-sm text-[#401A94] font-semibold hover:text-[#2f1370]"
                  >
                    View All
                  </button>
                </div>

                {/* Desktop Table with Scrollbar */}
                <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[400px]">
                  <table className="w-full text-xs sm:text-sm table-fixed">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-gray-100">
                        <th className="pb-2 sm:pb-3 text-[10px] sm:text-xs font-bold text-[#401A94] uppercase tracking-wider text-left whitespace-nowrap w-[35%] sticky top-0 bg-white">
                          Candidate
                        </th>
                        <th className="pb-2 sm:pb-3 text-[10px] sm:text-xs font-bold text-[#401A94] uppercase tracking-wider text-left whitespace-nowrap w-[30%] sticky top-0 bg-white">
                          Role
                        </th>
                        <th className="pb-2 sm:pb-3 text-[10px] sm:text-xs font-bold text-[#401A94] uppercase tracking-wider text-left whitespace-nowrap w-[15%] sticky top-0 bg-white">
                          Date
                        </th>
                        <th className="pb-2 sm:pb-3 text-[10px] sm:text-xs font-bold text-[#401A94] uppercase tracking-wider text-left whitespace-nowrap w-[20%] sticky top-0 bg-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviews.length > 0 ? (
                        interviews.map((interview) => (
                          <tr
                            key={interview.id}
                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="py-2 sm:py-[12px]">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Avatar name={interview.name} />
                                <div className="flex flex-col min-w-0 flex-1">
                                  <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                                    {interview.name}
                                  </p>
                                  <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 truncate">
                                    {interview.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="text-gray-600 py-2 sm:py-[12px] text-xs sm:text-sm">
                              <span className="line-clamp-2 break-words">
                                {interview.role}
                              </span>
                            </td>
                            <td className="text-gray-400 py-2 sm:py-[12px] text-xs sm:text-sm whitespace-nowrap">
                              {interview.date} at {interview.time}
                            </td>
                            <td className="py-2 sm:py-[12px]">
                              <button
                                onClick={() =>
                                  handleManageInterview(interview.id)
                                }
                                className="border border-gray-300 rounded-md sm:rounded-[8px] px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap transition-colors inline-flex items-center gap-1 sm:gap-1.5"
                              >
                                <Eye size={12} sm:size={14} /> View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-4 sm:py-8 text-center text-gray-400 text-xs sm:text-sm"
                          >
                            No upcoming interviews
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards with Scrollbar */}
                <div className="md:hidden overflow-y-auto max-h-[400px] space-y-3">
                  {interviews.length > 0 ? (
                    interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="border border-gray-100 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar name={interview.name} />
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">
                              {interview.name}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              {interview.email}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <p className="text-[#401A94] text-[10px] font-bold uppercase">
                              Role
                            </p>
                            <p className="text-gray-600 break-words">
                              {interview.role}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#401A94] text-[10px] font-bold uppercase">
                              Date & Time
                            </p>
                            <p className="text-gray-400 text-xs">
                              {interview.date} at {interview.time}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleManageInterview(interview.id)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 bg-white inline-flex items-center justify-center gap-1.5"
                        >
                          <Eye size={12} /> View Details
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 sm:py-8 text-gray-400 text-xs sm:text-sm">
                      No upcoming interviews
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Applications Section with Scrollbar */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 lg:p-[18px_20px]">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
                    Recent Applications
                  </h2>
                  <button
                    onClick={handleViewJobs}
                    className="text-xs sm:text-sm text-[#401A94] font-semibold hover:text-[#2f1370]"
                  >
                    View All
                  </button>
                </div>

                {/* Desktop Table with Scrollbar */}
                <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[400px]">
                  <table className="w-full text-xs sm:text-sm table-fixed">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-gray-100">
                        <th className="pb-2 sm:pb-3 text-[10px] sm:text-xs font-bold text-[#401A94] uppercase tracking-wider text-left whitespace-nowrap w-[35%] sticky top-0 bg-white">
                          Candidate
                        </th>
                        <th className="pb-2 sm:pb-3 text-[10px] sm:text-xs font-bold text-[#401A94] uppercase tracking-wider text-left whitespace-nowrap w-[30%] sticky top-0 bg-white">
                          Role
                        </th>
                        <th className="pb-2 sm:pb-3 text-[10px] sm:text-xs font-bold text-[#401A94] uppercase tracking-wider text-left whitespace-nowrap w-[15%] sticky top-0 bg-white">
                          Applied Date
                        </th>
                        <th className="pb-2 sm:pb-3 text-[10px] sm:text-xs font-bold text-[#401A94] uppercase tracking-wider text-left whitespace-nowrap w-[20%] sticky top-0 bg-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.length > 0 ? (
                        recentApplications.map((application) => (
                          <tr
                            key={application.id}
                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="py-2 sm:py-[12px]">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Avatar name={application.candidateName} />
                                <div className="flex flex-col min-w-0 flex-1">
                                  <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                                    {application.candidateName}
                                  </p>
                                  <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 truncate">
                                    {application.candidateEmail}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="text-gray-600 py-2 sm:py-[12px] text-xs sm:text-sm">
                              <span className="line-clamp-2 break-words">
                                {application.jobTitle}
                              </span>
                            </td>
                            <td className="text-gray-400 py-2 sm:py-[12px] text-xs sm:text-sm whitespace-nowrap">
                              {new Date(
                                application.appliedDate,
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-2 sm:py-[12px]">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                  onClick={() =>
                                    handleViewApplication(application.id)
                                  }
                                  className="border border-gray-300 rounded-md sm:rounded-[8px] px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5"
                                >
                                  <Eye size={12} sm:size={14} /> View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-4 sm:py-8 text-center text-gray-400 text-xs sm:text-sm"
                          >
                            No applications received yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards with Scrollbar */}
                <div className="md:hidden overflow-y-auto max-h-[400px] space-y-3">
                  {recentApplications.length > 0 ? (
                    recentApplications.map((application) => (
                      <div
                        key={application.id}
                        className="border border-gray-100 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar name={application.candidateName} />
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">
                                {application.candidateName}
                              </p>
                              <p className="text-gray-400 text-xs truncate">
                                {application.candidateEmail}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <p className="text-[#401A94] text-[10px] font-bold uppercase">
                              Position
                            </p>
                            <p className="text-gray-600 break-words">
                              {application.jobTitle}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#401A94] text-[10px] font-bold uppercase">
                              Applied
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(
                                application.appliedDate,
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleViewApplication(application.id)
                            }
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 bg-white inline-flex items-center justify-center gap-1.5"
                          >
                            <Eye size={12} /> View Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 sm:py-8 text-gray-400 text-xs sm:text-sm">
                      No applications received yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-[280px] xl:w-[300px] flex flex-col gap-3 sm:gap-4 flex-shrink-0">
              {/* Notifications Widget */}
              <div className="max-h-[300px] overflow-y-auto">
                <NotificationWidget limit={5} showViewAll={true} />
              </div>

              {/* Recent Vacancies with Scrollbar */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 lg:p-[18px]">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
                    Recent Vacancies
                  </h2>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="text-xs sm:text-sm text-[#401A94] font-semibold hover:text-[#2f1370]"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[300px] space-y-3 sm:space-y-4">
                  {recentVacancies.length > 0 ? (
                    recentVacancies.map((v, i) => (
                      <div
                        key={i}
                        className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <p className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base">
                          {v.title}
                        </p>
                        <p className="text-gray-400 text-[10px] sm:text-xs lg:text-sm mt-1 flex items-center gap-3 sm:gap-4">
                          <span className="flex items-center gap-1">
                            <User size={10} sm:size={12} /> {v.apps} Apps
                          </span>
                          <span className="flex items-center gap-1">
                            <Watch size={10} sm:size={12} /> {v.ago}
                          </span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-xs sm:text-sm text-center py-4">
                      No recent vacancies
                    </p>
                  )}
                </div>
              </div>
              {/* Quick Actions */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 lg:p-[18px]">
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 mb-3 sm:mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
                  <button
                    onClick={handleCreateJob}
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 font-medium hover:text-[#401A94] transition text-left p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <span className="w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-lg sm:rounded-[10px] bg-[#401A94]/10 flex items-center justify-center flex-shrink-0">
                      <FileText
                        size={18}
                        sm:size={20}
                        color="#401A94"
                        strokeWidth={1.8}
                      />
                    </span>
                    <span className="flex-1">Post a Job</span>
                  </button>
                  <button
                    onClick={handleViewJobs}
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 font-medium hover:text-[#401A94] transition text-left p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <span className="w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-lg sm:rounded-[10px] bg-[#401A94]/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase
                        size={18}
                        sm:size={20}
                        color="#401A94"
                        strokeWidth={1.8}
                      />
                    </span>
                    <span className="flex-1">View Jobs</span>
                  </button>
                  <button
                    onClick={handleScheduleInterview}
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 font-medium hover:text-[#401A94] transition text-left p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <span className="w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-lg sm:rounded-[10px] bg-[#401A94]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar
                        size={18}
                        sm:size={20}
                        color="#401A94"
                        strokeWidth={1.8}
                      />
                    </span>
                    <span className="flex-1">Schedule Interview</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Details Modal */}
        {isInterviewModalOpen && (
          <InterviewDetailsModal
            interview={selectedInterview}
            onClose={handleCloseInterviewModal}
          />
        )}

        {/* Application Details Modal */}
        {isApplicationModalOpen && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={handleCloseApplicationModal}
            onUpdateStatus={handleUpdateStatusFromModal}
          />
        )}
      </div>
    </Layout>
  );
}
