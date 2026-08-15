import React from 'react';
import { JobStatus, UrlStatus } from '@url-checker/shared';
import { CheckCircle2, AlertCircle, Clock, Ban, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: JobStatus | UrlStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      animate: false,
    },
    success: {
      label: 'Success',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      animate: false,
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Loader2,
      animate: true,
    },
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      animate: false,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: Ban,
      animate: false,
    },
    error: {
      label: 'Error',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
      animate: false,
    },
    failed: {
      label: 'Failed',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
      animate: false,
    },
  }[status] || {
    label: status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
    animate: false,
  };

  const Icon = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium border rounded-full shrink-0',
        config.bg,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      )}
    >
      <Icon className={clsx('w-3.5 h-3.5', config.animate && 'animate-spin')} />
      <span>{config.label}</span>
    </span>
  );
};