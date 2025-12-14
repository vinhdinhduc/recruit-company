import api from './api';

export const adminService = {
  // Dashboard Statistics
  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  // Company Management
  getAllCompanies: async (params?: { page?: number; limit?: number; search?: string; status?: string; verified?: boolean }) => {
    const response = await api.get('/admin/companies', { params });
    return response.data;
  },

  updateCompanyStatus: async (id: number, status: string) => {
    const response = await api.put(`/admin/companies/${id}/status`, { status });
    return response.data;
  },

  updateCompanyVerification: async (id: number, verified: boolean) => {
    const response = await api.put(`/admin/companies/${id}/verify`, { verified });
    return response.data;
  },

  deleteCompany: async (id: number) => {
    const response = await api.delete(`/admin/companies/${id}`);
    return response.data;
  },

  // Job Management
  getAllJobs: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const response = await api.get('/admin/jobs', { params });
    return response.data;
  },

  getPendingJobs: async () => {
    const response = await api.get('/admin/jobs/pending');
    return response.data;
  },

  approveJob: async (id: number) => {
    const response = await api.put(`/admin/jobs/${id}/approve`);
    return response.data;
  },

  rejectJob: async (id: number, reason?: string) => {
    const response = await api.put(`/admin/jobs/${id}/reject`, { reason });
    return response.data;
  },

  updateJobStatus: async (id: number, status: string) => {
    const response = await api.put(`/admin/jobs/${id}/status`, { status });
    return response.data;
  },

  deleteJob: async (id: number) => {
    const response = await api.delete(`/admin/jobs/${id}`);
    return response.data;
  },

  // Application Management
  getAllApplications: async (params?: { page?: number; limit?: number; company_id?: number; job_id?: number; status?: string }) => {
    const response = await api.get('/admin/applications', { params });
    return response.data;
  },

  deleteApplication: async (id: number) => {
    const response = await api.delete(`/admin/applications/${id}`);
    return response.data;
  },
};
