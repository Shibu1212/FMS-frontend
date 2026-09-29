import { useState } from 'react';

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
}

function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getInitialFormData(initialData) {
  if (!initialData) {
    return {
      name: '',
      issuingOrganization: '',
      credentialId: '',
      credentialUrl: '',
      issueDate: '',
      expirationDate: '',
      doesNotExpire: false,
      description: '',
    };
  }

  return {
    name: initialData.name || '',
    issuingOrganization: initialData.issuingOrganization || '',
    credentialId: initialData.credentialId || '',
    credentialUrl: initialData.credentialUrl || '',
    issueDate: formatDateForInput(initialData.issueDate),
    expirationDate: formatDateForInput(initialData.expirationDate),
    doesNotExpire: Boolean(initialData.doesNotExpire),
    description: initialData.description || '',
  };
}

export default function CertificationModal({
  isOpen,
  initialData,
  onSave,
  onClose,
  isSaving,
}) {
  const [formData, setFormData] = useState(() => getInitialFormData(initialData));
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'doesNotExpire' && checked) {
        updated.expirationDate = '';
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Certification name is required.';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Certification name cannot exceed 200 characters.';
    }

    if (!formData.issuingOrganization.trim()) {
      newErrors.issuingOrganization = 'Issuing organization is required.';
    } else if (formData.issuingOrganization.trim().length > 200) {
      newErrors.issuingOrganization = 'Issuing organization cannot exceed 200 characters.';
    }

    if (formData.credentialId && formData.credentialId.trim().length > 150) {
      newErrors.credentialId = 'Credential ID cannot exceed 150 characters.';
    }

    if (formData.credentialUrl && formData.credentialUrl.trim()) {
      const trimmedUrl = formData.credentialUrl.trim();
      if (trimmedUrl.length > 500) {
        newErrors.credentialUrl = 'Credential URL cannot exceed 500 characters.';
      } else if (!isValidHttpUrl(trimmedUrl)) {
        newErrors.credentialUrl = 'Credential URL must be a valid absolute URL (e.g. https://...).';
      }
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required.';
    }

    if (!formData.doesNotExpire) {
      if (!formData.expirationDate) {
        newErrors.expirationDate = 'Expiration date is required when certification expires.';
      } else if (formData.issueDate && formData.expirationDate < formData.issueDate) {
        newErrors.expirationDate = 'Expiration date cannot be earlier than issue date.';
      }
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      issuingOrganization: formData.issuingOrganization.trim(),
      credentialId: formData.credentialId.trim() || null,
      credentialUrl: formData.credentialUrl.trim() || null,
      issueDate: formData.issueDate,
      expirationDate: formData.doesNotExpire ? null : formData.expirationDate || null,
      doesNotExpire: Boolean(formData.doesNotExpire),
      description: formData.description.trim() || null,
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content profile-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="certification-modal-title"
      >
        <div className="modal-header">
          <h3 id="certification-modal-title">
            {initialData ? 'Edit Certification' : 'Add Certification'}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
            disabled={isSaving}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cert-name">Certification Name *</label>
              <input
                id="cert-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. AWS Certified Solutions Architect"
                maxLength={200}
                disabled={isSaving}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cert-org">Issuing Organization *</label>
              <input
                id="cert-org"
                type="text"
                name="issuingOrganization"
                value={formData.issuingOrganization}
                onChange={handleChange}
                placeholder="e.g. Amazon Web Services"
                maxLength={200}
                disabled={isSaving}
                className={errors.issuingOrganization ? 'input-error' : ''}
              />
              {errors.issuingOrganization && <span className="field-error-text">{errors.issuingOrganization}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cert-cred-id">Credential ID</label>
              <input
                id="cert-cred-id"
                type="text"
                name="credentialId"
                value={formData.credentialId}
                onChange={handleChange}
                placeholder="e.g. AWS-12345678"
                maxLength={150}
                disabled={isSaving}
                className={errors.credentialId ? 'input-error' : ''}
              />
              {errors.credentialId && <span className="field-error-text">{errors.credentialId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cert-cred-url">Credential URL</label>
              <input
                id="cert-cred-url"
                type="url"
                name="credentialUrl"
                value={formData.credentialUrl}
                onChange={handleChange}
                placeholder="https://..."
                maxLength={500}
                disabled={isSaving}
                className={errors.credentialUrl ? 'input-error' : ''}
              />
              {errors.credentialUrl && <span className="field-error-text">{errors.credentialUrl}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cert-issue-date">Issue Date *</label>
              <input
                id="cert-issue-date"
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                disabled={isSaving}
                className={errors.issueDate ? 'input-error' : ''}
              />
              {errors.issueDate && <span className="field-error-text">{errors.issueDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cert-exp-date">Expiration Date</label>
              <input
                id="cert-exp-date"
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                disabled={isSaving || formData.doesNotExpire}
                className={errors.expirationDate ? 'input-error' : ''}
              />
              {errors.expirationDate && <span className="field-error-text">{errors.expirationDate}</span>}
            </div>
          </div>

          <div className="form-group form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="doesNotExpire"
                checked={formData.doesNotExpire}
                onChange={handleChange}
                disabled={isSaving}
              />
              <span>This credential does not expire</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="cert-desc">Description</label>
            <textarea
              id="cert-desc"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Skills, covered topics, or verification details"
              maxLength={1000}
              disabled={isSaving}
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && <span className="field-error-text">{errors.description}</span>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? 'Saving...' : initialData ? 'Update Certification' : 'Add Certification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
