import { useState } from 'react';
import CertificationModal from './CertificationModal.jsx';
import {
  createCertification,
  updateCertification,
  deleteCertification,
} from '../../services/profileService.js';

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
}

export default function CertificationSection({
  certifications = [],
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
        await updateCertification(editingItem.id, payload);
        onNotify?.('Certification updated successfully.');
      } else {
        await createCertification(payload);
        onNotify?.('Certification added successfully.');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      onDataChanged?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Failed to save certification. Please check your inputs.';
      onError?.(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      await deleteCertification(item.id);
      onNotify?.('Certification deleted successfully.');
      onDataChanged?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to delete certification. Please try again.';
      onError?.(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="profile-section-card">
      <div className="section-header">
        <div>
          <h3 className="section-title">Certifications & Licenses</h3>
          <p className="section-subtitle">Your credentials, licenses, and verified skills</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary btn-sm"
        >
          + Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="empty-state-box">
          <p className="empty-state-text">No certifications added yet.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-secondary btn-sm"
          >
            Add your first certification
          </button>
        </div>
      ) : (
        <div className="profile-items-list">
          {certifications.map((item) => (
            <div key={item.id} className="profile-item-card">
              <div className="item-main-content">
                <div className="item-title-row">
                  <h4 className="item-title">{item.name}</h4>
                  {item.doesNotExpire && (
                    <span className="badge badge-success">No Expiration</span>
                  )}
                </div>
                <div className="item-institution-row">
                  <span className="item-institution">{item.issuingOrganization}</span>
                  {item.credentialId && (
                    <span className="item-location"> • ID: {item.credentialId}</span>
                  )}
                </div>
                <div className="item-date-row">
                  <span>
                    Issued: {formatDisplayDate(item.issueDate)}
                    {!item.doesNotExpire && item.expirationDate && (
                      <> • Expires: {formatDisplayDate(item.expirationDate)}</>
                    )}
                  </span>
                </div>
                {item.credentialUrl && (
                  <div className="item-link-row">
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="credential-link"
                    >
                      View Credential &rarr;
                    </a>
                  </div>
                )}
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
        <CertificationModal
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
