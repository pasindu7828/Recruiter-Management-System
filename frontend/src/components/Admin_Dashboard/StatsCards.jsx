import React from 'react';
import {
  BriefcaseIcon,
  UsersIcon,
  UserPlusIcon,
  CalendarIcon,
  TrendingUpIcon } from
'lucide-react';
const defaultStats = [
  {
    title: 'Total Job Posts',
    value: '24',
    icon: BriefcaseIcon,
    iconBg: 'bg-purple-100',
    iconColor: 'text-[#6c3fc5]'
  },
  {
    title: 'Total Applicants',
    value: '350',
    icon: UsersIcon,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Pending Applications',
    value: '18',
    icon: UserPlusIcon,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500'
  },
  {
    title: 'Interviews Scheduled',
    value: '12',
    icon: CalendarIcon,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    title: 'Hired Candidates',
    value: '45',
    icon: TrendingUpIcon,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  }];

export function StatsCards({ stats = [] }) {
  const cards = stats.length > 0 ? stats : defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
            
            {/* Background decorative shape approximation */}
            <div
              className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20 ${stat.iconBg}`} />
            

            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-500 mb-1">
                {stat.title}
              </p>
              <h3 className="text-3xl font-bold text-[#1a1060]">
                {stat.value}
              </h3>
            </div>

            <div
              className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center ${stat.iconBg}`}>
              
              <Icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>);

      })}
    </div>);

}