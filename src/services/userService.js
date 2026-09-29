import api from "./api.js";

/**
 * Fetches all application users.
 * GET /api/User
 * Requires ADMIN role.
 */
export async function getUsers() {
  const response = await api.get("/User");
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Fetches all available roles.
 * GET /api/Role
 * Requires ADMIN role.
 */
export async function getRoles() {
  const response = await api.get("/Role");
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Creates a new user.
 * POST /api/User
 * Requires ADMIN role.
 */
export async function createUser(dto) {
  const response = await api.post("/User", {
    name: dto.name.trim(),
    email: dto.email.trim(),
    roleId: Number(dto.roleId),
  });

  return response.data;
}

/**
 * Updates an existing user.
 * PUT /api/User/{userId}
 * Requires ADMIN role.
 */
export async function updateUser(userId, dto) {
  const response = await api.put(`/User/${userId}`, {
    name: dto.name.trim(),
    email: dto.email.trim(),
  });

  return response.data;
}

/**
 * Changes a user's role.
 * PATCH /api/User/{userId}/role
 * Requires ADMIN role.
 */
export async function changeUserRole(userId, roleId) {
  const response = await api.patch(`/User/${userId}/role`, {
    roleId: Number(roleId),
  });

  return response.data;
}

/**
 * Changes a user's active status.
 * PATCH /api/User/{userId}/status
 * Requires ADMIN role.
 */
export async function changeUserStatus(userId, isActive) {
  const response = await api.patch(`/User/${userId}/status`, {
    isActive: Boolean(isActive),
  });

  return response.data;
}

/**
 * Deletes a user.
 * DELETE /api/User/{userId}
 * Requires ADMIN role.
 */
export async function deleteUser(userId) {
  const response = await api.delete(`/User/${userId}`);

  return response.data;
}

export async function submitFormResponse(formId, values) {
  const response = await api.post("/FormResponse", {
    formId: Number(formId),
    values,
  });

  return response.data;
}
