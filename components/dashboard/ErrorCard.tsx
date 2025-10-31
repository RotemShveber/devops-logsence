'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Clock, Lightbulb } from 'lucide-react';

interface ErrorCardProps {
  severity: string;
  category: string;
  source: string;
  message: string;
  timestamp: string;
  suggestedFix?: string;
  index: number;
}

const severityConfig = {
  critical: { bg: 'bg-red-500', text: 'text-red-400', icon: '🔴' },
  error: { bg: 'bg-red-500', text: 'text-red-400', icon: '❌' },
  warning: { bg: 'bg-yellow-500', text: 'text-yellow-400', icon: '⚠️' },
  info: { bg: 'bg-blue-500', text: 'text-blue-400', icon: 'ℹ️' },
};

const categoryColors = {
  network: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  permissions: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  resource: 'bg-red-500/20 text-red-300 border-red-500/50',
  config: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  application: 'bg-green-500/20 text-green-300 border-green-500/50',
  security: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
  performance: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  unknown: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
};

export default function ErrorCard({
  severity,
  category,
  source,
  message,
  timestamp,
  suggestedFix,
  index,
}: ErrorCardProps) {
  const severityStyle = severityConfig[severity as keyof typeof severityConfig] || severityConfig.error;
  const categoryStyle = categoryColors[category as keyof typeof categoryColors] || categoryColors.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <AlertCircle className={severityStyle.text} size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${severityStyle.bg}`}>
              {severity}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${categoryStyle}`}>
              {category}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-gray-700 text-gray-300">
              {source}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
              <Clock size={12} />
              {new Date(timestamp).toLocaleString()}
            </span>
          </div>

          <p className="font-mono text-sm text-gray-200 mb-3 leading-relaxed">{message}</p>

          {suggestedFix && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-semibold text-blue-300 mb-1">Suggested Fix</p>
                  <p className="text-xs text-blue-200 leading-relaxed">{suggestedFix}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
