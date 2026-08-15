import { Injectable } from '@nestjs/common';
import { JobEntity } from './entities/job.entity';

@Injectable()
export class JobsRepository {
  private readonly storage = new Map<string, JobEntity>();

  public save(job: JobEntity): JobEntity {
    this.storage.set(job.id, job);
    return job;
  }

  public findById(id: string): JobEntity | undefined {
    return this.storage.get(id);
  }

  public findAll(): JobEntity[] {
    return Array.from(this.storage.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  public update(id: string, partial: Partial<JobEntity>): JobEntity | undefined {
    const job = this.storage.get(id);
    if (!job) return undefined;

    const updated = { ...job, ...partial };
    this.storage.set(id, updated);
    return updated;
  }
}