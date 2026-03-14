import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const { accessToken } = res.data.data;
          useAuthStore.getState().setTokens(accessToken, refreshToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }

    return Promise.reject(error);
  },
);
