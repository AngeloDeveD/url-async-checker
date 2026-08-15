import { create } from 'zustand';
import { JobDetailDto, JobSummaryDto } from '@url-checker/shared';
import { jobsApi } from '../api/jobs.api';

interface JobsState {
  jobs: JobSummaryDto[];
  activeJobId: string | null;
  activeJobDetail: JobDetailDto | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  isCreating: boolean;
  error: string | null;

  // Actions
  fetchJobs: () => Promise<void>;
  selectJob: (jobId: string) => Promise<void>;
  createJob: (urls: string[]) => Promise<string | null>;
  cancelActiveJob: () => Promise<void>;
  setActiveJobDetail: (detail: JobDetailDto) => void;
  clearError: () => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  activeJobId: null,
  activeJobDetail: null,
  isLoadingList: false,
  isLoadingDetail: false,
  isCreating: false,
  error: null,

  fetchJobs: async () => {
    set({ isLoadingList: true, error: null });
    try {
      const data = await jobsApi.getJobs();
      set({ jobs: data, isLoadingList: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch jobs list',
        isLoadingList: false,
      });
    }
  },

  selectJob: async (jobId: string) => {
    // Если уже выбрано это задание, не сбрасываем состояние
    if (get().activeJobId === jobId && get().activeJobDetail) {
      return;
    }

    set({ activeJobId: jobId, activeJobDetail: null, isLoadingDetail: true, error: null });

    try {
      const detail = await jobsApi.getJobById(jobId);
      // Проверяем, что пользователь не переключился на другое задание, пока шел запрос
      if (get().activeJobId === jobId) {
        set({ activeJobDetail: detail, isLoadingDetail: false });
      }
    } catch (err: any) {
      if (get().activeJobId === jobId) {
        set({
          error: err.response?.data?.message || `Failed to fetch job #${jobId}`,
          isLoadingDetail: false,
        });
      }
    }
  },

  createJob: async (urls: string[]) => {
    set({ isCreating: true, error: null });
    try {
      const { jobId } = await jobsApi.createJob({ urls });
      set({ isCreating: false });

      // Обновляем список заданий и автоматически делаем созданное активным
      await get().fetchJobs();
      await get().selectJob(jobId);

      return jobId;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to create job',
        isCreating: false,
      });
      return null;
    }
  },

  cancelActiveJob: async () => {
    const { activeJobId } = get();
    if (!activeJobId) return;

    try {
      const updatedDetail = await jobsApi.cancelJob(activeJobId);
      set({ activeJobDetail: updatedDetail });
      await get().fetchJobs();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to cancel job' });
    }
  },

  setActiveJobDetail: (detail: JobDetailDto) => {
    // Защита от race condition: обновляем детали только если ID совпадает с активным
    if (get().activeJobId === detail.id) {
      set({ activeJobDetail: detail });
    }
  },

  clearError: () => set({ error: null }),
}));