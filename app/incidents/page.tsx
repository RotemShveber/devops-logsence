'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Shield } from 'lucide-react';

export default function IncidentsPage() {
  return (
    <DashboardLayout>
      <div className="p-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Incident Management</h1>
            <p className="text-gray-400">Track and manage system incidents</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 min-h-[600px]">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Shield className="mx-auto text-blue-400 mb-4" size={48} />
                <p className="text-xl text-gray-300 mb-2">Incident Dashboard</p>
                <p className="text-gray-400">Incident tracking and resolution workflow</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
