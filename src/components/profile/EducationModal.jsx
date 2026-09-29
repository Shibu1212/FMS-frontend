import { useState } from 'react';
import { EDUCATION_TYPES, GRADE_TYPES } from '../../services/profileService.js';

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
}

function getInitialFormData(initialData) {
  if (!initialData) {
    return {
      educationType: 'Bachelor',
      degree: '',
      fieldOfStudy: '',
      institutionName: '',
      institutionLocation: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
      gradeType: 'Percentage',
      grade: '',
      percentage: '',
      cgpa: '',
      description: '',
    };
  }

  return {
    educationType: initialData.educationType || 'Bachelor',
    degree: initialData.degree || '',
    fieldOfStudy: initialData.fieldOfStudy || '',
    institutionName: initialData.institutionName || '',
    institutionLocation: initialData.institutionLocation || '',
    startDate: formatDateForInput(initialData.startDate),
    endDate: formatDateForInput(initialData.endDate),
    isCurrentlyStudying: Boolean(initialData.isCurrentlyStudying),
    gradeType: initialData.gradeType || 'Percentage',
    grade: initialData.grade || '',
    percentage: initialData.percentage !== null && initialData.percentage !== undefined ? String(initialData.percentage) : '',
    cgpa: initialData.cgpa !== null && initialData.cgpa !== undefined ? String(initialData.cgpa) : '',
    description: initialData.description || '',
  };
}

export default function EducationModal({
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
      if (name === 'isCurrentlyStudying' && checked) {
        updated.endDate = '';
      }
      if (name === 'gradeType') {
        if (value === 'Percentage') {
          updated.grade = '';
          updated.cgpa = '';
        } else if (value === 'CGPA') {
          updated.grade = '';
          updated.percentage = '';
        } else if (value === 'Grade') {
          updated.percentage = '';
          updated.cgpa = '';
        }
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

    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree is required.';
    } else if (formData.degree.trim().length > 100) {
      newErrors.degree = 'Degree cannot exceed 100 characters.';
    }

    if (!formData.fieldOfStudy.trim()) {
      newErrors.fieldOfStudy = 'Field of study is required.';
    } else if (formData.fieldOfStudy.trim().length > 100) {
      newErrors.fieldOfStudy = 'Field of study cannot exceed 100 characters.';
    }

    if (!formData.institutionName.trim()) {
      newErrors.institutionName = 'Institution name is required.';
    } else if (formData.institutionName.trim().length > 200) {
      newErrors.institutionName = 'Institution name cannot exceed 200 characters.';
    }

    if (formData.institutionLocation && formData.institutionLocation.trim().length > 150) {
      newErrors.institutionLocation = 'Institution location cannot exceed 150 characters.';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.';
    }

    if (!formData.isCurrentlyStudying) {
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required when not currently studying.';
      } else if (formData.startDate && formData.endDate < formData.startDate) {
        newErrors.endDate = 'End date cannot be earlier than start date.';
      }
    }

    if (!formData.gradeType) {
      newErrors.gradeType = 'Grade type is required.';
    }

    if (formData.gradeType === 'Percentage') {
      if (formData.percentage === '' || formData.percentage === null || formData.percentage === undefined) {
        newErrors.percentage = 'Percentage is required.';
      } else {
        const pct = Number(formData.percentage);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          newErrors.percentage = 'Percentage must be between 0 and 100.';
        }
      }
    } else if (formData.gradeType === 'CGPA') {
      if (formData.cgpa === '' || formData.cgpa === null || formData.cgpa === undefined) {
        newErrors.cgpa = 'CGPA is required.';
      } else {
        const cg = Number(formData.cgpa);
        if (isNaN(cg) || cg < 0 || cg > 10) {
          newErrors.cgpa = 'CGPA must be a valid number between 0 and 10.';
        }
      }
    } else if (formData.gradeType === 'Grade') {
      if (!formData.grade || !formData.grade.trim()) {
        newErrors.grade = 'Grade is required.';
      } else if (formData.grade.trim().length > 20) {
        newErrors.grade = 'Grade cannot exceed 20 characters.';
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
      educationType: formData.educationType,
      degree: formData.degree.trim(),
      fieldOfStudy: formData.fieldOfStudy.trim(),
      institutionName: formData.institutionName.trim(),
      institutionLocation: formData.institutionLocation.trim() || null,
      startDate: formData.startDate,
      endDate: formData.isCurrentlyStudying ? null : formData.endDate || null,
      isCurrentlyStudying: Boolean(formData.isCurrentlyStudying),
      gradeType: formData.gradeType,
      grade: formData.gradeType === 'Grade' ? (formData.grade.trim() || null) : null,
      percentage: formData.gradeType === 'Percentage' && formData.percentage !== '' ? Number(formData.percentage) : null,
      cgpa: formData.gradeType === 'CGPA' && formData.cgpa !== '' ? Number(formData.cgpa) : null,
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
        aria-labelledby="education-modal-title"
      >
        <div className="modal-header">
          <h3 id="education-modal-title">
            {initialData ? 'Edit Education' : 'Add Education'}
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
              <label htmlFor="edu-type">Education Level *</label>
              <select
                id="edu-type"
                name="educationType"
                value={formData.educationType}
                onChange={handleChange}
                disabled={isSaving}
              >
                {EDUCATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edu-degree">Degree / Certificate *</label>
              <input
                id="edu-degree"
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. Bachelor of Science"
                maxLength={100}
                disabled={isSaving}
                className={errors.degree ? 'input-error' : ''}
              />
              {errors.degree && <span className="field-error-text">{errors.degree}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edu-field">Field of Study *</label>
              <input
                id="edu-field"
                type="text"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                maxLength={100}
                disabled={isSaving}
                className={errors.fieldOfStudy ? 'input-error' : ''}
              />
              {errors.fieldOfStudy && <span className="field-error-text">{errors.fieldOfStudy}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="edu-inst-name">Institution Name *</label>
              <input
                id="edu-inst-name"
                type="text"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                placeholder="e.g. Stanford University"
                maxLength={200}
                disabled={isSaving}
                className={errors.institutionName ? 'input-error' : ''}
              />
              {errors.institutionName && <span className="field-error-text">{errors.institutionName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edu-inst-loc">Institution Location</label>
            <input
              id="edu-inst-loc"
              type="text"
              name="institutionLocation"
              value={formData.institutionLocation}
              onChange={handleChange}
              placeholder="e.g. Stanford, CA"
              maxLength={150}
              disabled={isSaving}
              className={errors.institutionLocation ? 'input-error' : ''}
            />
            {errors.institutionLocation && <span className="field-error-text">{errors.institutionLocation}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edu-start-date">Start Date *</label>
              <input
                id="edu-start-date"
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
              <label htmlFor="edu-end-date">End Date</label>
              <input
                id="edu-end-date"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={isSaving || formData.isCurrentlyStudying}
                className={errors.endDate ? 'input-error' : ''}
              />
              {errors.endDate && <span className="field-error-text">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isCurrentlyStudying"
                checked={formData.isCurrentlyStudying}
                onChange={handleChange}
                disabled={isSaving}
              />
              <span>I am currently studying here</span>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edu-grade-type">Grade Type *</label>
              <select
                id="edu-grade-type"
                name="gradeType"
                value={formData.gradeType}
                onChange={handleChange}
                disabled={isSaving}
              >
                {GRADE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.gradeType && <span className="field-error-text">{errors.gradeType}</span>}
            </div>

            {formData.gradeType === 'Percentage' && (
              <div className="form-group">
                <label htmlFor="edu-pct">Percentage (%) *</label>
                <input
                  id="edu-pct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleChange}
                  placeholder="e.g. 85.5"
                  disabled={isSaving}
                  className={errors.percentage ? 'input-error' : ''}
                />
                {errors.percentage && <span className="field-error-text">{errors.percentage}</span>}
              </div>
            )}

            {formData.gradeType === 'CGPA' && (
              <div className="form-group">
                <label htmlFor="edu-cgpa">CGPA *</label>
                <input
                  id="edu-cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.5"
                  disabled={isSaving}
                  className={errors.cgpa ? 'input-error' : ''}
                />
                {errors.cgpa && <span className="field-error-text">{errors.cgpa}</span>}
              </div>
            )}

            {formData.gradeType === 'Grade' && (
              <div className="form-group">
                <label htmlFor="edu-grade">Grade *</label>
                <input
                  id="edu-grade"
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  placeholder="e.g. A+"
                  maxLength={20}
                  disabled={isSaving}
                  className={errors.grade ? 'input-error' : ''}
                />
                {errors.grade && <span className="field-error-text">{errors.grade}</span>}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edu-desc">Description</label>
            <textarea
              id="edu-desc"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Additional details about courses, achievements, etc."
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
              {isSaving ? 'Saving...' : initialData ? 'Update Education' : 'Add Education'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
