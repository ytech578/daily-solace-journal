import { create } from 'zustand';
import axios from 'axios';
import { api, setAccessToken } from '@/lib/api';

export type Role = 'AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMIN';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  institution?: string;
  country?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    set({ user: data.user });
  },

  logout: async () => {
    await api.post('/auth/logout').catch(() => {});
    setAccessToken(null);
    set({ user: null });
  },

  fetchMe: async () => {
    try {
      // Use plain axios (no interceptor) so a missing session fails silently
      // without triggering the redirect-to-login interceptor.
      const { data: refreshData } = await axios.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true }
      );
      setAccessToken(refreshData.accessToken);
      const { data: meData } = await api.get('/users/me');
      set({ user: meData, isLoading: false });
    } catch {
      // No active session — that's fine, just mark as loaded with no user
      set({ user: null, isLoading: false });
    }
  },
}));
