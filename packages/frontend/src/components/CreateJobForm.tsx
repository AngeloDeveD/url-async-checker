import React, { useState } from 'react';
import { Play, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { useJobsStore } from '../store/useJobsStore';

const SAMPLE_URLS = [
  'https://google.com',
  'https://github.com',
  'https://cloudflare.com',
  'https://httpstat.us/404',
  'https://httpstat.us/500',
  'https://wikipedia.org',
  'https://non-existent-domain-test-12345.com',
  'https://apple.com',
].join('\n');

export const CreateJobForm: React.FC = () => {
  const [urlsText, setUrlsText] = useState('');
  const { createJob, isCreating } = useJobsStore();

  const urlList = urlsText
    .split('\n')
    .map((u) => u.trim())
    .filter((u) => u.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlList.length === 0 || isCreating) return;

    const successJobId = await createJob(urlList);
    if (successJobId) {
      setUrlsText('');
    }
  };

  const handleInsertSample = () => {
    setUrlsText(SAMPLE_URLS);
  };

  const handleClear = () => {
    setUrlsText('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">New Check Job</h2>
          <p className="text-xs text-slate-500">Enter one URL per line</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInsertSample}
            disabled={isCreating}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample URLs</span>
          </button>
          {urlsText && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isCreating}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="relative">
          <textarea
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            disabled={isCreating}
            rows={5}
            placeholder="https://example.com&#10;https://google.com&#10;https://github.com"
            className="w-full text-xs sm:text-sm font-mono p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
          />
          <div className="absolute bottom-2.5 right-2.5 text-[11px] font-medium text-slate-400 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
            {urlList.length} {urlList.length === 1 ? 'URL' : 'URLs'}
          </div>
        </div>

        <button
          type="submit"
          disabled={urlList.length === 0 || isCreating}
          className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-medium text-sm py-2.5 px-4 rounded-lg shadow-sm transition-all duration-150"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Starting Check...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Start Verification ({urlList.length})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};