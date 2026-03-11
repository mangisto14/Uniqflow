import { apiClient } from './client';

export const usersApi = {
  list: (page = 1, limit = 20) => apiClient.get(`/users?page=${page}&limit=${limit}`),
  get: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: unknown) => apiClient.post('/users', data),
  update: (id: string, data: unknown) => apiClient.put(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};
