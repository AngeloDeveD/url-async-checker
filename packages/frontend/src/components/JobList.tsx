import React from 'react';
import { RotateCw, Inbox, Check, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useJobsStore } from '../store/useJobsStore';
import { StatusBadge } from './StatusBadge';

export const JobList: React.FC = () => {
  const { jobs, activeJobId, selectJob, fetchJobs, isLoadingList } = useJobsStore();

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Job History</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {jobs.length}
          </span>
        </div>
        <button
          onClick={() => fetchJobs()}
          disabled={isLoadingList}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
          title="Refresh jobs list"
        >
          <RotateCw className={clsx('w-4 h-4', isLoadingList && 'animate-spin text-indigo-600')} />
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-lg">
          <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-600">No verification jobs yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Submit URLs above to create your first job.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {jobs.map((job) => {
            const isSelected = activeJobId === job.id;
            const progressPercent = job.stats.total > 0
              ? Math.round((job.stats.processed / job.stats.total) * 100)
              : 0;

            return (
              <div
                key={job.id}
                onClick={() => selectJob(job.id)}
                className={clsx(
                  'p-3.5 rounded-xl border transition-all cursor-pointer text-left',
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50',
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-800">
                      #{job.id.slice(0, 8)}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(job.createdAt)}</span>
                  </div>
                  <StatusBadge status={job.status} size="sm" />
                </div>

                {/* Статистика */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                  <span className="text-[11px]">
                    {job.stats.processed} / {job.stats.total} checked
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    {job.stats.success > 0 && (
                      <span className="flex items-center gap-0.5 text-emerald-600">
                        <Check className="w-3 h-3" /> {job.stats.success}
                      </span>
                    )}
                    {job.stats.error > 0 && (
                      <span className="flex items-center gap-0.5 text-rose-600">
                        <AlertTriangle className="w-3 h-3" /> {job.stats.error}
                      </span>
                    )}
                  </div>
                </div>

                {/* Мини прогресс-бар */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full transition-all duration-300',
                      job.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600',
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};