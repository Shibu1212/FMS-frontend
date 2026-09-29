import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/authService.js';
import { useAuth, ROLES } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { isAuthenticated, role, mustChangePassword: isMustChangePassword, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fromLocation = location.state?.from;
  const redirectPath = fromLocation?.pathname
    ? `${fromLocation.pathname}${fromLocation.search || ''}`
    : null;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, directly redirect to appropriate destination
  useEffect(() => {
    if (isAuthenticated) {
      if (isMustChangePassword) {
        navigate('/change-password', { replace: true });
      } else if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (role === ROLES.ADMIN) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [isAuthenticated, isMustChangePassword, redirectPath, role, navigate, location.key]);


  const validate = () => {
    const errors = {};
    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email is required.';
    } else if (trimmedEmail.length > 255) {
      errors.email = 'Email must not exceed 255 characters.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
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
    setLoginSuccess(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiLogin({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Store tokens in browser storage and update AuthContext state
      login(data);

      // Clear form fields for security
      setFormData({ email: '', password: '' });
      setFieldErrors({});

      const userRole = data?.role;
      if (data?.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (userRole === ROLES.ADMIN) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        // Validation errors (HTTP 400 ProblemDetails)
        const backendErrors = error.response.data.errors;
        const newFieldErrors = {};

        if (backendErrors.Email || backendErrors.email) {
          newFieldErrors.email = (backendErrors.Email || backendErrors.email).join(' ');
        }
        if (backendErrors.Password || backendErrors.password) {
          newFieldErrors.password = (backendErrors.Password || backendErrors.password).join(' ');
        }

        setFieldErrors(newFieldErrors);
        setServerError(
          error.response.data.title || 'Please correct the errors in the login form.'
        );
      } else if (error.response) {
        // Backend returned an error response (e.g. 401, 500)
        const data = error.response.data;
        const errorText = typeof data === 'string' ? data : data?.message || data?.title || '';

        if (
          error.response.status === 401 ||
          errorText.includes('Invalid email or password') ||
          errorText.includes('UnauthorizedAccessException')
        ) {
          setServerError('Invalid email or password. Please verify your credentials and try again.');
        } else if (errorText.toLowerCase().includes('inactive')) {
          setServerError('Your account is inactive. Please contact an administrator.');
        } else if (error.response.status === 400) {
          setServerError('Invalid login request details provided.');
        } else {
          setServerError('Unable to sign in. Please check your credentials and try again.');
        }
      } else if (error.request) {
        // Network or unreachable server error
        setServerError(
          'Unable to reach the server. Please ensure the backend is running and try again.'
        );
      } else {
        setServerError('An unexpected error occurred during login. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-container form-card">
      <h1>Sign In</h1>
      <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
        Enter your credentials to access your Form Management System account.
      </p>

      {isAuthenticated && !loginSuccess && (
        <div className="alert alert-success" role="status" style={{ marginBottom: '1.5rem' }}>
          <strong>You are currently signed in.</strong>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {isMustChangePassword
              ? 'Your account requires a password update upon first login.'
              : 'Your authentication session is active.'}
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                logout();
                setFormData({ email: '', password: '' });
                setFieldErrors({});
                setServerError('');
              }}
              className="btn-primary"
              style={{
                width: 'auto',
                padding: '0.4rem 0.85rem',
                fontSize: '0.875rem',
                backgroundColor: '#dc2626',
              }}
            >
              Sign Out
            </button>
            <Link
              to="/"
              style={{
                fontSize: '0.875rem',
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Go to Home →
            </Link>
          </div>
        </div>
      )}


      {loginSuccess && (
        <div className="alert alert-success" role="alert">
          <strong>{loginSuccess.message}</strong>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Authentication verified against backend (session valid for {loginSuccess.expiresIn}s).
            {loginSuccess.mustChangePassword && (
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '4px',
                  fontWeight: 500,
                }}
              >
                Notice: Password update is required on first login (MustChangePassword = true).
              </div>
            )}
          </div>
        </div>
      )}

      {serverError && (
        <div className="alert alert-error" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="off"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. user@example.com"
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

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
            <Link
              to="/forgot-password"
              style={{ fontSize: '0.8125rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isSubmitting}
            className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
          />
          {fieldErrors.password && (
            <div id="password-error" className="field-error">
              {fieldErrors.password}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
          Request Registration
        </Link>
      </div>
    </section>
  );
}
