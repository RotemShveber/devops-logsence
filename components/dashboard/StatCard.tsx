'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'red' | 'yellow' | 'green' | 'purple';
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-400',
  red: 'from-red-500/20 to-red-600/20 border-red-500/50 text-red-400',
  yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-400',
  green: 'from-green-500/20 to-green-600/20 border-green-500/50 text-green-400',
  purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/50 text-purple-400',
};

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors} border backdrop-blur-sm p-6 hover:scale-105 transition-transform duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="opacity-20">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  );
}
