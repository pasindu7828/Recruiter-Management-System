// components/recruiter/NotificationWidget.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, Briefcase, CalendarClock } from 'lucide-react';
import { notificationService } from '../../services/recruiterDashboardService';

// Notification Icons mapping
const NOTIFICATION_ICONS = {
  application: {
    el: <FileText size={16} className="text-[#401A94]" />,
    bg: 'bg-purple-100',
  },
  interview: {
    el: <CalendarClock size={16} className="text-blue-500" />,
    bg: 'bg-blue-100',
  },
  job: {
    el: <Briefcase size={16} className="text-orange-500" />,
    bg: 'bg-orange-100',
  },
  default: {
    el: <Bell size={16} className="text-gray-500" />,
    bg: 'bg-gray-100',
  },
};

// Notification Item Component
const NotificationItem = ({ notification }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_status_change':
      case 'job_application':
        return NOTIFICATION_ICONS.application;
      case 'interview_scheduled':
      case 'interview_updated':
      case 'interview_cancelled':
        return NOTIFICATION_ICONS.interview;
      case 'job_posted':
        return NOTIFICATION_ICONS.job;
      default:
        return NOTIFICATION_ICONS.default;
    }
  };

  const icon = getNotificationIcon(notification.type);

  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
        notification.status === 'unread' ? 'bg-purple-50' : 'hover:bg-gray-50'
      }`}
    >
      <div
        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg ${icon.bg} flex items-center justify-center flex-shrink-0`}
      >
        {icon.el}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p
            className={`text-xs sm:text-sm flex-1 ${notification.status === 'unread' ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
          >
            {notification.title}
          </p>
          {notification.status === 'unread' && (
            <span className="w-1.5 h-1.5 bg-[#401A94] rounded-full flex-shrink-0 mt-1"></span>
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 whitespace-normal break-words">
          {notification.body}
        </p>
        <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">
          {notification.timeAgo}
        </p>
      </div>
    </div>
  );
};

// Main Notification Widget Component
export default function NotificationWidget({ limit = 3, showViewAll = true }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationSummary, setNotificationSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { notifications: notifs, summary } = await notificationService.fetchNotifications();
      // Sort notifications by createdAt in descending order to get most recent first
      const sortedNotifications = [...notifs].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sortedNotifications);
      setNotificationSummary(summary);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadNotifications();
    }
  }, []);

  const handleViewAllNotifications = () => navigate('/notifications');

  // Get the most recent notifications based on the limit
  const displayNotifications = limit ? notifications.slice(0, limit) : notifications;
  const remainingCount = notifications.length - limit;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 lg:p-[18px]">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <Bell size={16} sm:size={18} className="text-[#401A94]" />
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
            Notifications
          </h2>
          {notificationSummary?.total?.unread > 0 && (
            <span className="bg-[#401A94] text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full">
              {notificationSummary.total.unread}
            </span>
          )}
        </div>
        {showViewAll && (
          <button
            onClick={handleViewAllNotifications}
            className="text-xs sm:text-sm text-[#401A94] font-semibold hover:text-[#2f1370]"
          >
            View All
          </button>
        )}
      </div>
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#401A94] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayNotifications.length > 0 ? (
          displayNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
            />
          ))
        ) : (
          <p className="text-center py-4 text-xs sm:text-sm text-gray-400">
            No notifications
          </p>
        )}
        {showViewAll && remainingCount > 0 && (
          <button
            onClick={handleViewAllNotifications}
            className="w-full text-center text-[10px] sm:text-xs text-[#401A94] font-medium py-2 hover:bg-purple-50 rounded-lg transition-colors mt-2"
          >
            View {remainingCount} more notification{remainingCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}