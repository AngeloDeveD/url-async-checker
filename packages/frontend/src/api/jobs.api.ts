import axios from 'axios';
import {
  CreateJobDto,
  CreateJobResponseDto,
  JobDetailDto,
  JobSummaryDto,
} from '@url-checker/shared';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jobsApi = {
  // Получить список всех заданий
  async getJobs(): Promise<JobSummaryDto[]> {
    const response = await apiClient.get<JobSummaryDto[]>('/jobs');
    return response.data;
  },

  // Получить детальную информацию по заданию
  async getJobById(id: string): Promise<JobDetailDto> {
    const response = await apiClient.get<JobDetailDto>(`/jobs/${id}`);
    return response.data;
  },

  // Создать новое задание на проверку
  async createJob(dto: CreateJobDto): Promise<CreateJobResponseDto> {
    const response = await apiClient.post<CreateJobResponseDto>('/jobs', dto);
    return response.data;
  },

  // Отменить выполнение задания
  async cancelJob(id: string): Promise<JobDetailDto> {
    const response = await apiClient.delete<JobDetailDto>(`/jobs/${id}`);
    return response.data;
  },
};