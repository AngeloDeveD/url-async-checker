import { JobStatus, UrlStatus, UrlCheckResult } from '@url-checker/shared';

export interface JobItemEntity extends UrlCheckResult {
  url: string;
  status: UrlStatus;
  httpStatus?: number;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}

export interface JobEntity {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: JobItemEntity[];
}