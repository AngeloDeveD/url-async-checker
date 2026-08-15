import { Test, TestingModule } from '@nestjs/testing';
import { JobWorkerService } from './job-worker.service';
import { JobsRepository } from './jobs.repository';

describe('JobWorkerService', () => {
  let workerService: JobWorkerService;
  let repository: JobsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobWorkerService, JobsRepository],
    }).compile();

    workerService = module.get<JobWorkerService>(JobWorkerService);
    repository = module.get<JobsRepository>(JobsRepository);
  });

  it('should be defined', () => {
    expect(workerService).toBeDefined();
  });

  describe('cancelJob', () => {
    it('should cancel pending URLs and set job status to cancelled', () => {
      const jobId = 'test-job-id';
      repository.save({
        id: jobId,
        createdAt: new Date().toISOString(),
        status: 'in_progress',
        urls: [
          { url: 'https://completed.com', status: 'success', httpStatus: 200 },
          { url: 'https://pending-1.com', status: 'pending' },
          { url: 'https://pending-2.com', status: 'pending' },
        ],
      });

      const result = workerService.cancelJob(jobId);
      expect(result).toBe(true);

      const updatedJob = repository.findById(jobId);
      expect(updatedJob?.status).toBe('cancelled');
      // Завершенные ссылки не должны меняться
      expect(updatedJob?.urls[0].status).toBe('success');
      // Ожидающие ссылки должны быть отменены
      expect(updatedJob?.urls[1].status).toBe('cancelled');
      expect(updatedJob?.urls[2].status).toBe('cancelled');
    });

    it('should return false if job is not found', () => {
      const result = workerService.cancelJob('non-existing-id');
      expect(result).toBe(false);
    });
  });
});