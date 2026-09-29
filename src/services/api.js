import axios from 'axios';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredAuth,
  clearStoredAuth,
} from '../utils/tokenStorage.js';

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5091/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Shared in-flight refresh promise to prevent concurrent duplicate refresh requests
let refreshPromise = null;

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Reuses active in-flight refresh promise if multiple calls occur concurrently.
 * @returns {Promise<{ accessToken: string, refreshToken: string, expiresIn: number|null, mustChangePassword: boolean, role: string|null, user: object|null, isAuthenticated: boolean } | null>}
 */
export async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredAuth();
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseURL = api.defaults.baseURL || 'http://localhost:5091/api';
      // Use raw axios to prevent the refresh request itself from triggering the response interceptor
      const response = await axios.post(
        `${baseURL}/Auth/refresh`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const data = response.data;
      if (!data || !data.accessToken) {
        throw new Error('Invalid refresh response: missing access token');
      }

      const updatedAuth = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        expiresIn: data.expiresIn !== undefined && data.expiresIn !== null ? Number(data.expiresIn) : null,
        mustChangePassword: Boolean(data.mustChangePassword),
        role: data.role || data.user?.role || null,
        user: data.user || null,
        isAuthenticated: true,
      };

      setStoredAuth(updatedAuth);
      return updatedAuth;
    } catch (error) {
      clearStoredAuth();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Request Interceptor: Injects Bearer token if present and not already provided
api.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers = config.headers || {};
      const hasAuth =
        (typeof config.headers.get === 'function' && config.headers.get('Authorization')) ||
        config.headers.Authorization ||
        config.headers.authorization;

      if (!hasAuth) {
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catches 401s, attempts refresh once, and retries original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    // Only handle 401 Unauthorized responses
    if (!error?.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Do NOT intercept if:
    // 1. Missing original request config
    // 2. Request has already been retried once (_retry)
    // 3. Request was to /Auth/refresh (prevent infinite loop)
    // 4. Request was to /Auth/login (invalid credentials should not refresh)
    const requestUrl = originalRequest?.url || '';
    if (
      !originalRequest ||
      originalRequest._retry ||
      requestUrl.includes('/Auth/refresh') ||
      requestUrl.includes('/Auth/login')
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearStoredAuth();
      return Promise.reject(error);
    }

    // Mark as retried to ensure original request is only retried exactly once
    originalRequest._retry = true;

    try {
      const authResult = await refreshAccessToken();
      if (!authResult || !authResult.accessToken) {
        clearStoredAuth();
        return Promise.reject(error);
      }

      // Update original request headers with new access token
      originalRequest.headers = originalRequest.headers || {};
      if (typeof originalRequest.headers.set === 'function') {
        originalRequest.headers.set('Authorization', `Bearer ${authResult.accessToken}`);
      } else {
        originalRequest.headers.Authorization = `Bearer ${authResult.accessToken}`;
      }

      // Retry original request exactly once
      return api(originalRequest);
    } catch {
      clearStoredAuth();
      return Promise.reject(error);
    }
  }
);

export default api;
