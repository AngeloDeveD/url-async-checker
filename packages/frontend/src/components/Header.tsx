import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-indigo-100 shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              URL Async Checker
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Asynchronous Multi-URL Health & Status Monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Max 5 Concurrency / Job</span>
        </div>
      </div>
    </header>
  );
};