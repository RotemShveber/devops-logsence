'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ErrorCard from '@/components/dashboard/ErrorCard';
import { ArrowLeft, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface Log {
  id: string;
  source: string;
  timestamp: string;
  message: string;
  category: string;
  severity: string;
  errorType?: string;
  suggestedFix?: string;
}

function FilteredLogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const filterSource = searchParams.get('source');
  const filterCategory = searchParams.get('category');
  const filterSeverity = searchParams.get('severity');

  useEffect(() => {
    fetchLogs();
  }, [filterSource, filterCategory, filterSeverity]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filterSource) params.append('source', filterSource);
      if (filterCategory) params.append('category', filterCategory);
      if (filterSeverity) params.append('severity', filterSeverity);

      const response = await fetch(`/api/logs?${params.toString()}`);
      const data = await response.json();

      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterTitle = () => {
    const parts = [];
    if (filterSeverity) parts.push(filterSeverity.toUpperCase());
    if (filterCategory) parts.push(filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1));
    if (filterSource) parts.push(filterSource.charAt(0).toUpperCase() + filterSource.slice(1));
    return parts.join(' - ') + ' Logs';
  };

  const handleNavigate = (type: 'source' | 'category' | 'severity', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`/logs?${params.toString()}`);
  };

  return (
    <DashboardLayout>
      <div className="p-8 text-white">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{getFilterTitle()}</h1>
              <p className="text-gray-400">
                {loading ? 'Loading...' : `${logs.length} log${logs.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-blue-300">Active Filters:</span>
            {filterSource && (
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                Source: {filterSource}
              </span>
            )}
            {filterCategory && (
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                Category: {filterCategory}
              </span>
            )}
            {filterSeverity && (
              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">
                Severity: {filterSeverity}
              </span>
            )}
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Filter className="mx-auto text-blue-400 animate-spin" size={48} />
              <p className="text-xl mt-4 text-gray-400">Loading logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700 rounded-full mb-6">
              <Filter className="text-gray-400" size={40} />
            </div>
            <p className="text-xl text-gray-300 mb-2">No logs found</p>
            <p className="text-gray-400">Try adjusting your filters or check back later</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <ErrorCard
                key={log.id || index}
                severity={log.severity}
                category={log.category}
                source={log.source}
                message={log.message}
                timestamp={log.timestamp}
                suggestedFix={log.suggestedFix}
                index={index}
                onCategoryClick={(category) => handleNavigate('category', category)}
                onSeverityClick={(severity) => handleNavigate('severity', severity)}
                onSourceClick={(source) => handleNavigate('source', source)}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function FilteredLogsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="p-8 text-white">
          <div className="max-w-7xl mx-auto text-center py-12">
            <div className="animate-pulse">
              <Filter className="mx-auto text-blue-400 animate-spin" size={48} />
              <p className="text-xl mt-4 text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    }>
      <FilteredLogsContent />
    </Suspense>
  );
}
