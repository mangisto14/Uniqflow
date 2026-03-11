import { apiClient } from './client';

export const executionsApi = {
  list: (page = 1, limit = 20) => apiClient.get(`/executions?page=${page}&limit=${limit}`),
  get: (id: string) => apiClient.get(`/executions/${id}`),
  start: (data: { processId: string }) => apiClient.post('/executions', data),
  completeStep: (id: string, sid: string, data: unknown) =>
    apiClient.post(`/executions/${id}/steps/${sid}/complete`, data),
  rejectStep: (id: string, sid: string, data: unknown) =>
    apiClient.post(`/executions/${id}/steps/${sid}/reject`, data),
  pause: (id: string) => apiClient.post(`/executions/${id}/pause`),
  resume: (id: string) => apiClient.post(`/executions/${id}/resume`),
  cancel: (id: string, reason: string) => apiClient.post(`/executions/${id}/cancel`, { reason }),
  history: (id: string) => apiClient.get(`/executions/${id}/history`),
};
