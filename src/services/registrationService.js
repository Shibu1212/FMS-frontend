import api from './api.js';

/**
 * Submits a new user registration request.
 * POST /api/Registration
 * Public endpoint.
 * @param {{ name: string, email: string }} dto
 * @returns {Promise<any>}
 */
export async function submitRegistration(dto) {
  const response = await api.post('/Registration', {
    name: dto.name.trim(),
    email: dto.email.trim(),
  });
  return response.data;
}

/**
 * Fetches registration requests, optionally filtered by status.
 * GET /api/Registration?status=...
 * Requires ADMIN role.
 * @param {string|null} [status] 'Pending' | 'Approved' | 'Rejected' | 'All' | null
 * @returns {Promise<Array>}
 */
export async function getRegistrations(status) {
  const url = !status || status === 'All' ? '/Registration' : `/Registration?status=${encodeURIComponent(status)}`;
  const response = await api.get(url);
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Fetches a single registration request by ID.
 * GET /api/Registration/{id}
 * Requires ADMIN role.
 * @param {number|string} id
 * @returns {Promise<any>}
 */
export async function getRegistrationById(id) {
  const response = await api.get(`/Registration/${id}`);
  return response.data;
}

/**
 * Updates a registration request's status (e.g. Approved or Rejected).
 * PATCH /api/Registration/{id}/status
 * Requires ADMIN role.
 * @param {number|string} id
 * @param {string} status 'Approved' | 'Rejected'
 * @returns {Promise<any>}
 */
export async function updateRegistrationStatus(id, status) {
  const response = await api.patch(`/Registration/${id}/status`, { status });
  return response.data;
}
