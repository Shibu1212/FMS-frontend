import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      return 'Email address is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldError('');

    const error = validate();
    if (error) {
      setFieldError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword({ email });
      // Anti-enumeration: always display positive confirmation regardless of whether email exists
      setSubmitted(true);
    } catch (err) {
      if (err.response?.data?.errors?.Email) {
        setFieldError(err.response.data.errors.Email.join(' '));
      } else if (err.request) {
        setErrorMessage('Unable to connect to the server. Please check your connection and try again.');
      } else {
        // Even on unexpected response, use generic safe message or general error
        setSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-container form-card">
      <h1>Forgot Password</h1>
      <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
        Enter your registered email address and we'll send you instructions to reset your password.
      </p>

      {submitted ? (
        <div className="alert alert-success" role="status" style={{ marginBottom: '1.5rem' }}>
          <strong>Check your inbox</strong>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', lineHeight: 1.5 }}>
            If an account exists for this email address, password reset instructions have been sent.
          </p>
          <div style={{ marginTop: '1.25rem' }}>
            <Link to="/login" className="btn-primary btn-sm">
              &larr; Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="forgot-email">Email Address *</label>
              <input
                type="email"
                id="forgot-email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError('');
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. user@example.com"
                maxLength={255}
                disabled={isSubmitting}
                className={`form-input ${fieldError ? 'input-error' : ''}`}
                autoComplete="email"
                autoFocus
              />
              {fieldError && <div className="field-error">{fieldError}</div>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'Sending Request...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              Back to Sign In
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
