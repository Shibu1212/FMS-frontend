const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fms_access_token',
  REFRESH_TOKEN: 'fms_refresh_token',
  EXPIRES_IN: 'fms_expires_in',
  MUST_CHANGE_PASSWORD: 'fms_must_change_password',
  ROLE: 'fms_role',
  USER: 'fms_user',
};

function isLocalStorageAvailable() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

const authSubscribers = new Set();

/**
 * Subscribes to changes in authentication storage.
 * @param {(auth: ReturnType<typeof getStoredAuth>) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function subscribeAuthChange(callback) {
  authSubscribers.add(callback);
  return () => {
    authSubscribers.delete(callback);
  };
}

function notifyAuthChange() {
  const currentAuth = getStoredAuth();
  authSubscribers.forEach((callback) => {
    try {
      callback(currentAuth);
    } catch {
      // Ignore subscriber errors
    }
  });
}

/**
 * Retrieves the stored access token from localStorage.
 * @returns {string|null}
 */
export function getStoredAccessToken() {
  if (!isLocalStorageAvailable()) return null;
  return window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Retrieves the stored refresh token from localStorage.
 * @returns {string|null}
 */
export function getStoredRefreshToken() {
  if (!isLocalStorageAvailable()) return null;
  return window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Retrieves all stored authentication details from localStorage.
 * @returns {{ accessToken: string|null, refreshToken: string|null, expiresIn: number|null, mustChangePassword: boolean, role: string|null, user: { id: number|string, name: string, email: string, role: string }|null, isAuthenticated: boolean }}
 */
export function getStoredAuth() {
  if (!isLocalStorageAvailable()) {
    return {
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      mustChangePassword: false,
      role: null,
      user: null,
      isAuthenticated: false,
    };
  }

  const accessToken = window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const expiresInRaw = window.localStorage.getItem(STORAGE_KEYS.EXPIRES_IN);
  const mustChangePasswordRaw = window.localStorage.getItem(STORAGE_KEYS.MUST_CHANGE_PASSWORD);
  const role = window.localStorage.getItem(STORAGE_KEYS.ROLE);
  const userRaw = window.localStorage.getItem(STORAGE_KEYS.USER);

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  const expiresIn = expiresInRaw ? Number(expiresInRaw) : null;
  const mustChangePassword = mustChangePasswordRaw === 'true';
  const isAuthenticated = Boolean(accessToken);

  return {
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
    expiresIn,
    mustChangePassword,
    role: role || (user?.role ?? null),
    user,
    isAuthenticated,
  };
}

/**
 * Saves authentication tokens and metadata to localStorage.
 * Note: Never store passwords!
 * @param {{ accessToken: string, refreshToken?: string, expiresIn?: number|string, mustChangePassword?: boolean, role?: string, user?: object }} authData
 */
export function setStoredAuth(authData) {
  if (!isLocalStorageAvailable() || !authData) return;

  if (authData.accessToken) {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  if (authData.refreshToken) {
    window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  if (authData.expiresIn !== undefined && authData.expiresIn !== null) {
    window.localStorage.setItem(STORAGE_KEYS.EXPIRES_IN, String(authData.expiresIn));
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.EXPIRES_IN);
  }

  if (authData.mustChangePassword !== undefined && authData.mustChangePassword !== null) {
    window.localStorage.setItem(STORAGE_KEYS.MUST_CHANGE_PASSWORD, String(Boolean(authData.mustChangePassword)));
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.MUST_CHANGE_PASSWORD);
  }

  const effectiveRole = authData.role || authData.user?.role || null;
  if (effectiveRole) {
    window.localStorage.setItem(STORAGE_KEYS.ROLE, effectiveRole);
  } else if (effectiveRole === null) {
    window.localStorage.removeItem(STORAGE_KEYS.ROLE);
  }

  if (authData.user) {
    window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
  } else if (authData.user === null) {
    window.localStorage.removeItem(STORAGE_KEYS.USER);
  }

  notifyAuthChange();
}

/**
 * Clears all stored authentication details from localStorage.
 */
export function clearStoredAuth() {
  if (!isLocalStorageAvailable()) return;

  window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  window.localStorage.removeItem(STORAGE_KEYS.EXPIRES_IN);
  window.localStorage.removeItem(STORAGE_KEYS.MUST_CHANGE_PASSWORD);
  window.localStorage.removeItem(STORAGE_KEYS.ROLE);
  window.localStorage.removeItem(STORAGE_KEYS.USER);

  notifyAuthChange();
}

/**
 * Updates stored auth after successful password change.
 * Clears revoked refresh token (since backend revokes all refresh tokens upon password change)
 * and sets mustChangePassword to false, preserving active accessToken, role, and user.
 */
export function setPasswordChanged() {
  const current = getStoredAuth();
  setStoredAuth({
    accessToken: current.accessToken,
    refreshToken: null,
    expiresIn: current.expiresIn,
    mustChangePassword: false,
    role: current.role,
    user: current.user,
  });
}

