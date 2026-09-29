import api from './api.js';

/**
 * Authenticates user credentials and returns tokens.
 * POST /api/Auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ accessToken: string, refreshToken: string, expiresIn: number, mustChangePassword: boolean, role: string }>}
 */
export async function login(credentials) {
  const response = await api.post('/Auth/login', {
    email: credentials.email.trim(),
    password: credentials.password,
  });
  return response.data;
}

/**
 * Revokes refresh token on the backend upon user logout.
 * POST /api/Auth/logout
 * @param {string} refreshToken
 * @returns {Promise<any>}
 */
export async function logout(refreshToken) {
  if (!refreshToken) return;
  try {
    await api.post('/Auth/logout', { refreshToken });
  } catch {
    // Best-effort logout: silent on failure
  }
}

/**
 * Changes the current authenticated user's password.
 * POST /api/Auth/change-password
 * Requires Bearer access token.
 * Backend revokes existing refresh tokens on success.
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} dto
 * @returns {Promise<any>}
 */
export async function changePassword(dto) {
  const response = await api.post('/Auth/change-password', {
    currentPassword: dto.currentPassword,
    newPassword: dto.newPassword,
    confirmPassword: dto.confirmPassword,
  });
  return response.data;
}

/**
 * Requests a password reset link to be sent to the specified email address.
 * POST /api/Auth/forgot-password
 * Public endpoint with anti-enumeration protection.
 * @param {{ email: string }} dto
 * @returns {Promise<{ message: string }>}
 */
export async function forgotPassword(dto) {
  const response = await api.post('/Auth/forgot-password', {
    email: dto.email.trim(),
  });
  return response.data;
}

/**
 * Resets the user's password using a valid reset token from email.
 * POST /api/Auth/reset-password
 * Public endpoint.
 * @param {{ token: string, newPassword: string, confirmPassword: string }} dto
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword(dto) {
  const response = await api.post('/Auth/reset-password', {
    token: dto.token,
    newPassword: dto.newPassword,
    confirmPassword: dto.confirmPassword,
  });
  return response.data;
}
