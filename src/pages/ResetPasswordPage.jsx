import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../services/authService.js';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};

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

    if (!token) {
      setErrorMessage('Reset token is missing from the link. Please request a new password reset link.');
      return;
    }

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      // Clear password fields immediately
      setFormData({
        newPassword: '',
        confirmPassword: '',
      });

      setIsSuccess(true);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        const newFieldErrors = {};
        if (backendErrors.NewPassword) {
          newFieldErrors.newPassword = backendErrors.NewPassword.join(' ');
        }
        if (backendErrors.ConfirmPassword) {
          newFieldErrors.confirmPassword = backendErrors.ConfirmPassword.join(' ');
        }
        setFieldErrors(newFieldErrors);
        setErrorMessage(err.response.data.title || 'Please correct the errors in the form.');
      } else {
        const msg =
          err.response?.data?.message ||
          (err.request
            ? 'Unable to connect to the server. Please check your connection and try again.'
            : 'Invalid or expired password reset link. Please request a new one.');
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <section className="page-container form-card">
        <h1>Reset Password</h1>
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
          <strong>Missing Reset Token</strong>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            The password reset link is invalid or incomplete. Please request a new password reset link.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/forgot-password" className="btn-primary btn-sm">
              Request New Link
            </Link>
          </div>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>
            &larr; Return to Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container form-card">
      <h1>Reset Password</h1>
      <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
        Enter a new secure password for your account.
      </p>

      {isSuccess ? (
        <div className="alert alert-success" role="status" style={{ marginBottom: '1.5rem' }}>
          <strong>Password Reset Successful</strong>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', lineHeight: 1.5 }}>
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <div style={{ marginTop: '1.25rem' }}>
            <Link to="/login" className="btn-primary btn-sm">
              Sign In with New Password &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
              <div>{errorMessage}</div>
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/forgot-password" style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8125rem' }}>
                  Request a new password reset link &rarr;
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="reset-newPassword">New Password * (min 8 characters)</label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  id="reset-newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  disabled={isSubmitting}
                  className={`form-input ${fieldErrors.newPassword ? 'input-error' : ''}`}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
              {fieldErrors.newPassword && (
                <div className="field-error">{fieldErrors.newPassword}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reset-confirmPassword">Confirm New Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  id="reset-confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  disabled={isSubmitting}
                  className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.confirmPassword && (
                <div className="field-error">{fieldErrors.confirmPassword}</div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="checkbox-label" style={{ fontSize: '0.875rem' }}>
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
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>
              &larr; Back to Sign In
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
