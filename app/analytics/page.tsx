'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const errorTrendData = [
  { time: '00:00', errors: 12, warnings: 23 },
  { time: '04:00', errors: 19, warnings: 31 },
  { time: '08:00', errors: 45, warnings: 52 },
  { time: '12:00', errors: 38, warnings: 41 },
  { time: '16:00', errors: 52, warnings: 48 },
  { time: '20:00', errors: 28, warnings: 35 },
];

const sourcesData = [
  { name: 'Docker', logs: 1250 },
  { name: 'Kubernetes', logs: 2340 },
  { name: 'Jenkins', logs: 890 },
  { name: 'EC2', logs: 1560 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <DashboardLayout>
      <div className="p-8 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Analytics & Insights</h1>
                <p className="text-gray-400">Deep dive into your log data</p>
              </div>
              <div className="flex gap-2">
                {['1h', '6h', '24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      timeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity size={20} className="text-blue-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp size={16} />
                  <span>12%</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Total Events</p>
              <p className="text-2xl font-bold text-white">5,043</p>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <BarChart3 size={20} className="text-red-400" />
                </div>
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <TrendingUp size={16} />
                  <span>8%</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Error Rate</p>
              <p className="text-2xl font-bold text-white">3.2%</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <TrendingUp size={20} className="text-yellow-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingDown size={16} />
                  <span>5%</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold text-white">245ms</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity size={20} className="text-purple-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp size={16} />
                  <span>24%</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Active Services</p>
              <p className="text-2xl font-bold text-white">42</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Error Trends */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                Error & Warning Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={errorTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="warnings" stroke="#eab308" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sources Distribution */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                Logs by Source
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourcesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="logs" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Issues */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
              Top Issues This Week
            </h3>
            <div className="space-y-4">
              {[
                { issue: 'Connection timeout to database', count: 234, trend: '+12%' },
                { issue: 'Out of memory errors', count: 189, trend: '+8%' },
                { issue: 'API rate limit exceeded', count: 156, trend: '-5%' },
                { issue: 'File not found errors', count: 142, trend: '+3%' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-200">{item.issue}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-bold text-white">{item.count}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.trend.startsWith('+') ? 'text-red-400 bg-red-500/20' : 'text-green-400 bg-green-500/20'}`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
