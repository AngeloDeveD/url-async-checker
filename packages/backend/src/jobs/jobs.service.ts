import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CreateJobDto,
  CreateJobResponseDto,
  JobDetailDto,
  JobStats,
  JobSummaryDto,
} from '@url-checker/shared';
import { JobsRepository } from './jobs.repository';
import { JobWorkerService } from './job-worker.service';
import { JobEntity, JobItemEntity } from './entities/job.entity';

@Injectable()
export class JobsService {
  constructor(
    @Inject(JobsRepository)
    private readonly jobsRepository: JobsRepository,
    @Inject(forwardRef(() => JobWorkerService))
    private readonly jobWorkerService: JobWorkerService,
  ) {}

  public createJob(dto: CreateJobDto): CreateJobResponseDto {
    const jobId = randomUUID();
    const now = new Date().toISOString();

    const items: JobItemEntity[] = dto.urls.map((url) => ({
      url: url.trim(),
      status: 'pending',
    }));

    const newJob: JobEntity = {
      id: jobId,
      createdAt: now,
      status: 'pending',
      urls: items,
    };

    this.jobsRepository.save(newJob);

    // Запускаем фоновую проверку
    this.jobWorkerService.processJob(jobId);

    return { jobId };
  }

  public getAllJobs(): JobSummaryDto[] {
    const jobs = this.jobsRepository.findAll();
    return jobs.map((job) => this.mapToSummary(job));
  }

  public getJobById(id: string): JobDetailDto {
    const job = this.jobsRepository.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with ID "${id}" not found`);
    }

    return this.mapToDetail(job);
  }

  public cancelJob(id: string): JobDetailDto {
    const job = this.jobsRepository.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with ID "${id}" not found`);
    }

    this.jobWorkerService.cancelJob(id);
    return this.getJobById(id);
  }

  public calculateStats(urls: JobItemEntity[]): JobStats {
    const stats: JobStats = {
      total: urls.length,
      processed: 0,
      success: 0,
      error: 0,
      pending: 0,
      inProgress: 0,
      cancelled: 0,
    };

    for (const item of urls) {
      switch (item.status) {
        case 'success':
          stats.success++;
          stats.processed++;
          break;
        case 'error':
          stats.error++;
          stats.processed++;
          break;
        case 'cancelled':
          stats.cancelled++;
          stats.processed++;
          break;
        case 'in_progress':
          stats.inProgress++;
          break;
        case 'pending':
        default:
          stats.pending++;
          break;
      }
    }

    return stats;
  }

  private mapToSummary(job: JobEntity): JobSummaryDto {
    return {
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      stats: this.calculateStats(job.urls),
    };
  }

  private mapToDetail(job: JobEntity): JobDetailDto {
    return {
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      stats: this.calculateStats(job.urls),
      urls: job.urls,
    };
  }
}