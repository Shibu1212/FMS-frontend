import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
  subscribeAuthChange,
  setPasswordChanged as storageSetPasswordChanged,
} from '../utils/tokenStorage.js';
import { refreshAccessToken as apiRefreshAccessToken } from '../services/api.js';
export const ROLES = {
  ADMIN: 'ADMIN',
  FORM_CREATOR: 'FORM_CREATOR',
  FORM_VIEWER: 'FORM_VIEWER',       
};

export function hasRole(userRole, requiredRole, { exact = false } = {}) {
  if (!userRole || !requiredRole) return false;
  if (userRole === requiredRole) return true;
  if (!exact && userRole === ROLES.ADMIN) return true;
  return false;
}

export function hasAnyRole(userRole, allowedRoles, { exact = false } = {}) {
  if (!userRole || !Array.isArray(allowedRoles) || allowedRoles.length === 0) return false;
  if (allowedRoles.includes(userRole)) return true;
  if (!exact && userRole === ROLES.ADMIN) return true;
  return false;
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Synchronously restore authentication state from browser storage on initial render
  const [auth, setAuth] = useState(() => getStoredAuth());

  // Listen to storage changes (e.g. from Axios 401 interceptor token refresh or clear)
  useEffect(() => {
    const unsubscribe = subscribeAuthChange((newAuth) => {
      setAuth(newAuth);
    });
    return unsubscribe;
  }, []);

  const role = auth.role;
  const user = auth.user;

  const login = useCallback((authData) => {
    if (!authData || !authData.accessToken) {
      console.warn('Attempted to log in without a valid access token.');
      return;
    }

    setStoredAuth(authData);

    setAuth({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken || null,
      expiresIn: authData.expiresIn !== undefined && authData.expiresIn !== null ? Number(authData.expiresIn) : null,
      mustChangePassword: Boolean(authData.mustChangePassword),
      role: authData.role || authData.user?.role || null,
      user: authData.user || null,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();

    setAuth({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      mustChangePassword: false,
      role: null,
      user: null,
      isAuthenticated: false,
    });
  }, []);

  const setPasswordChanged = useCallback(() => {
    storageSetPasswordChanged();
    setAuth((prev) => ({
      ...prev,
      refreshToken: null,
      mustChangePassword: false,
    }));
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshed = await apiRefreshAccessToken();
      if (refreshed) {
        setAuth(refreshed);
        return refreshed;
      }
      return null;
    } catch (err) {
      logout();
      throw err;
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      isAuthenticated: auth.isAuthenticated,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      expiresIn: auth.expiresIn,
      mustChangePassword: auth.mustChangePassword,
      role,
      user,
      login,
      logout,
      setPasswordChanged,
      refreshAccessToken,
    }),
    [auth, role, user, login, logout, setPasswordChanged, refreshAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
