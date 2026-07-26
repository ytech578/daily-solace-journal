import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly refresh cookie
});

// Attach access token from memory store on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try to refresh once then redirect to login
// IMPORTANT: Skip this interceptor for the /auth/refresh endpoint itself
// to prevent redirect loops when no session exists.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshEndpoint = original?.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && !original._retry && !isRefreshEndpoint) {
      original._retry = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// In-memory access token (never stored in localStorage)
let _accessToken: string | null = null;
export function getAccessToken() { return _accessToken; }
export function setAccessToken(t: string | null) { _accessToken = t; }
