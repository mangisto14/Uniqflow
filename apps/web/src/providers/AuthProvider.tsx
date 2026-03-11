import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { authApi } from '../api/auth.api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      authApi
        .me()
        .then((res: unknown) => {
          const data = (res as { data: { user: Parameters<typeof setAuth>[0] } }).data;
          if (data?.user) {
            setAuth(data.user, accessToken, useAuthStore.getState().refreshToken ?? '');
          }
        })
        .catch(() => logout());
    }
  }, []);

  return <>{children}</>;
}
