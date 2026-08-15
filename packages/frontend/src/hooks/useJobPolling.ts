import { useEffect, useRef } from 'react';
import { useJobsStore } from '../store/useJobsStore';
import { jobsApi } from '../api/jobs.api';

const POLLING_INTERVAL_MS = 1500;

export const useJobPolling = () => {
  const { activeJobId, activeJobDetail, setActiveJobDetail, fetchJobs } = useJobsStore();
  const currentJobIdRef = useRef<string | null>(activeJobId);

  // Синхронизация ref текущего активного ID для предотвращения race condition
  useEffect(() => {
    currentJobIdRef.current = activeJobId;
  }, [activeJobId]);

  useEffect(() => {
    if (!activeJobId) return;

    // Терминальные статусы, завершающие периодический опрос
    const isTerminal =
      activeJobDetail?.status === 'completed' ||
      activeJobDetail?.status === 'cancelled' ||
      activeJobDetail?.status === 'failed';

    if (isTerminal) return;

    const poll = async () => {
      try {
        const polledJobId = activeJobId;
        const freshDetail = await jobsApi.getJobById(polledJobId);

        // Проверка race condition: фиксация данных только при совпадении с активным ID
        if (currentJobIdRef.current === polledJobId) {
          setActiveJobDetail(freshDetail);

          // Обновление сводного списка заданий при переходе в терминальный статус
          if (
            freshDetail.status === 'completed' ||
            freshDetail.status === 'cancelled' ||
            freshDetail.status === 'failed'
          ) {
            fetchJobs();
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    const intervalId = setInterval(poll, POLLING_INTERVAL_MS);

    // Очистка таймера при смене activeJobId или размонтировании компонента
    return () => {
      clearInterval(intervalId);
    };
  }, [activeJobId, activeJobDetail?.status, setActiveJobDetail, fetchJobs]);
};