import { Inject, Injectable } from '@nestjs/common';
import { UrlStatus } from '@url-checker/shared';
import { JobsRepository } from './jobs.repository';

interface ActiveJobControl {
  isCancelled: boolean;
}

@Injectable()
export class JobWorkerService {
  private static readonly MAX_CONCURRENCY = 5;
  private readonly activeJobs = new Map<string, ActiveJobControl>();

  constructor(
    @Inject(JobsRepository)
    private readonly jobsRepository: JobsRepository,
  ) {}

  public processJob(jobId: string): void {
    const job = this.jobsRepository.findById(jobId);
    if (!job) return;

    // Регистрируем управление заданием
    const control: ActiveJobControl = { isCancelled: false };
    this.activeJobs.set(jobId, control);

    // Запускаем асинхронную обработку в фоне (fire-and-forget)
    this.executeJob(jobId, control).catch((err) => {
      console.error(`Error processing job ${jobId}:`, err);
    });
  }

  public cancelJob(jobId: string): boolean {
    const control = this.activeJobs.get(jobId);
    const job = this.jobsRepository.findById(jobId);
    if (!job) return false;

    // Помечаем флаг отмены для остановки воркера
    if (control) {
      control.isCancelled = true;
    }

    // Все URL, которые еще не начаты, помечаем cancelled
    const updatedUrls = job.urls.map((item) => {
      if (item.status === 'pending') {
        return {
          ...item,
          status: 'cancelled' as UrlStatus,
        };
      }
      return item;
    });

    this.jobsRepository.update(jobId, {
      status: 'cancelled',
      urls: updatedUrls,
    });

    this.activeJobs.delete(jobId);
    return true;
  }

  private async executeJob(jobId: string, control: ActiveJobControl): Promise<void> {
    const job = this.jobsRepository.findById(jobId);
    if (!job || control.isCancelled) return;

    // Переводим задание в статус in_progress
    this.jobsRepository.update(jobId, { status: 'in_progress' });

    const totalUrls = job.urls.length;
    let nextIndex = 0;

    // Функция безопасного получения следующего индекса URL для воркера
    const getNextIndex = (): number | null => {
      if (nextIndex < totalUrls) {
        const current = nextIndex;
        nextIndex++;
        return current;
      }
      return null;
    };

    // Одиночный воркер (поток выполнения)
    const worker = async () => {
      while (true) {
        if (control.isCancelled) break;

        const index = getNextIndex();
        if (index === null) break;

        await this.processSingleUrl(jobId, index, control);
      }
    };

    // Создаем пул не более MAX_CONCURRENCY параллельных воркеров
    const concurrency = Math.min(JobWorkerService.MAX_CONCURRENCY, totalUrls);
    const workerPromises = Array.from({ length: concurrency }, () => worker());

    await Promise.all(workerPromises);

    // Завершение работы: если не было отменено, обновляем итоговый статус
    if (!control.isCancelled) {
      const finalJob = this.jobsRepository.findById(jobId);
      if (finalJob && finalJob.status !== 'cancelled') {
        this.jobsRepository.update(jobId, { status: 'completed' });
      }
      this.activeJobs.delete(jobId);
    }
  }

  private async processSingleUrl(
    jobId: string,
    urlIndex: number,
    control: ActiveJobControl,
  ): Promise<void> {
    if (control.isCancelled) return;

    const job = this.jobsRepository.findById(jobId);
    if (!job) return;

    const target = job.urls[urlIndex];
    if (!target || target.status !== 'pending') return;

    const startedAt = new Date();

    // 1. Помечаем URL как in_progress
    job.urls[urlIndex] = {
      ...target,
      status: 'in_progress',
      startedAt: startedAt.toISOString(),
    };
    this.jobsRepository.update(jobId, { urls: [...job.urls] });

    // 2. Выполняем HTTP HEAD запрос
    const checkResult = await this.performHeadRequest(target.url);

    // 3. Искусственная задержка от 0 до 10 секунд по требованию ТЗ
    const randomDelayMs = Math.floor(Math.random() * 10001);
    await this.delay(randomDelayMs);

    // Если задание отменили во время ожидания/запроса
    if (control.isCancelled) return;

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    // 4. Фиксируем результат проверки
    const currentJob = this.jobsRepository.findById(jobId);
    if (!currentJob) return;

    currentJob.urls[urlIndex] = {
      ...currentJob.urls[urlIndex],
      status: checkResult.status,
      httpStatus: checkResult.httpStatus,
      error: checkResult.error,
      finishedAt: finishedAt.toISOString(),
      durationMs,
    };

    this.jobsRepository.update(jobId, { urls: [...currentJob.urls] });
  }

  private async performHeadRequest(urlStr: string): Promise<{
    status: UrlStatus;
    httpStatus?: number;
    error?: string;
  }> {
    let targetUrl = urlStr.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 сек таймаут

    try {
      const response = await fetch(targetUrl, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'UrlAsyncChecker/1.0',
        },
      });

      clearTimeout(timeoutId);

      // Коды 2xx и 3xx считаем успехом
      const isSuccess = response.status >= 200 && response.status < 400;

      return {
        status: isSuccess ? 'success' : 'error',
        httpStatus: response.status,
        error: isSuccess ? undefined : `HTTP ${response.status} ${response.statusText || 'Error'}`,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      let errorMessage = err.message || 'Network request failed';
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out (15s limit)';
      }

      return {
        status: 'error',
        error: errorMessage,
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}