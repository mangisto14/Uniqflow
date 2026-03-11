import { apiClient } from './client';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; name: string; password: string; }

export const authApi = {
  login: (data: LoginPayload) => apiClient.post('/auth/login', data),
  register: (data: RegisterPayload) => apiClient.post('/auth/register', data),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
};
