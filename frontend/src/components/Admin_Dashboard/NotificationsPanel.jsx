import React from 'react';
import { BellIcon, MoreHorizontalIcon } from 'lucide-react';
const defaultNotifications = [
  {
    id: 1,
    color: 'bg-red-500',
    content:
    <>
          <strong>New application</strong> received for{' '}
          <strong>UI/UX Designer</strong>
        </>,

    time: '5 minutes ago'
  },
  {
    id: 2,
    color: 'bg-green-500',
    content:
    <>
          Interview scheduled with <strong>David Johnson</strong>
        </>,

    time: '1 hour ago'
  },
  {
    id: 3,
    color: 'bg-yellow-500',
    content:
    <>
          Reminder. Interview with <strong>Sarah Miller</strong> today at 1:00
          PM
        </>,

    time: '3 hours ago'
  },
  {
    id: 4,
    color: 'bg-yellow-500',
    content:
    <>
          <strong>New firms:</strong> Meeting Sales Executive
        </>,

    time: null
  }];

export function NotificationsPanel({ notifications = [] }) {
  const items = notifications.length > 0 ? notifications : defaultNotifications;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-[#1a1060]" />
          <h2 className="text-lg font-bold text-[#1a1060]">Notifications</h2>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button className="text-[#6c3fc5] hover:underline">
            Mark All as Read
          </button>
          <button className="text-[#6c3fc5] hover:underline">View All</button>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((notif) =>
        <div key={notif.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
              className={`w-3 h-3 rounded-full ${notif.color} flex-shrink-0`} />
            
              <p className="text-sm text-gray-700">{notif.content}</p>
            </div>
            {notif.time ?
          <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                {notif.time}
              </span> :

          <button className="text-gray-400 hover:text-gray-600 ml-4">
                <MoreHorizontalIcon className="h-5 w-5" />
              </button>
          }
          </div>
        )}
      </div>
    </div>);

}