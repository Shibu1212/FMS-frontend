import { useState } from 'react';
import EducationModal from './EducationModal.jsx';
import {
  createEducation,
  updateEducation,
  deleteEducation,
} from '../../services/profileService.js';

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
}

export default function EducationSection({
  educations = [],
  onDataChanged,
  onNotify,
  onError,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (payload) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await updateEducation(editingItem.id, payload);
        onNotify?.('Education record updated successfully.');
      } else {
        await createEducation(payload);
        onNotify?.('Education record added successfully.');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      onDataChanged?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Failed to save education record. Please check your inputs.';
      onError?.(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.degree}" at ${item.institutionName}?`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      await deleteEducation(item.id);
      onNotify?.('Education record deleted successfully.');
      onDataChanged?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to delete education record. Please try again.';
      onError?.(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="profile-section-card">
      <div className="section-header">
        <div>
          <h3 className="section-title">Education</h3>
          <p className="section-subtitle">Your academic qualifications and degrees</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary btn-sm"
        >
          + Add Education
        </button>
      </div>

      {educations.length === 0 ? (
        <div className="empty-state-box">
          <p className="empty-state-text">No education records added yet.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-secondary btn-sm"
          >
            Add your first education
          </button>
        </div>
      ) : (
        <div className="profile-items-list">
          {educations.map((item) => (
            <div key={item.id} className="profile-item-card">
              <div className="item-main-content">
                <div className="item-title-row">
                  <h4 className="item-title">{item.degree}</h4>
                  <span className="badge badge-info">{item.educationType}</span>
                </div>
                <div className="item-institution-row">
                  <span className="item-institution">{item.institutionName}</span>
                  {item.institutionLocation && (
                    <span className="item-location"> • {item.institutionLocation}</span>
                  )}
                </div>
                <div className="item-date-row">
                  <span>
                    {formatDisplayDate(item.startDate)} —{' '}
                    {item.isCurrentlyStudying ? (
                      <span className="present-badge">Present</span>
                    ) : (
                      formatDisplayDate(item.endDate)
                    )}
                  </span>
                </div>
                {item.fieldOfStudy && (
                  <p className="item-field">
                    <strong>Field:</strong> {item.fieldOfStudy}
                  </p>
                )}
                <div className="item-grades-row">
                  <span className="grade-pill">
                    {item.gradeType === 'CGPA'
                      ? `CGPA: ${item.cgpa !== null && item.cgpa !== undefined ? item.cgpa : (item.grade || 'N/A')}`
                      : item.gradeType === 'Percentage'
                      ? `Percentage: ${item.percentage !== null && item.percentage !== undefined ? `${item.percentage}%` : (item.grade || 'N/A')}`
                      : `Grade: ${item.grade || 'N/A'}`}
                  </span>
                </div>
                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}
              </div>

              <div className="item-actions">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  disabled={deletingId === item.id}
                  className="btn-secondary btn-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="btn-danger-outline btn-sm"
                >
                  {deletingId === item.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <EducationModal
          isOpen={isModalOpen}
          initialData={editingItem}
          onSave={handleSave}
          onClose={handleCloseModal}
          isSaving={isSaving}
        />
      )}
    </section>
  );
}
