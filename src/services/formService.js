import api from "./api.js";

export async function getForms() {
  const response = await api.get("/Form");

  return Array.isArray(response.data) ? response.data : [];
}

export async function getFormById(id) {
  const response = await api.get(`/Form/${id}`);

  return response.data;
}

export async function createForm(dto) {
  const response = await api.post("/Form", {
    name: dto.name.trim(),
    description: dto.description?.trim() || null,
  });

  return response.data;
}

export async function updateForm(id, dto) {
  const response = await api.put(`/Form/${id}`, {
    name: dto.name.trim(),
    description: dto.description?.trim() || null,
    status: dto.status,
  });

  return response.data;
}

export async function deleteForm(id) {
  const response = await api.delete(`/Form/${id}`);

  return response.data;
}

export async function getPublishedForms() {
  const response = await api.get("/Form/published");

  return Array.isArray(response.data) ? response.data : [];
}

export async function getPublishedFormById(id) {
  const response = await api.get(`/Form/published/${id}`);

  return response.data;
}
export async function getFormFields(formId) {
  const response = await api.get(`/FormField/form/${formId}`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function createFormField(formId, dto) {
  const response = await api.post(`/FormField/form/${formId}`, {
    label: dto.label.trim(),
    fieldType: dto.fieldType,
    isRequired: Boolean(dto.isRequired),
    displayOrder: Number(dto.displayOrder),
    options: dto.options?.trim() || null,
  });

  return response.data;
}

export async function updateFormField(fieldId, dto) {
  const response = await api.put(`/FormField/${fieldId}`, {
    label: dto.label.trim(),
    fieldType: dto.fieldType,
    isRequired: Boolean(dto.isRequired),
    displayOrder: Number(dto.displayOrder),
    options: dto.options?.trim() || null,
  });

  return response.data;
}

export async function deleteFormField(fieldId) {
  const response = await api.delete(`/FormField/${fieldId}`);

  return response.data;
}

export async function submitFormResponse(formId, values) {
  const response = await api.post("/FormResponse", {
    formId: Number(formId),
    values,
  });

  return response.data;
}

export async function updateFormResponse(responseId, formId, values) {
  const response = await api.put(`/FormResponse/${responseId}`, {
    formId: Number(formId),
    values,
  });

  return response.data;
}

export async function getMyFormResponses() {
  const response = await api.get("/FormResponse/my");

  return Array.isArray(response.data) ? response.data : [];
}

export async function getFormResponseById(id) {
  const response = await api.get(`/FormResponse/${id}`);

  return response.data;
}

export async function getFormResponses(formId, search = "") {
  const response = await api.get(`/FormResponse/form/${formId}`, {
    params: {
      search: search.trim() || undefined,
    },
  });

  return Array.isArray(response.data) ? response.data : [];
}