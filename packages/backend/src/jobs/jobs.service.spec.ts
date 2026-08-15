import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsRepository } from './jobs.repository';
import { JobWorkerService } from './job-worker.service';
import { JobItemEntity } from './entities/job.entity';

describe('JobsService', () => {
  let service: JobsService;
  let repository: JobsRepository;
  let workerService: JobWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        JobsRepository,
        {
          provide: JobWorkerService,
          useValue: {
            processJob: jest.fn(),
            cancelJob: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    repository = module.get<JobsRepository>(JobsRepository);
    workerService = module.get<JobWorkerService>(JobWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a job with pending status and trigger background worker', () => {
      const dto = { urls: ['https://example.com', 'https://google.com'] };
      const result = service.createJob(dto);

      expect(result).toHaveProperty('jobId');
      expect(typeof result.jobId).toBe('string');

      const created = service.getJobById(result.jobId);
      expect(created.status).toBe('pending');
      expect(created.urls).toHaveLength(2);
      expect(created.urls[0].status).toBe('pending');
      expect(workerService.processJob).toHaveBeenCalledWith(result.jobId);
    });
  });

  describe('getJobById', () => {
    it('should throw NotFoundException when job does not exist', () => {
      expect(() => service.getJobById('non-existent-id')).toThrow(NotFoundException);
    });
  });

  describe('calculateStats', () => {
    it('should correctly calculate statistics for various URL statuses', () => {
      const items: JobItemEntity[] = [
        { url: 'https://a.com', status: 'success' },
        { url: 'https://b.com', status: 'error' },
        { url: 'https://c.com', status: 'in_progress' },
        { url: 'https://d.com', status: 'pending' },
        { url: 'https://e.com', status: 'cancelled' },
      ];

      const stats = service.calculateStats(items);
      expect(stats.total).toBe(5);
      expect(stats.processed).toBe(3); // success + error + cancelled
      expect(stats.success).toBe(1);
      expect(stats.error).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.cancelled).toBe(1);
    });
  });
});