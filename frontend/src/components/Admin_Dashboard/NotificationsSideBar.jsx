import React from 'react';
import { MonitorIcon, ListIcon, ClockIcon } from 'lucide-react';
const defaultNotifications = [
  {
    id: 1,
    icon: MonitorIcon,
    content:
    <>
          <strong>New application</strong> received
          <br />
          for UI/UX Designer
        </>,

    unread: true
  },
  {
    id: 2,
    icon: ListIcon,
    content:
    <>
          Interview scheduled with
          <br />
          <strong>David Johnson</strong>
        </>,

    unread: true
  },
  {
    id: 3,
    icon: ClockIcon,
    content:
    <>
          <strong>Reminder:</strong> Interview with
          <br />
          <strong>Sarah Miller</strong> today at 1:00 PM
        </>,

    unread: true
  }];

export function NotificationsSidebar({ notifications = [] }) {
  const items = notifications.length > 0 ? notifications : defaultNotifications;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[#1a1060]">Notifications</h2>
        <a
          href="#"
          className="text-sm font-medium text-[#6c3fc5] hover:underline">
          
          View All
        </a>
      </div>

      <div className="space-y-5">
        {items.map((notif) => {
          const Icon = notif.icon;
          return (
            <div key={notif.id} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6c3fc5] flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 leading-snug">
                  {notif.content}
                </p>
              </div>
              {notif.unread &&
              <span className="w-2 h-2 rounded-full bg-[#6c3fc5] mt-1.5 flex-shrink-0" />
              }
            </div>);

        })}
      </div>
    </div>);

}