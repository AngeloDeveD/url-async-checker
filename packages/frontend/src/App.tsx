import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { CreateJobForm } from './components/CreateJobForm';
import { JobList } from './components/JobList';
import { ActiveJobDetail } from './components/ActiveJobDetail';
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
      rightColumn={<ActiveJobDetail />}
    />
  );
};