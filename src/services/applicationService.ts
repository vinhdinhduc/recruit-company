import api from './api';

export const applicationService = {
  applyJob: async (data: FormData) => {
    const response = await api.post('/applications', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/applications/my-applications');
    return response.data;
  },

  getCompanyApplications: async (filters?: { job_id?: number; status?: string }) => {
    const response = await api.get('/applications/company-applications', { params: filters });
    return response.data;
  },

  updateApplicationStatus: async (id: number, data: { status: string; notes?: string }) => {
    const response = await api.put(`/applications/${id}/status`, data);
    return response.data;
  },

  withdrawApplication: async (id: number) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};
