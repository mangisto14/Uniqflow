import { apiClient } from './client';

export const svgTemplatesApi = {
  list: (page = 1, limit = 20, activeOnly = false) =>
    apiClient.get(`/svg-templates?page=${page}&limit=${limit}&activeOnly=${activeOnly}`),
  get: (id: string) => apiClient.get(`/svg-templates/${id}`),
  create: (data: unknown) => apiClient.post('/svg-templates', data),
  update: (id: string, data: unknown) => apiClient.put(`/svg-templates/${id}`, data),
  delete: (id: string) => apiClient.delete(`/svg-templates/${id}`),
};
