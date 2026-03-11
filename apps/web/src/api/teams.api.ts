import { apiClient } from './client';

export const teamsApi = {
  list: (page = 1, limit = 20) => apiClient.get(`/teams?page=${page}&limit=${limit}`),
  get: (id: string) => apiClient.get(`/teams/${id}`),
  create: (data: unknown) => apiClient.post('/teams', data),
  update: (id: string, data: unknown) => apiClient.put(`/teams/${id}`, data),
  delete: (id: string) => apiClient.delete(`/teams/${id}`),
  inbox: (id: string) => apiClient.get(`/teams/${id}/inbox`),
  received: (id: string) => apiClient.get(`/teams/${id}/received`),
  stats: (id: string) => apiClient.get(`/teams/${id}/stats`),
};
