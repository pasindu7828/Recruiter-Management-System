import React from 'react';
const defaultApplications = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Software Engineer',
    status: 'Pending',
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: 2,
    name: 'Sarah Miller',
    role: 'Product Manager',
    status: 'Shortlisted',
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 3,
    name: 'David Johnson',
    role: 'Data Analyst',
    status: 'Shortlisted',
    avatar: 'https://i.pravatar.cc/150?img=8'
  },
  {
    id: 4,
    name: 'Emma Wilson',
    role: 'Marketing Specialist',
    status: 'Rejected',
    avatar: 'https://i.pravatar.cc/150?img=9'
  },
  {
    id: 5,
    name: 'James Smith',
    role: 'Sales Executive',
    status: 'Pending',
    avatar: 'https://i.pravatar.cc/150?img=13'
  }];

const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export function RecentApplications({ applications = [] }) {
  const items = applications.length > 0 ? applications : defaultApplications;

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#fef3c7] text-[#b45309]';
      case 'Shortlisted':
        return 'bg-[#dcfce7] text-[#166534]';
      case 'Rejected':
        return 'bg-[#fee2e2] text-[#991b1b]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[#1a1060]">
          Recent Applications
        </h2>
      </div>

      <div className="space-y-5">
        {items.map((app) =>
        <div key={app.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {app.avatar ?
            <img
              src={app.avatar}
              alt={app.name}
              className="w-10 h-10 rounded-full object-cover" /> :

            <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6c3fc5] flex items-center justify-center text-xs font-bold">
                  {getInitials(app.name)}
                </div>
            }
            
              <div>
                <h4 className="text-sm font-bold text-[#1a1060]">{app.name}</h4>
                <p className="text-xs text-gray-500">{app.role}</p>
              </div>
            </div>
            <span
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusStyles(app.status)}`}>
            
              {app.status}
            </span>
          </div>
        )}
      </div>
    </div>);

}