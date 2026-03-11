import { apiClient } from './client';

export const processesApi = {
  list: (page = 1, limit = 20) => apiClient.get(`/processes?page=${page}&limit=${limit}`),
  get: (id: string) => apiClient.get(`/processes/${id}`),
  create: (data: unknown) => apiClient.post('/processes', data),
  update: (id: string, data: unknown) => apiClient.put(`/processes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/processes/${id}`),
  publish: (id: string) => apiClient.post(`/processes/${id}/publish`),
  duplicate: (id: string) => apiClient.post(`/processes/${id}/duplicate`),
};
