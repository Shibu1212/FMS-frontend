import api from "./api.js";

export async function getForms({
  page = 1,
  pageSize = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) {
  const response = await api.get("/Form", {
    params: {
      page,
      pageSize,
      search: search.trim() || undefined,
      sortBy,
      sortOrder,
    },
  });

  return response.data;
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

export async function getPublishedForms({
  page = 1,
  pageSize = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) {
  const response = await api.get("/Form/published", {
    params: {
      page,
      pageSize,
      search: search.trim() || undefined,
      sortBy,
      sortOrder,
    },
  });

  return response.data;
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

export async function getMyFormResponses({
  page = 1,
  pageSize = 10,
  search = "",
  sortBy = "submittedAt",
  sortOrder = "desc",
} = {}) {
  const response = await api.get("/FormResponse/my", {
    params: {
      page,
      pageSize,
      search: search.trim() || undefined,
      sortBy,
      sortOrder,
    },
  });

  return response.data;
}

export async function getFormResponseById(id) {
  const response = await api.get(`/FormResponse/${id}`);

  return response.data;
}

export async function getFormResponses(
  formId,
  {
    page = 1,
    pageSize = 10,
    search = "",
    sortBy = "submittedAt",
    sortOrder = "desc",
  } = {},
) {
  const response = await api.get(`/FormResponse/form/${formId}`, {
    params: {
      page,
      pageSize,
      search: search.trim() || undefined,
      sortBy,
      sortOrder,
    },
  });

  return response.data;
}