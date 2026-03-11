import { useAuthStore } from '../stores/auth.store';
import { authApi, LoginPayload } from '../api/auth.api';

export function useAuth() {
  const { user, accessToken, setAuth, logout: storeLogout } = useAuthStore();

  const login = async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    const { user: u, accessToken: at, refreshToken: rt } = (res as { data: { user: typeof user; accessToken: string; refreshToken: string } }).data;
    if (u && at && rt) setAuth(u as NonNullable<typeof user>, at, rt);
    return res;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    storeLogout();
  };

  return { user, isAuthenticated: !!accessToken, login, logout };
}
