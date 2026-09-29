import { useEffect, useState } from "react";
import {
  getForms,
  createForm,
  updateForm,
  deleteForm,
  getFormFields,
  createFormField,
  updateFormField,
  deleteFormField,
} from "../services/formService.js";
import { useAuth, ROLES, hasRole } from "../context/AuthContext.jsx";

import FormFieldList from "../components/forms/FormFieldList";
import FormFieldModal from "../components/forms/FormFieldModal";
import FormPreviewModal from "../components/forms/FormPreviewModal";

import ConfirmModal from "../components/common/ConfirmModal";
import Modal from "../components/common/Modal";

import FormTable from "../components/forms/FormTable";
import FormFormModal from "../components/forms/FormFormModal";

const FORM_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default function FormManagementPage() {
  const { role } = useAuth();
  const [forms, setForms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  

  

  // Form create/edit
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "DRAFT",
  });

  const [saving, setSaving] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState(null);

  // Form fields
  const [selectedForm, setSelectedForm] = useState(null);
  const [fields, setFields] = useState([]);

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [savingField, setSavingField] = useState(false);
  const [deletingFieldId, setDeletingFieldId] = useState(null);
  const [fieldToDelete, setFieldToDelete] = useState(null);

  // Form preview
  const [previewForm, setPreviewForm] = useState(null);
  const [previewFields, setPreviewFields] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  async function loadForms() {
    try {
      setLoading(true);
      setError("");

      const data = await getForms();

      setForms(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load forms.");
    } finally {
      setLoading(false);
    }
  }

  async function loadFields(formId) {
    try {
      setError("");

      const data = await getFormFields(formId);

      setFields(data);

      return data;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load form fields.");

      return [];
    }
  }

  function openCreateModal() {
    setEditingForm(null);

    setFormData({
      name: "",
      description: "",
      status: "DRAFT",
    });

    setError("");
    setShowFormModal(true);
  }

  function openEditModal(form) {
    setEditingForm(form);

    setFormData({
      name: form.name,
      description: form.description || "",
      status: form.status,
    });

    setError("");
    setShowFormModal(true);
  }

  async function openFieldManager(form) {
    setSelectedForm(form);
    setEditingField(null);
    setShowFieldModal(false);

    await loadFields(form.id);
  }

  async function openPreviewModal(form) {
    setError("");

    const data = await loadFields(form.id);

    setPreviewForm(form);
    setPreviewFields(data);
    setShowPreviewModal(true);
  }

  function closePreviewModal() {
    setShowPreviewModal(false);
    setPreviewForm(null);
    setPreviewFields([]);
  }

  function closeFormModal() {
    if (saving) {
      return;
    }

    setShowFormModal(false);
    setEditingForm(null);
  }

  function openCreateFieldModal() {
    setEditingField(null);
    setShowFieldModal(true);
  }

  function openEditFieldModal(field) {
    setEditingField(field);
    setShowFieldModal(true);
  }

  function closeFieldModal() {
    if (savingField) {
      return;
    }

    setShowFieldModal(false);
    setEditingField(null);
  }

  async function handleFieldSubmit(fieldData) {
    if (!selectedForm) {
      return;
    }

    try {
      setSavingField(true);
      setError("");
      setSuccessMessage("");

      if (editingField) {
        await updateFormField(editingField.id, fieldData);

        setSuccessMessage("Form field updated successfully.");
      } else {
        await createFormField(selectedForm.id, fieldData);

        setSuccessMessage("Form field created successfully.");
      }

      await loadFields(selectedForm.id);

      setShowFieldModal(false);
      setEditingField(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save form field.");
    } finally {
      setSavingField(false);
    }
  }

  function requestDeleteField(field) {
    setFieldToDelete(field);
  }

  function cancelDeleteField() {
    if (deletingFieldId) {
      return;
    }

    setFieldToDelete(null);
  }

  async function confirmDeleteField() {
    if (!fieldToDelete || !selectedForm) {
      return;
    }

    try {
      setDeletingFieldId(fieldToDelete.id);
      setError("");
      setSuccessMessage("");

      await deleteFormField(fieldToDelete.id);

      setSuccessMessage("Form field deleted successfully.");

      await loadFields(selectedForm.id);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete form field.");
    } finally {
      setDeletingFieldId(null);
      setFieldToDelete(null);
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Form name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingForm) {
        await updateForm(editingForm.id, formData);

        setSuccessMessage("Form updated successfully.");
      } else {
        await createForm(formData);

        setSuccessMessage("Form created successfully.");
      }

      await loadForms();

      setShowFormModal(false);
      setEditingForm(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save form.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(form) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${form.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingFormId(form.id);
      setError("");
      setSuccessMessage("");

      await deleteForm(form.id);

      setSuccessMessage("Form deleted successfully.");

      await loadForms();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete form.");
    } finally {
      setDeletingFormId(null);
    }
  }

  const nextDisplayOrder =
    fields.length > 0
      ? Math.max(...fields.map((field) => field.displayOrder)) + 1
      : 1;

  if (loading) {
    return (
      <section className="page-container">
        <div className="loading-state">Loading forms...</div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Form Management</h1>

          <p className="dashboard-subtitle">
            Create, update, publish, archive, and manage application forms.
          </p>
        </div>

        {!hasRole(role, ROLES.ADMIN, { exact: true }) && (
          <button
            type="button"
            className="btn-primary form-create-btn"
            onClick={openCreateModal}
          >
            Create Form
          </button>
        )}
      </header>

      {error && <div className="error-message">{error}</div>}

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Forms</h2>

          <span>{forms.length} forms</span>
        </div>

        {forms.length === 0 ? (
          <div className="empty-state">No forms found.</div>
        ) : (
          <FormTable
            forms={forms}
            deletingFormId={deletingFormId}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onManageFields={openFieldManager}
            onPreview={openPreviewModal}
          />
        )}
      </section>

      {/* Create / Edit Form Modal */}

      <FormFormModal
        open={showFormModal}
        editingForm={editingForm}
        formData={formData}
        saving={saving}
        formStatuses={FORM_STATUSES}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
      />

      {/* Manage Fields Modal */}

      <Modal
        open={Boolean(selectedForm)}
        title={
          selectedForm
            ? `Manage Fields — ${selectedForm.name}`
            : "Manage Form Fields"
        }
        onClose={() => {
          setSelectedForm(null);
          setFields([]);
        }}
        width="900px"
      >
        {selectedForm && (
          <>
            <div className="form-fields-modal-header">
              <div>
                <p className="form-fields-modal-description">
                  Add, edit, delete, and manage fields for this form.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={openCreateFieldModal}
              >
                Add Field
              </button>
            </div>

            <FormFieldList
              fields={fields}
              onEdit={openEditFieldModal}
              onDelete={requestDeleteField}
            />
          </>
        )}
      </Modal>

      {/* Add / Edit Field Modal */}

      <FormFieldModal
        open={showFieldModal}
        editingField={editingField}
        nextDisplayOrder={nextDisplayOrder}
        saving={savingField}
        onClose={closeFieldModal}
        onSubmit={handleFieldSubmit}
      />

      {/* Delete Field Confirmation */}

      <ConfirmModal
        open={Boolean(fieldToDelete)}
        title="Delete Form Field"
        message={
          fieldToDelete
            ? `Are you sure you want to delete "${fieldToDelete.label}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={Boolean(deletingFieldId)}
        onConfirm={confirmDeleteField}
        onCancel={cancelDeleteField}
      />

      {/* Form Preview */}

      <FormPreviewModal
        open={showPreviewModal}
        form={previewForm}
        fields={previewFields}
        onClose={closePreviewModal}
      />
    </section>
  );
}
