'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogSource } from '@/lib/types';
import StatCard from '@/components/dashboard/StatCard';
import CategoryChart from '@/components/dashboard/CategoryChart';
import ErrorCard from '@/components/dashboard/ErrorCard';
import LogCollectionForm from '@/components/dashboard/LogCollectionForm';
import { Activity, AlertTriangle, FileText, TrendingUp } from 'lucide-react';

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
  const router = useRouter();
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

  const collectLogs = async (source: LogSource, config: any) => {
    setCollecting(true);
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, config }),
      });

      const data = await response.json();
      await fetchAnalytics();
    } catch (error) {
      console.error('Error collecting logs:', error);
    } finally {
      setCollecting(false);
    }
  };

  // Navigate to filtered view
  const navigateToFiltered = (type: 'source' | 'category' | 'severity', value: string) => {
    router.push(`/logs?${type}=${value}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Activity className="text-blue-400" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                DevOps LogSense
              </h1>
              <p className="text-gray-400">AI-Powered Log Analysis & Monitoring</p>
            </div>
          </div>
        </div>

        {/* Collection Controls */}
        <LogCollectionForm
          onCollect={collectLogs}
          onRefresh={fetchAnalytics}
          collecting={collecting}
          loading={loading}
        />

        {loading && !analytics ? (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Activity className="mx-auto text-blue-400 animate-spin" size={48} />
              <p className="text-xl mt-4 text-gray-400">Loading analytics...</p>
            </div>
          </div>
        ) : analytics ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">
              <StatCard
                title="Total Logs"
                value={analytics.totalLogs}
                icon={FileText}
                color="blue"
                onClick={() => router.push('/logs')}
              />
              <StatCard
                title="Errors"
                value={analytics.errorCount}
                icon={AlertTriangle}
                color="red"
                onClick={() => navigateToFiltered('severity', 'error')}
              />
              <StatCard
                title="Warnings"
                value={analytics.warningCount}
                icon={TrendingUp}
                color="yellow"
                onClick={() => navigateToFiltered('severity', 'warning')}
              />
            </div>

            {/* Categories & Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  Error Categories
                </h3>
                <CategoryChart
                  data={analytics.categorySummary}
                  onCategoryClick={(category) => navigateToFiltered('category', category)}
                />
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  Log Sources
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.sourceSummary)
                    .filter(([_, count]) => count > 0)
                    .sort(([_, a], [__, b]) => b - a)
                    .map(([source, count]) => (
                      <button
                        key={source}
                        onClick={() => navigateToFiltered('source', source)}
                        className="w-full flex items-center justify-between p-3 rounded-lg transition-all bg-gray-700/50 hover:bg-blue-600 hover:ring-2 hover:ring-blue-400 group"
                      >
                        <span className="capitalize font-medium group-hover:text-white">{source}</span>
                        <span className="px-3 py-1 rounded-full font-semibold bg-blue-500/20 text-blue-300 group-hover:bg-white/20 group-hover:text-white transition-colors">
                          {count}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Top Error Types */}
            {analytics.topErrorTypes.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl mb-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  Top Error Types
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.topErrorTypes.map(({ type, count }) => (
                    <div key={type} className="flex justify-between items-center bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600">
                      <span className="font-mono text-sm text-gray-200">{type}</span>
                      <span className="bg-gradient-to-r from-red-600 to-red-700 px-3 py-1 rounded-full text-sm font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Errors */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                Recent Errors
              </h3>
              <div className="space-y-4">
                {analytics.recentErrors.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-400">No errors found</p>
                  </div>
                ) : (
                  analytics.recentErrors.slice(0, 10).map((log, index) => (
                    <ErrorCard
                      key={index}
                      severity={log.severity}
                      category={log.category}
                      source={log.source}
                      message={log.message}
                      timestamp={log.timestamp}
                      suggestedFix={log.suggestedFix}
                      index={index}
                      onCategoryClick={(category) => navigateToFiltered('category', category)}
                      onSeverityClick={(severity) => navigateToFiltered('severity', severity)}
                      onSourceClick={(source) => navigateToFiltered('source', source)}
                    />
                  ))
                )}
              </div>
              {analytics.recentErrors.length > 10 && (
                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    Showing 10 of {analytics.recentErrors.length} errors
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 mt-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-6">
              <FileText className="text-blue-400" size={40} />
            </div>
            <p className="text-xl text-gray-300 mb-2">No data available</p>
            <p className="text-gray-400">Start by collecting logs from your sources</p>
          </div>
        )}
      </div>
    </div>
  );
}
