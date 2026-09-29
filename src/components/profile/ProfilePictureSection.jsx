import { useState, useRef } from 'react';
import { getProfilePictureUrl, uploadProfilePicture, deleteProfilePicture } from '../../services/profileService.js';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export default function ProfilePictureSection({
  profilePictureUrl,
  userName,
  onPictureUpdated,
  onError,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const displayUrl = getProfilePictureUrl(profilePictureUrl);
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : '?';

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the same file can be selected again if needed
    e.target.value = '';

    // File validation
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      onError?.('Only JPG, JPEG, PNG, and WEBP image files are allowed.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      onError?.('Selected image exceeds the 5 MB maximum file size limit.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadProfilePicture(file);
      onPictureUpdated?.(response.profilePictureUrl);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 400
          ? 'Invalid image file. Please choose a valid JPG, PNG, or WEBP image under 5 MB.'
          : 'Failed to upload profile picture. Please try again.');
      onError?.(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!profilePictureUrl) return;

    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProfilePicture();
      onPictureUpdated?.(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to remove profile picture. Please try again.';
      onError?.(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const isProcessing = isUploading || isDeleting;

  return (
    <div className="profile-picture-container">
      <div className="profile-avatar-wrapper">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={userName ? `${userName}'s profile` : 'Profile'}
            className="profile-avatar-img"
          />
        ) : (
          <div className="profile-avatar-placeholder" aria-label="No profile picture">
            <span>{initial}</span>
          </div>
        )}
      </div>

      <div className="profile-picture-actions">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          disabled={isProcessing}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="btn-secondary btn-sm"
        >
          {isUploading ? 'Uploading...' : profilePictureUrl ? 'Change Photo' : 'Upload Photo'}
        </button>

        {profilePictureUrl && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isProcessing}
            className="btn-danger-outline btn-sm"
          >
            {isDeleting ? 'Removing...' : 'Remove Photo'}
          </button>
        )}
      </div>
      <span className="form-help-text">Allowed: JPG, PNG, WEBP (Max 5MB)</span>
    </div>
  );
}
