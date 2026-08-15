import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { useJobsStore } from './store/useJobsStore';

export const App: React.FC = () => {
  const { fetchJobs, error, clearError } = useJobsStore();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <Layout
      leftColumn={
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-xs font-semibold underline hover:text-rose-900"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 py-12">
            Job Creation Form & History List will be rendered here.
          </div>
        </div>
      }
      rightColumn={
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 py-12">
          Active Job Details & Live Status will be rendered here.
        </div>
      }
    />
  );
};