import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
const fallbackData = [
{
  name: 'Mar',
  value: 20
},
{
  name: 'Apr',
  value: 35
},
{
  name: 'May',
  value: 30
},
{
  name: 'Jun',
  value: 52
},
{
  name: 'Jul',
  value: 48
},
{
  name: 'Aug',
  value: 68
},
{
  name: 'Sep',
  value: 62
},
{
  name: 'Oct',
  value: 78
},
{
  name: 'Nov',
  value: 58
},
{
  name: 'Dec',
  value: 65
},
{
  name: 'Jan',
  value: 75
}];

export function ApplicationsChart({ data = [] }) {
  const chartData = data.length > 0 ? data : fallbackData;

  const maxValue = Math.max(...chartData.map((item) => Number(item.value) || 0));
  const tickStep = maxValue > 0 ? Math.ceil(maxValue / 4) : 5;
  const yTicks = [0, tickStep, tickStep * 2, tickStep * 3, tickStep * 4];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[#1a1060]">
          Applications Per Month
        </h2>
        <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
          <span>This Year</span>
          <ChevronDownIcon className="h-4 w-4" />
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0
            }}>
            
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c3fc5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6c3fc5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6" />
            
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#9ca3af',
                fontSize: 12
              }}
              dy={10} />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#9ca3af',
                fontSize: 12
              }}
              ticks={yTicks} />
            
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }} />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6c3fc5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              activeDot={{
                r: 6,
                fill: '#6c3fc5',
                stroke: '#fff',
                strokeWidth: 2
              }} />
            
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>);

}