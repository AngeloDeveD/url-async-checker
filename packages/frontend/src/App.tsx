import React from 'react';
import { Globe } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <header className="flex items-center gap-3 pb-6 border-b border-slate-200">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">URL Async Checker</h1>
          <p className="text-sm text-slate-500">Service for asynchronous URL status verification</p>
        </div>
      </header>

      <main className="mt-8">
        <div className="p-6 bg-white rounded-xl border border-slate-200 text-slate-600 text-sm">
          Success!
        </div>
      </main>
    </div>
  );
};