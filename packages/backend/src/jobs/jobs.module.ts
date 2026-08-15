import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsRepository } from './jobs.repository';
import { JobWorkerService } from './job-worker.service';

@Module({
  controllers: [JobsController],
  providers: [JobsRepository, JobWorkerService, JobsService],
  exports: [JobsService, JobsRepository, JobWorkerService],
})
export class JobsModule {}