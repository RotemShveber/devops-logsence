'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Server, Box, Wrench, Cloud } from 'lucide-react';
import { LogSource } from '@/lib/types';

interface LogCollectionFormProps {
  onCollect: (source: LogSource, config: any) => Promise<void>;
  onRefresh: () => void;
  collecting: boolean;
  loading: boolean;
}

const sourceIcons = {
  [LogSource.KUBERNETES]: Server,
  [LogSource.DOCKER]: Box,
  [LogSource.JENKINS]: Wrench,
  [LogSource.EC2]: Cloud,
};

export default function LogCollectionForm({
  onCollect,
  onRefresh,
  collecting,
  loading,
}: LogCollectionFormProps) {
  const [selectedSource, setSelectedSource] = useState<LogSource | ''>('');
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<any>({});

  const handleCollect = async () => {
    if (!selectedSource) return;

    let finalConfig = { ...config };

    if (selectedSource === LogSource.JENKINS && !config.baseUrl) {
      const baseUrl = prompt('Enter Jenkins URL:');
      if (!baseUrl) return;
      finalConfig.baseUrl = baseUrl;
    } else if (selectedSource === LogSource.EC2 && !config.region) {
      const region = prompt('Enter AWS region (e.g., us-east-1):');
      if (!region) return;
      finalConfig.region = region;
    }

    await onCollect(selectedSource, finalConfig);
    setConfig({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Download className="text-blue-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Collect Logs</h2>
          <p className="text-sm text-gray-400">Select a source to start collecting logs</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value as LogSource)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Select Log Source</option>
            {Object.values(LogSource).map((source) => {
              const Icon = sourceIcons[source];
              return (
                <option key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCollect}
            disabled={collecting || !selectedSource}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <Download size={18} />
            {collecting ? 'Collecting...' : 'Collect'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
