import api from './api';

export const userService = {
  // Get all users (admin)
  getAllUsers: async (params?: { page?: number; limit?: number; role?: string; search?: string; status?: string }) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  // Get user by ID (admin)
  getUserById: async (id: number) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user status (admin)
  updateUserStatus: async (id: number, status: string) => {
    const response = await api.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  // Delete user (admin)
  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};
