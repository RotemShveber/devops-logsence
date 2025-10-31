'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Database, Plus } from 'lucide-react';

export default function SourcesPage() {
  return (
    <DashboardLayout>
      <div className="p-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Log Sources</h1>
                <p className="text-gray-400">Manage your log data sources</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <Plus size={20} />
                Add Source
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 min-h-[600px]">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Database className="mx-auto text-blue-400 mb-4" size={48} />
                <p className="text-xl text-gray-300 mb-2">Data Sources</p>
                <p className="text-gray-400">Configure and manage your log collection sources</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
