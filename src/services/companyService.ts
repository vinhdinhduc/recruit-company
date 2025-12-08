import api from './api';

export const companyService = {
  getMyCompany: async () => {
    const response = await api.get('/company');
    return response.data;
  },

  createCompany: async (data: any) => {
    const response = await api.post('/company', data);
    return response.data;
  },

  updateCompany: async (data: FormData) => {
    const response = await api.put('/company', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCompanyById: async (id: number) => {
    const response = await api.get(`/company/${id}`);
    return response.data;
  },

  getAllCompanies: async (filters?: { page?: number; limit?: number; search?: string; city?: string; industry?: string }) => {
    const response = await api.get('/company/list', { params: filters });
    return response.data;
  },
};
