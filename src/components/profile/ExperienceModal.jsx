import { useState } from 'react';
import { EMPLOYMENT_TYPES } from '../../services/profileService.js';

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
}

function getInitialFormData(initialData) {
  if (!initialData) {
    return {
      companyName: '',
      jobTitle: '',
      employmentType: 'FullTime',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    };
  }

  return {
    companyName: initialData.companyName || '',
    jobTitle: initialData.jobTitle || '',
    employmentType: initialData.employmentType || 'FullTime',
    location: initialData.location || '',
    startDate: formatDateForInput(initialData.startDate),
    endDate: formatDateForInput(initialData.endDate),
    isCurrent: Boolean(initialData.isCurrent),
    description: initialData.description || '',
  };
}

export default function ExperienceModal({
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
      if (name === 'isCurrent' && checked) {
        updated.endDate = '';
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

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required.';
    } else if (formData.companyName.trim().length > 100) {
      newErrors.companyName = 'Company name cannot exceed 100 characters.';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required.';
    } else if (formData.jobTitle.trim().length > 100) {
      newErrors.jobTitle = 'Job title cannot exceed 100 characters.';
    }

    if (!formData.employmentType) {
      newErrors.employmentType = 'Employment type is required.';
    }

    if (formData.location && formData.location.trim().length > 150) {
      newErrors.location = 'Location cannot exceed 150 characters.';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.';
    }

    if (!formData.isCurrent) {
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required when not current employment.';
      } else if (formData.startDate && formData.endDate < formData.startDate) {
        newErrors.endDate = 'End date cannot be earlier than start date.';
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
      companyName: formData.companyName.trim(),
      jobTitle: formData.jobTitle.trim(),
      employmentType: formData.employmentType,
      location: formData.location.trim() || null,
      startDate: formData.startDate,
      endDate: formData.isCurrent ? null : formData.endDate || null,
      isCurrent: Boolean(formData.isCurrent),
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
        aria-labelledby="experience-modal-title"
      >
        <div className="modal-header">
          <h3 id="experience-modal-title">
            {initialData ? 'Edit Experience' : 'Add Experience'}
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
              <label htmlFor="exp-title">Job Title *</label>
              <input
                id="exp-title"
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                maxLength={100}
                disabled={isSaving}
                className={errors.jobTitle ? 'input-error' : ''}
              />
              {errors.jobTitle && <span className="field-error-text">{errors.jobTitle}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="exp-company">Company Name *</label>
              <input
                id="exp-company"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Acme Corporation"
                maxLength={100}
                disabled={isSaving}
                className={errors.companyName ? 'input-error' : ''}
              />
              {errors.companyName && <span className="field-error-text">{errors.companyName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exp-type">Employment Type *</label>
              <select
                id="exp-type"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                disabled={isSaving}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="exp-loc">Location</label>
              <input
                id="exp-loc"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. New York, NY (or Remote)"
                maxLength={150}
                disabled={isSaving}
                className={errors.location ? 'input-error' : ''}
              />
              {errors.location && <span className="field-error-text">{errors.location}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exp-start-date">Start Date *</label>
              <input
                id="exp-start-date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={isSaving}
                className={errors.startDate ? 'input-error' : ''}
              />
              {errors.startDate && <span className="field-error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="exp-end-date">End Date</label>
              <input
                id="exp-end-date"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={isSaving || formData.isCurrent}
                className={errors.endDate ? 'input-error' : ''}
              />
              {errors.endDate && <span className="field-error-text">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleChange}
                disabled={isSaving}
              />
              <span>I currently work in this role</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="exp-desc">Description</label>
            <textarea
              id="exp-desc"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Responsibilities, achievements, and technologies used"
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
              {isSaving ? 'Saving...' : initialData ? 'Update Experience' : 'Add Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
