'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Bell, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const mockAlerts = [
  {
    id: 1,
    title: 'High Error Rate Detected',
    description: 'Error rate has exceeded 5% threshold in the last 15 minutes',
    severity: 'critical',
    source: 'docker',
    timestamp: new Date(Date.now() - 5 * 60000),
    status: 'active',
  },
  {
    id: 2,
    title: 'CPU Usage Spike',
    description: 'CPU usage reached 95% on production server',
    severity: 'warning',
    source: 'kubernetes',
    timestamp: new Date(Date.now() - 20 * 60000),
    status: 'active',
  },
  {
    id: 3,
    title: 'Database Connection Pool Exhausted',
    description: 'All database connections are in use',
    severity: 'critical',
    source: 'ec2',
    timestamp: new Date(Date.now() - 45 * 60000),
    status: 'resolved',
  },
];

export default function AlertsPage() {
  const activeAlerts = mockAlerts.filter(a => a.status === 'active');
  const resolvedAlerts = mockAlerts.filter(a => a.status === 'resolved');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500/20 to-red-600/20 border-red-500/50 text-red-400';
      case 'warning':
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-400';
      default:
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Alert Management</h1>
                <p className="text-gray-400">Monitor and manage system alerts</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-400" />
                    <span className="text-sm text-red-400 font-medium">{activeAlerts.length} Active Alerts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-white">{activeAlerts.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Resolved Today</p>
                  <p className="text-2xl font-bold text-white">{resolvedAlerts.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Avg Response Time</p>
                  <p className="text-2xl font-bold text-white">12m</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded-full"></div>
              Active Alerts
            </h2>
            <div className="space-y-4">
              {activeAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${getSeverityColor(alert.severity)} border rounded-xl p-6`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                          {alert.severity}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-gray-700 text-gray-300">
                          {alert.source}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{alert.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock size={14} />
                        <span>{alert.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                        Acknowledge
                      </button>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium">
                        Resolve
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Resolved Alerts */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              Recently Resolved
            </h2>
            <div className="space-y-4">
              {resolvedAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 opacity-60"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-500">
                          Resolved
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-gray-700 text-gray-300">
                          {alert.source}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3">{alert.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{alert.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
