import { useState } from 'react';
import { updateProfile } from '../../services/profileService.js';

export default function BasicInfoSection({
  name,
  email,
  role,
  onProfileUpdated,
  onError,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    setEditName(name || '');
    setValidationError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditName(name || '');
    setValidationError('');
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = editName.trim();

    if (!trimmed) {
      setValidationError('Name is required.');
      return;
    }

    if (trimmed.length > 100) {
      setValidationError('Name cannot exceed 100 characters.');
      return;
    }

    setIsSaving(true);
    setValidationError('');

    try {
      const updated = await updateProfile({ name: trimmed });
      onProfileUpdated?.(updated);
      setIsEditing(false);
    } catch (err) {
      const message =
        err.response?.data?.errors?.Name?.[0] ||
        err.response?.data?.message ||
        'Failed to update profile name. Please try again.';
      setValidationError(message);
      onError?.(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-basic-info">
      <div className="profile-header-details">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-name-edit-form">
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label htmlFor="profile-name-input">Full Name *</label>
              <input
                id="profile-name-input"
                type="text"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  if (validationError) setValidationError('');
                }}
                maxLength={100}
                placeholder="Enter your full name"
                disabled={isSaving}
                className={validationError ? 'input-error' : ''}
                autoFocus
              />
              {validationError && (
                <span className="field-error-text">{validationError}</span>
              )}
            </div>
            <div className="button-group">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary btn-sm"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-name-row">
            <h2 className="profile-display-name">{name || 'Unnamed User'}</h2>
            <button
              type="button"
              onClick={handleStartEdit}
              className="btn-secondary btn-sm btn-edit-name"
              title="Edit full name"
            >
              Edit Name
            </button>
          </div>
        )}

        <div className="profile-meta-row">
          <div className="profile-meta-item">
            <span className="meta-label">Email:</span>
            <span className="meta-value">{email}</span>
            <span className="readonly-tag" title="Email is managed via account settings">
              Read-only
            </span>
          </div>

          {role && (
            <div className="profile-meta-item">
              <span className="meta-label">Role:</span>
              <span className="badge role-badge">{role}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}