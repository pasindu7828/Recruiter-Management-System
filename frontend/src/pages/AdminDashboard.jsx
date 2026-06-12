import React, { useEffect, useMemo, useState } from 'react';
import { BriefcaseIcon, UsersIcon, UserPlusIcon, CalendarIcon, TrendingUpIcon, MonitorIcon, ListIcon, ClockIcon } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { StatsCards } from '../components/Admin_Dashboard/StatsCards';
import { ApplicationsChart } from '../components/Admin_Dashboard/ApplicationsChart';
import { RecentApplications } from '../components/Admin_Dashboard/RecentApplications';
import { NotificationsPanel } from '../components/Admin_Dashboard/NotificationsPanel';
import { NotificationsSidebar } from '../components/Admin_Dashboard/NotificationsSideBar';
import { getAdminDashboardData } from '../services/adminDashboardService';

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

const getCreatedAtDate = (item) => {
  if (!item?.createdAt) {
    return null;
  }

  const parsedDate = new Date(item.createdAt);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const buildChartData = (users) => {
  const now = new Date();
  const buckets = [];

  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    buckets.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      name: monthFormatter.format(date),
      value: 0,
    });
  }

  users.forEach((user) => {
    const createdAt = getCreatedAtDate(user);
    if (!createdAt) {
      return;
    }

    const bucket = buckets.find(
      (entry) =>
        entry.year === createdAt.getFullYear() &&
        entry.month === createdAt.getMonth(),
    );

    if (bucket) {
      bucket.value += 1;
    }
  });

  return buckets.map(({ name, value }) => ({ name, value }));
};

const buildRecentApplications = (candidates) => {
  return [...candidates]
    .sort((first, second) => {
      const firstDate = getCreatedAtDate(first)?.getTime() || 0;
      const secondDate = getCreatedAtDate(second)?.getTime() || 0;
      return secondDate - firstDate;
    })
    .slice(0, 5)
    .map((candidate, index) => ({
      id: candidate._id || index,
      name: candidate.name || 'Unknown Candidate',
      role: candidate.email || 'candidate',
      status: candidate.status || 'Pending',
      avatar: '',
    }));
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [recruiters, setRecruiters] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError('');

        const dashboardData = await getAdminDashboardData();
        setUsers(dashboardData.users);
        setCandidates(dashboardData.candidates);
        setRecruiters(dashboardData.recruiters);
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load admin dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const usersJoinedThisMonth = useMemo(() => {
    const now = new Date();
    return users.filter((user) => {
      const createdAt = getCreatedAtDate(user);
      return (
        createdAt &&
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth()
      );
    }).length;
  }, [users]);

  const profilesWithoutPhone = useMemo(
    () => users.filter((user) => !user.phone).length,
    [users],
  );

  const stats = useMemo(
    () => [
      {
        title: 'Total Users',
        value: String(users.length),
        icon: BriefcaseIcon,
        iconBg: 'bg-purple-100',
        iconColor: 'text-[#6c3fc5]',
      },
      {
        title: 'Total Candidates',
        value: String(candidates.length),
        icon: UsersIcon,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      {
        title: 'Total Recruiters',
        value: String(recruiters.length),
        icon: UserPlusIcon,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-500',
      },
      {
        title: 'Joined This Month',
        value: String(usersJoinedThisMonth),
        icon: CalendarIcon,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
      },
      {
        title: 'Profiles Missing Phone',
        value: String(profilesWithoutPhone),
        icon: TrendingUpIcon,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
      },
    ],
    [users.length, candidates.length, recruiters.length, usersJoinedThisMonth, profilesWithoutPhone],
  );

  const chartData = useMemo(() => buildChartData(users), [users]);

  const recentApplications = useMemo(
    () => buildRecentApplications(candidates),
    [candidates],
  );

  const panelNotifications = useMemo(() => {
    const latestCandidate = [...candidates]
      .sort((first, second) => {
        const firstDate = getCreatedAtDate(first)?.getTime() || 0;
        const secondDate = getCreatedAtDate(second)?.getTime() || 0;
        return secondDate - firstDate;
      })
      .at(0);

    return [
      {
        id: 1,
        color: 'bg-red-500',
        content: (
          <>
            <strong>New candidate</strong> registered: <strong>{latestCandidate?.name || 'N/A'}</strong>
          </>
        ),
        time: 'Just now',
      },
      {
        id: 2,
        color: 'bg-green-500',
        content: (
          <>
            Total recruiters available: <strong>{recruiters.length}</strong>
          </>
        ),
        time: 'Live update',
      },
      {
        id: 3,
        color: 'bg-yellow-500',
        content: (
          <>
            Total candidates available: <strong>{candidates.length}</strong>
          </>
        ),
        time: 'Live update',
      },
      {
        id: 4,
        color: 'bg-yellow-500',
        content: (
          <>
            Total users in platform: <strong>{users.length}</strong>
          </>
        ),
        time: null,
      },
    ];
  }, [users.length, candidates, recruiters.length]);

  const sidebarNotifications = useMemo(
    () => [
      {
        id: 1,
        icon: MonitorIcon,
        content: (
          <>
            <strong>Users joined this month</strong>
            <br />
            {usersJoinedThisMonth}
          </>
        ),
        unread: usersJoinedThisMonth > 0,
      },
      {
        id: 2,
        icon: ListIcon,
        content: (
          <>
            Total recruiter accounts
            <br />
            <strong>{recruiters.length}</strong>
          </>
        ),
        unread: recruiters.length > 0,
      },
      {
        id: 3,
        icon: ClockIcon,
        content: (
          <>
            Profiles missing phone
            <br />
            <strong>{profilesWithoutPhone}</strong>
          </>
        ),
        unread: profilesWithoutPhone > 0,
      },
    ],
    [usersJoinedThisMonth, recruiters.length, profilesWithoutPhone],
  );

  return (
    <div className="min-h-screen bg-[#f0f0f5] font-sans flex flex-col">
      <Header active="Dashboard" role="admin" />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="space-y-6">
          {error ?
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div> :

          null}

          {/* Top Stats Row */}
          <StatsCards stats={stats} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column (Chart & Main Notifications) */}
            <div className="xl:col-span-2 space-y-6">
              <ApplicationsChart data={chartData} />
              <NotificationsPanel notifications={panelNotifications} />
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">
              <RecentApplications applications={recentApplications} />
              <NotificationsSidebar notifications={sidebarNotifications} />
            </div>
          </div>

          {isLoading ?
          <div className="text-sm text-gray-500">Loading dashboard data...</div> :

          null}
        </div>
      </main>

      <Footer />
    </div>);

}