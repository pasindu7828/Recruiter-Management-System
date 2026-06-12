//ApplicationGrowthChart.jsx
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-xs shadow-sm">
        <p className="text-gray-700 font-semibold m-0">
          {label}: <span className="text-emerald-500">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Helper function to get application date
const getApplicationDate = (application) => {
  // Use createdAt (from timestamps) first, fallback to date field if needed
  if (application.createdAt) {
    return new Date(application.createdAt);
  }
  if (application.date) {
    return new Date(application.date);
  }
  if (application.appliedDate) {
    return new Date(application.appliedDate);
  }
  return null;
};

// Main Application Growth Chart Component
export default function ApplicationGrowthChart({ applications = [] }) {
  const [period, setPeriod] = useState('Monthly');

  const generateGrowthData = (applications, selectedPeriod) => {
    if (!applications || applications.length === 0) {
      return [];
    }

    const now = new Date();

    switch (selectedPeriod) {
      case 'Daily': {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyData = {};

        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayName = days[date.getDay()];
          const dateStr = date.toDateString();
          dailyData[dateStr] = {
            label: i === 0 ? 'Today' : dayName,
            count: 0,
            fullDate: date,
          };
        }

        applications.forEach((app) => {
          const appDate = getApplicationDate(app);
          if (appDate) {
            const diffDays = Math.floor(
              (now - appDate) / (1000 * 60 * 60 * 24),
            );

            if (diffDays <= 6 && diffDays >= 0) {
              const dateStr = appDate.toDateString();
              if (dailyData[dateStr]) {
                dailyData[dateStr].count++;
              }
            }
          }
        });

        return Object.values(dailyData)
          .sort((a, b) => a.fullDate - b.fullDate)
          .map((item) => ({
            label: item.label,
            apps: item.count,
          }));
      }

      case 'Yearly': {
        const yearlyData = {};
        const currentYear = now.getFullYear();

        for (let i = 4; i >= 0; i--) {
          const year = currentYear - i;
          yearlyData[year] = {
            label: year.toString(),
            count: 0,
            sortKey: year,
          };
        }

        applications.forEach((app) => {
          const appDate = getApplicationDate(app);
          if (appDate) {
            const year = appDate.getFullYear();
            const yearDiff = currentYear - year;

            if (yearDiff <= 4 && yearDiff >= 0) {
              if (yearlyData[year]) {
                yearlyData[year].count++;
              }
            }
          }
        });

        return Object.values(yearlyData)
          .sort((a, b) => a.sortKey - b.sortKey)
          .map((item) => ({
            label: item.label,
            apps: item.count,
          }));
      }

      case 'Monthly':
      default: {
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const monthlyData = {};

        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          monthlyData[monthKey] = {
            label: months[date.getMonth()],
            count: 0,
            year: date.getFullYear(),
            month: date.getMonth(),
            sortKey: date.getTime(),
          };
        }

        applications.forEach((app) => {
          const appDate = getApplicationDate(app);
          if (appDate) {
            const monthDiff =
              (now.getFullYear() - appDate.getFullYear()) * 12 +
              (now.getMonth() - appDate.getMonth());

            if (monthDiff <= 11 && monthDiff >= 0) {
              const monthKey = `${appDate.getFullYear()}-${appDate.getMonth()}`;
              if (monthlyData[monthKey]) {
                monthlyData[monthKey].count++;
              }
            }
          }
        });

        return Object.values(monthlyData)
          .sort((a, b) => a.sortKey - b.sortKey)
          .map((item) => ({
            label:
              item.month === now.getMonth() && item.year === now.getFullYear()
                ? `${item.label} ${item.year}`
                : item.label,
            apps: item.count,
          }));
      }
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const cyclePeriod = () => {
    const periods = ['Daily', 'Monthly', 'Yearly'];
    const currentIndex = periods.indexOf(period);
    const nextIndex = (currentIndex + 1) % periods.length;
    handlePeriodChange(periods[nextIndex]);
  };

  const growthData = generateGrowthData(applications, period);

  // If no data, show empty state
  if (growthData.length === 0 || applications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-[20px_22px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-[13px] font-extrabold text-gray-900">
            Application Growth
          </h2>
          <button
            onClick={cyclePeriod}
            className="text-[12px] text-gray-500 flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1 bg-white hover:bg-gray-50 transition-colors"
          >
            {period} <span className="text-[10px]">▾</span>
          </button>
        </div>
        <div className="w-full h-[160px] flex items-center justify-center">
          <p className="text-gray-400 text-sm">No application data available</p>
        </div>
        <div className="mt-2 text-[10px] text-gray-400 text-right">
          {period === 'Daily' && 'Last 7 days'}
          {period === 'Monthly' && 'Last 12 months'}
          {period === 'Yearly' && 'Last 5 years'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-[20px_22px]">
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-[13px] font-extrabold text-gray-900">
          Application Growth
        </h2>
        <button
          onClick={cyclePeriod}
          className="text-[12px] text-gray-500 flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1 bg-white hover:bg-gray-50 transition-colors"
          title={`Switch to ${
            period === 'Daily'
              ? 'Monthly'
              : period === 'Monthly'
                ? 'Yearly'
                : 'Daily'
          } view`}
        >
          {period} <span className="text-[10px]">▾</span>
        </button>
      </div>

      {/* Chart Container  */}
      <div className="w-full h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={growthData}
            margin={{ top: 5, right: 8, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="apps"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#appGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: '#10b981',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Period Description */}
      <div className="mt-2 text-[10px] text-gray-400 text-right">
        {period === 'Daily' && 'Last 7 days'}
        {period === 'Monthly' && 'Last 12 months'}
        {period === 'Yearly' && 'Last 5 years'}
      </div>
    </div>
  );
}