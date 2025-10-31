'use client';

import { useState, useEffect } from 'react';
import { LogSource } from '@/lib/types';

interface Analytics {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  categorySummary: Record<string, number>;
  sourceSummary: Record<string, number>;
  topErrorTypes: Array<{ type: string; count: number }>;
  recentErrors: Array<any>;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<LogSource | ''>('');
  const [collecting, setCollecting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const collectLogs = async () => {
    if (!selectedSource) {
      alert('Please select a log source');
      return;
    }

    setCollecting(true);
    try {
      const config: any = {};

      // Add source-specific config prompts
      if (selectedSource === LogSource.JENKINS) {
        const baseUrl = prompt('Enter Jenkins URL:');
        if (!baseUrl) return;
        config.baseUrl = baseUrl;
      } else if (selectedSource === LogSource.EC2) {
        const region = prompt('Enter AWS region (e.g., us-east-1):');
        if (!region) return;
        config.region = region;
      }

      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: selectedSource, config }),
      });

      const data = await response.json();
      alert(`Collected and analyzed ${data.analyzed} logs`);
      fetchAnalytics();
    } catch (error) {
      console.error('Error collecting logs:', error);
      alert('Failed to collect logs');
    } finally {
      setCollecting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      network: 'bg-purple-500',
      permissions: 'bg-orange-500',
      resource: 'bg-red-500',
      config: 'bg-blue-500',
      application: 'bg-green-500',
      security: 'bg-pink-500',
      performance: 'bg-yellow-500',
      unknown: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">DevOps LogSense</h1>
          <p className="text-gray-400">AI-Powered Log Analysis & Monitoring</p>
        </div>

        {/* Collection Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Collect Logs</h2>
          <div className="flex gap-4">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as LogSource)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg flex-1"
            >
              <option value="">Select Source</option>
              <option value={LogSource.KUBERNETES}>Kubernetes</option>
              <option value={LogSource.DOCKER}>Docker</option>
              <option value={LogSource.JENKINS}>Jenkins</option>
              <option value={LogSource.EC2}>AWS EC2</option>
            </select>
            <button
              onClick={collectLogs}
              disabled={collecting || !selectedSource}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium"
            >
              {collecting ? 'Collecting...' : 'Collect Logs'}
            </button>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && !analytics ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading analytics...</div>
          </div>
        ) : analytics ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Total Logs</h3>
                <p className="text-3xl font-bold">{analytics.totalLogs}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Errors</h3>
                <p className="text-3xl font-bold text-red-500">{analytics.errorCount}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Warnings</h3>
                <p className="text-3xl font-bold text-yellow-500">{analytics.warningCount}</p>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Error Categories</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.categorySummary)
                    .filter(([_, count]) => count > 0)
                    .sort(([_, a], [__, b]) => b - a)
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
                          <span className="capitalize">{category}</span>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Log Sources</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.sourceSummary)
                    .filter(([_, count]) => count > 0)
                    .map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className="capitalize">{source}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Top Error Types */}
            {analytics.topErrorTypes.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Top Error Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.topErrorTypes.map(({ type, count }) => (
                    <div key={type} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                      <span className="font-mono text-sm">{type}</span>
                      <span className="bg-red-600 px-3 py-1 rounded text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Errors */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Errors</h3>
              <div className="space-y-3">
                {analytics.recentErrors.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No errors found</p>
                ) : (
                  analytics.recentErrors.map((log, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(log.category)}`}>
                            {log.category}
                          </span>
                          <span className="px-2 py-1 text-xs rounded bg-gray-600">
                            {log.source}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-mono text-sm mb-2">{log.message}</p>
                      {log.suggestedFix && (
                        <div className="mt-2 p-2 bg-blue-900/30 rounded border border-blue-700">
                          <p className="text-xs text-blue-300">
                            <strong>Suggested Fix:</strong> {log.suggestedFix}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No data available. Start by collecting logs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
