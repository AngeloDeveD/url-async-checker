import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import {
  CreateJobResponseDto,
  JobDetailDto,
  JobSummaryDto,
} from '@url-checker/shared';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(
    @Inject(JobsService)
    private readonly jobsService: JobsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createJob(@Body() dto: CreateJobDto): CreateJobResponseDto {
    return this.jobsService.createJob(dto);
  }

  @Get()
  getAllJobs(): JobSummaryDto[] {
    return this.jobsService.getAllJobs();
  }

  @Get(':id')
  getJobById(@Param('id') id: string): JobDetailDto {
    return this.jobsService.getJobById(id);
  }

  @Delete(':id')
  cancelJob(@Param('id') id: string): JobDetailDto {
    return this.jobsService.cancelJob(id);
  }
}