// Статусы задания и ссылок
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
export type UrlStatus = 'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';

// Результат проверки отдельного URL
export interface UrlCheckResult {
  url: string;
  status: UrlStatus;
  httpStatus?: number;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}

// Статистика задания
export interface JobStats {
  total: number;
  processed: number;
  success: number;
  error: number;
  pending: number;
  inProgress: number;
  cancelled: number;
}

// Краткая инфо (GET /api/jobs)
export interface JobSummaryDto {
  id: string;
  createdAt: string;
  status: JobStatus;
  stats: JobStats;
}

// Детальная инфо (GET /api/jobs/:id)
export interface JobDetailDto {
  id: string;
  createdAt: string;
  status: JobStatus;
  stats: JobStats;
  urls: UrlCheckResult[];
}

// DTO создания
export interface CreateJobDto {
  urls: string[];
}

// Ответ на создание
export interface CreateJobResponseDto {
  jobId: string;
}