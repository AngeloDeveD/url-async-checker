import React, { useState } from 'react';
import {
  Ban,
  Copy,
  Check,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Layers,
} from 'lucide-react';
import clsx from 'clsx';
import { useJobsStore } from '../store/useJobsStore';
import { StatusBadge } from './StatusBadge';
import { useJobPolling } from '../hooks/useJobPolling';

export const ActiveJobDetail: React.FC = () => {
  // Подключаем автоматический поллинг
  useJobPolling();

  const { activeJobDetail, isLoadingDetail, cancelActiveJob } = useJobsStore();
  const [copied, setCopied] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (isLoadingDetail && !activeJobDetail) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-600 mt-3">Loading job details...</p>
      </div>
    );
  }

  if (!activeJobDetail) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm py-28">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No Job Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Choose a job from the history list on the left or create a new verification job to view live results.
        </p>
      </div>
    );
  }

  const { id, createdAt, status, stats, urls } = activeJobDetail;
  const isRunning = status === 'pending' || status === 'in_progress';
  const progressPercent = stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelActiveJob();
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      {/* Шапка активного задания */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
              #{id}
            </span>
            <button
              onClick={handleCopyId}
              className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
              title="Copy Job ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Created at: {formatDate(createdAt)}
          </p>
        </div>

        {isRunning && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shrink-0 disabled:opacity-50"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{isCancelling ? 'Cancelling...' : 'Cancel Job'}</span>
          </button>
        )}
      </div>

      {/* Метрики со счетчиками */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
          <p className="text-[11px] font-medium text-slate-500">Total URLs</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
        </div>
        <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-lg text-center">
          <p className="text-[11px] font-medium text-emerald-700 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Success
          </p>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">{stats.success}</p>
        </div>
        <div className="bg-rose-50/60 border border-rose-100 p-3 rounded-lg text-center">
          <p className="text-[11px] font-medium text-rose-700 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" /> Errors
          </p>
          <p className="text-xl font-bold text-rose-700 mt-0.5">{stats.error}</p>
        </div>
        <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-lg text-center">
          <p className="text-[11px] font-medium text-amber-700 flex items-center justify-center gap-1">
            <Hourglass className="w-3 h-3" /> Remaining
          </p>
          <p className="text-xl font-bold text-amber-700 mt-0.5">
            {stats.pending + stats.inProgress}
          </p>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Processing Progress</span>
          <span>
            {stats.processed} of {stats.total} processed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all duration-500 rounded-full',
              status === 'completed'
                ? 'bg-emerald-500'
                : status === 'cancelled'
                ? 'bg-slate-400'
                : 'bg-indigo-600',
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Таблица со списком URL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            URL Check Results ({urls.length})
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            HTTP HEAD Requests (0–10s delay simulation)
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5">Target URL</th>
                  <th scope="col" className="px-3.5 py-2.5">Status</th>
                  <th scope="col" className="px-3.5 py-2.5">HTTP Code</th>
                  <th scope="col" className="px-3.5 py-2.5">Duration</th>
                  <th scope="col" className="px-3.5 py-2.5">Details / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {urls.map((item, idx) => {
                  const isSuccess = item.status === 'success';
                  const isError = item.status === 'error';

                  return (
                    <tr key={`${item.url}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                      {/* URL */}
                      <td className="px-3.5 py-3 font-mono text-[11px] text-slate-800 max-w-[220px] truncate" title={item.url}>
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.url}</span>
                        </div>
                      </td>

                      {/* Статус */}
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      {/* HTTP код */}
                      <td className="px-3.5 py-3 whitespace-nowrap font-mono text-[11px]">
                        {item.httpStatus ? (
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded font-bold',
                              isSuccess && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                              isError && 'bg-rose-50 text-rose-700 border border-rose-200',
                            )}
                          >
                            {item.httpStatus}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Длительность */}
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {item.durationMs !== undefined ? `${item.durationMs.toLocaleString()} ms` : '—'}
                      </td>

                      {/* Сообщение об ошибке / Детали */}
                      <td className="px-3.5 py-3 text-[11px] text-slate-500 max-w-[200px] truncate">
                        {item.error ? (
                          <span className="text-rose-600 font-medium" title={item.error}>
                            {item.error}
                          </span>
                        ) : item.status === 'success' ? (
                          <span className="text-emerald-600 font-medium">OK</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};