import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyProfile } from '../services/profileService.js';
import ProfilePictureSection from '../components/profile/ProfilePictureSection.jsx';
import BasicInfoSection from '../components/profile/BasicInfoSection.jsx';
import EducationSection from '../components/profile/EducationSection.jsx';
import ExperienceSection from '../components/profile/ExperienceSection.jsx';
import CertificationSection from '../components/profile/CertificationSection.jsx';

export default function ProfilePage() {
  const { role } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'education', 'experience', 'certifications'

  const loadProfile = useCallback(() => {
    return getMyProfile()
      .then((data) => {
        setProfile(data);
        setErrorMessage('');
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setErrorMessage('Your session has expired. Please log in again.');
        } else if (err.response?.status === 403) {
          setErrorMessage('You do not have permission to view this profile.');
        } else if (err.response?.status === 404) {
          setErrorMessage('User profile not found. Please contact support.');
        } else {
          setErrorMessage('Failed to load profile. Please check your network connection and try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleNotifySuccess = (msg) => {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => {
      setSuccessMessage((prev) => (prev === msg ? '' : prev));
    }, 4000);
  };

  const handleNotifyError = (msg) => {
    setErrorMessage(msg);
    setSuccessMessage('');
  };

  const handlePictureUpdated = (newUrl) => {
    setProfile((prev) => (prev ? { ...prev, profilePictureUrl: newUrl } : prev));
    handleNotifySuccess(
      newUrl
        ? 'Profile picture updated successfully.'
        : 'Profile picture removed successfully.'
    );
  };

  const handleBasicInfoUpdated = (updatedProfile) => {
    setProfile((prev) => (prev ? { ...prev, name: updatedProfile.name } : prev));
    handleNotifySuccess('Profile name updated successfully.');
  };

  if (isLoading) {
    return (
      <div className="profile-page-container">
        <div className="loading-container">
          <div className="loading-spinner" aria-label="Loading profile"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !profile) {
    return (
      <div className="profile-page-container">
        <div className="alert alert-error" role="alert">
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              loadProfile();
            }}
            className="btn-primary btn-sm"
            style={{ marginTop: '0.75rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const educations = profile?.educations || [];
  const experiences = profile?.experiences || [];
  const certifications = profile?.certifications || [];

  return (
    <div className="profile-page-container">
      <div className="profile-page-header">
        <h1>My Profile</h1>
        <p className="subtitle">
          Manage your personal details, qualifications, experience, and certifications
        </p>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="status">
          <span>{successMessage}</span>
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={() => setSuccessMessage('')}
            aria-label="Dismiss message"
          >
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error" role="alert">
          <span>{errorMessage}</span>
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={() => setErrorMessage('')}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header Card: Profile Picture + Basic Info */}
      <div className="profile-overview-card">
        <ProfilePictureSection
          profilePictureUrl={profile?.profilePictureUrl}
          userName={profile?.name}
          onPictureUpdated={handlePictureUpdated}
          onError={handleNotifyError}
        />

        <BasicInfoSection
          name={profile?.name}
          email={profile?.email}
          role={role}
          onProfileUpdated={handleBasicInfoUpdated}
          onError={handleNotifyError}
        />
      </div>

      {/* Section Navigation Tabs */}
      <div className="profile-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Sections
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'education'}
          className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          Education <span className="tab-count">({educations.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'experience'}
          className={`tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          Experience <span className="tab-count">({experiences.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'certifications'}
          className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('certifications')}
        >
          Certifications <span className="tab-count">({certifications.length})</span>
        </button>
      </div>

      {/* Profile Detail Sections */}
      <div className="profile-sections-wrapper">
        {(activeTab === 'all' || activeTab === 'education') && (
          <EducationSection
            educations={educations}
            onDataChanged={loadProfile}
            onNotify={handleNotifySuccess}
            onError={handleNotifyError}
          />
        )}

        {(activeTab === 'all' || activeTab === 'experience') && (
          <ExperienceSection
            experiences={experiences}
            onDataChanged={loadProfile}
            onNotify={handleNotifySuccess}
            onError={handleNotifyError}
          />
        )}

        {(activeTab === 'all' || activeTab === 'certifications') && (
          <CertificationSection
            certifications={certifications}
            onDataChanged={loadProfile}
            onNotify={handleNotifySuccess}
            onError={handleNotifyError}
          />
        )}
      </div>
    </div>
  );
}
