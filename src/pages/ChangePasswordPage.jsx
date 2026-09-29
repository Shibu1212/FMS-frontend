import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { changePassword } from '../services/authService.js';

export default function ChangePasswordPage() {
  const { mustChangePassword, setPasswordChanged } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fromLocation = location.state?.from;
  const redirectDestination = fromLocation?.pathname
    ? `${fromLocation.pathname}${fromLocation.search || ''}`
    : null;

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};

    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters long.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (formData.confirmPassword !== formData.newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      // Update AuthContext and token storage to set mustChangePassword = false
      // and clear revoked refresh token
      setPasswordChanged();

      // Clear password fields immediately for security
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setSuccessMessage('Password changed successfully! Your account is now fully secured.');

      // If user had a pending redirect destination, navigate after short delay or direct
      if (redirectDestination) {
        setTimeout(() => {
          navigate(redirectDestination, { replace: true });
        }, 1500);
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        const newFieldErrors = {};
        if (backendErrors.CurrentPassword) {
          newFieldErrors.currentPassword =
            backendErrors.CurrentPassword.join(" ");
        }
        if (backendErrors.NewPassword) {
          newFieldErrors.newPassword = backendErrors.NewPassword.join(" ");
        }
        if (backendErrors.ConfirmPassword) {
          newFieldErrors.confirmPassword =
            backendErrors.ConfirmPassword.join(" ");
        }
        setFieldErrors(newFieldErrors);
        setErrorMessage(
          err.response.data.title || "Please correct the errors in the form.",
        );
      } else if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes("Current password")
      ) {
        setErrorMessage(
          "Current password is incorrect. Please verify and try again.",
        );
        setFieldErrors({ currentPassword: "Incorrect password." });
      } else if (err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else if (err.request) {
        setErrorMessage(
          "Unable to connect to the server. Please check your connection and try again.",
        );
      } else {
        setErrorMessage(
          "An unexpected error occurred while changing your password.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-container form-card">
      <h1>Change Password</h1>
      <p style={{ marginBottom: "1.25rem", color: "#64748b" }}>
        Update your account password to keep your account secure.
      </p>

      {mustChangePassword && !successMessage && (
        <div
          className="alert"
          role="status"
          style={{
            backgroundColor: "#fffbeb",
            color: "#b45309",
            border: "1px solid #fde68a",
            marginBottom: "1.5rem",
          }}
        >
          <strong>Action Required:</strong> Your account requires a password
          update before accessing normal application features.
        </div>
      )}

      {successMessage && (
        <div
          className="alert alert-success"
          role="status"
          style={{ marginBottom: "1.5rem" }}
        >
          <strong>{successMessage}</strong>
          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <Link
              to={redirectDestination || "/profile"}
              className="btn-primary btn-sm"
            >
              {redirectDestination
                ? "Continue to Destination →"
                : "Go to Profile →"}
            </Link>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          className="alert alert-error"
          role="alert"
          style={{ marginBottom: "1.5rem" }}
        >
          {errorMessage}
        </div>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                disabled={isSubmitting}
                className={`form-input ${fieldErrors.currentPassword ? "input-error" : ""}`}
                autoComplete="current-password"
              />
            </div>
            {fieldErrors.currentPassword && (
              <div className="field-error">{fieldErrors.currentPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">
              New Password * (min 8 characters)
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                disabled={isSubmitting}
                className={`form-input ${fieldErrors.newPassword ? "input-error" : ""}`}
                autoComplete="new-password"
              />
            </div>
            {fieldErrors.newPassword && (
              <div className="field-error">{fieldErrors.newPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                disabled={isSubmitting}
                className={`form-input ${fieldErrors.confirmPassword ? "input-error" : ""}`}
                autoComplete="new-password"
              />
            </div>
            {fieldErrors.confirmPassword && (
              <div className="field-error">{fieldErrors.confirmPassword}</div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label
              className="checkbox-label"
              style={{
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                disabled={isSubmitting}
              />
              <span>Show passwords</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            {isSubmitting ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      )}
    </section>
  );
}
