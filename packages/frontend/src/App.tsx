import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { CreateJobForm } from './components/CreateJobForm';
import { JobList } from './components/JobList';
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
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex justify-between items-center shadow-sm">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="font-semibold underline hover:text-rose-900 ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          <CreateJobForm />
          <JobList />
        </div>
      }
      rightColumn={
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 py-24">
          <p className="text-sm font-medium text-slate-600">No Job Selected</p>
          <p className="text-xs text-slate-400 mt-1">
            Select a job from the history list or start a new check to view live status details.
          </p>
        </div>
      }
    />
  );
};