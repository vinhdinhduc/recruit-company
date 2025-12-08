import api from './api';

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  city?: string;
  job_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  remote?: boolean;
  featured?: boolean;
}

export const jobService = {
  getJobs: async (filters: JobFilters = {}) => {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  },

  getJob: async (id: number) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (data: any) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  updateJob: async (id: number, data: any) => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id: number) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  getRecommendedJobs: async () => {
    const response = await api.get('/jobs/recommend');
    return response.data;
  },
};
