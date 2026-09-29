import { useState } from 'react';
import ExperienceModal from './ExperienceModal.jsx';
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from '../../services/profileService.js';

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
}

function formatEmploymentType(type) {
  if (!type) return '';
  // Insert spaces before capital letters: FullTime -> Full Time
  return type.replace(/([A-Z])/g, ' $1').trim();
}

export default function ExperienceSection({
  experiences = [],
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
        await updateExperience(editingItem.id, payload);
        onNotify?.('Experience record updated successfully.');
      } else {
        await createExperience(payload);
        onNotify?.('Experience record added successfully.');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      onDataChanged?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Failed to save experience record. Please check your inputs.';
      onError?.(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.jobTitle}" at ${item.companyName}?`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      await deleteExperience(item.id);
      onNotify?.('Experience record deleted successfully.');
      onDataChanged?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to delete experience record. Please try again.';
      onError?.(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="profile-section-card">
      <div className="section-header">
        <div>
          <h3 className="section-title">Experience</h3>
          <p className="section-subtitle">Your employment history and past roles</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary btn-sm"
        >
          + Add Experience
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="empty-state-box">
          <p className="empty-state-text">No experience records added yet.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-secondary btn-sm"
          >
            Add your first experience
          </button>
        </div>
      ) : (
        <div className="profile-items-list">
          {experiences.map((item) => (
            <div key={item.id} className="profile-item-card">
              <div className="item-main-content">
                <div className="item-title-row">
                  <h4 className="item-title">{item.jobTitle}</h4>
                  <span className="badge badge-info">
                    {formatEmploymentType(item.employmentType)}
                  </span>
                </div>
                <div className="item-institution-row">
                  <span className="item-institution">{item.companyName}</span>
                  {item.location && <span className="item-location"> • {item.location}</span>}
                </div>
                <div className="item-date-row">
                  <span>
                    {formatDisplayDate(item.startDate)} —{' '}
                    {item.isCurrent ? (
                      <span className="present-badge">Present</span>
                    ) : (
                      formatDisplayDate(item.endDate)
                    )}
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
        <ExperienceModal
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
