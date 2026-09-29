import api from './api.js';

export const EDUCATION_TYPES = [
  'School',
  'HigherSecondary',
  'Diploma',
  'Bachelor',
  'Master',
  'Doctorate',
  'Other',
];

export const GRADE_TYPES = [
  'Percentage',
  'CGPA',
  'GPA',
  'Grade',
  'Other',
];

export const EMPLOYMENT_TYPES = [
  'FullTime',
  'PartTime',
  'Contract',
  'Internship',
  'Freelance',
  'SelfEmployed',
  'Other',
];

/**
 * Resolves a profile picture path (relative or absolute) to a displayable URL.
 * @param {string|null|undefined} relativeUrl
 * @returns {string|null}
 */
export function getProfilePictureUrl(relativeUrl) {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  const apiBase = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5091/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
}

/**
 * Fetches current user profile including educations, experiences, and certifications.
 * GET /api/Profile/me
 */
export async function getMyProfile() {
  const response = await api.get('/Profile');
  return response.data;
}

/**
 * Updates basic profile info (e.g. name).
 * PUT /api/Profile
 * @param {{ name: string }} data
 */
export async function updateProfile(data) {
  const response = await api.put('/Profile', data);
  return response.data;
}

/**
 * Fetches user educations.
 * GET /api/Profile/educations
 */
export async function getMyEducations() {
  const response = await api.get('/Profile/educations');
  return response.data;
}

/**
 * Creates an education record.
 * POST /api/Profile/educations
 * @param {object} data
 */
export async function createEducation(data) {
  const response = await api.post('/Profile/educations', data);
  return response.data;
}

/**
 * Updates an education record.
 * PUT /api/Profile/educations/{id}
 * @param {number|string} id
 * @param {object} data
 */
export async function updateEducation(id, data) {
  const response = await api.put(`/Profile/educations/${id}`, data);
  return response.data;
}

/**
 * Deletes an education record.
 * DELETE /api/Profile/educations/{id}
 * @param {number|string} id
 */
export async function deleteEducation(id) {
  const response = await api.delete(`/Profile/educations/${id}`);
  return response.data;
}

/**
 * Fetches user experiences.
 * GET /api/Profile/experiences
 */
export async function getMyExperiences() {
  const response = await api.get('/Profile/experiences');
  return response.data;
}

/**
 * Creates an experience record.
 * POST /api/Profile/experiences
 * @param {object} data
 */
export async function createExperience(data) {
  const response = await api.post('/Profile/experiences', data);
  return response.data;
}

/**
 * Updates an experience record.
 * PUT /api/Profile/experiences/{id}
 * @param {number|string} id
 * @param {object} data
 */
export async function updateExperience(id, data) {
  const response = await api.put(`/Profile/experiences/${id}`, data);
  return response.data;
}

/**
 * Deletes an experience record.
 * DELETE /api/Profile/experiences/{id}
 * @param {number|string} id
 */
export async function deleteExperience(id) {
  const response = await api.delete(`/Profile/experiences/${id}`);
  return response.data;
}

/**
 * Fetches user certifications.
 * GET /api/Profile/certifications
 */
export async function getMyCertifications() {
  const response = await api.get('/Profile/certifications');
  return response.data;
}

/**
 * Creates a certification record.
 * POST /api/Profile/certifications
 * @param {object} data
 */
export async function createCertification(data) {
  const response = await api.post('/Profile/certifications', data);
  return response.data;
}

/**
 * Updates a certification record.
 * PUT /api/Profile/certifications/{id}
 * @param {number|string} id
 * @param {object} data
 */
export async function updateCertification(id, data) {
  const response = await api.put(`/Profile/certifications/${id}`, data);
  return response.data;
}

/**
 * Deletes a certification record.
 * DELETE /api/Profile/certifications/{id}
 * @param {number|string} id
 */
export async function deleteCertification(id) {
  const response = await api.delete(`/Profile/certifications/${id}`);
  return response.data;
}

/**
 * Uploads a profile picture using multipart/form-data.
 * POST /api/Profile/picture
 * @param {File|Blob} file
 */
export async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/Profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Deletes the user's profile picture.
 * DELETE /api/Profile/picture
 */
export async function deleteProfilePicture() {
  const response = await api.delete('/Profile/picture');
  return response.data;
}
