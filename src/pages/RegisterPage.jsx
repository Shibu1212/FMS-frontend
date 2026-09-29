import { useState } from 'react';
import { submitRegistration } from '../services/registrationService.js';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      errors.name = 'Name is required.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Name must not exceed 100 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required.';
    } else if (trimmedEmail.length > 255) {
      errors.email = 'Email must not exceed 255 characters.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitRegistration({
        name: formData.name,
        email: formData.email,
      });

      setSuccessMessage(
        'Your registration request has been submitted successfully and is awaiting administrator approval.'
      );
      setFormData({ name: '', email: '' });
      setFieldErrors({});
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle ASP.NET Core ModelState/ProblemDetails validation errors
        const backendErrors = error.response.data.errors;
        const newFieldErrors = {};

        if (backendErrors.Name || backendErrors.name) {
          newFieldErrors.name = (backendErrors.Name || backendErrors.name).join(' ');
        }
        if (backendErrors.Email || backendErrors.email) {
          newFieldErrors.email = (backendErrors.Email || backendErrors.email).join(' ');
        }

        setFieldErrors(newFieldErrors);
        setServerError(
          error.response.data.title || 'Please correct the errors in the registration form.'
        );
      } else if (error.response?.status === 409) {
        setServerError('A user with this email address already exists.');
      } else if (error.response?.data?.detail || error.response?.data?.message) {
        setServerError(error.response.data.detail || error.response.data.message);
      } else if (error.response?.status === 400) {
        setServerError('Invalid registration details provided.');
      } else if (error.request) {
        setServerError(
          'Unable to reach the server. Please ensure the backend service is running and try again.'
        );
      } else {
        setServerError('An unexpected error occurred while submitting your registration request.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-container form-card">
      <h1>Request Registration</h1>
      <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
        Submit your details to request an account. Once approved by an administrator, you will receive login credentials.
      </p>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {serverError && (
        <div className="alert alert-error" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            maxLength={100}
            disabled={isSubmitting}
            className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
            aria-describedby={fieldErrors.name ? 'name-error' : undefined}
          />
          {fieldErrors.name && (
            <div id="name-error" className="field-error">
              {fieldErrors.name}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@example.com"
            maxLength={255}
            disabled={isSubmitting}
            className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <div id="email-error" className="field-error">
              {fieldErrors.email}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Submitting Request...' : 'Submit Registration Request'}
        </button>
      </form>
    </section>
  );
}
