import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES, hasRole } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, role, user, mustChangePassword, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsDropdownOpen(false);
  }

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  // Format initials for avatar
  const displayName = user?.name || user?.email?.split('@')[0] || (role === ROLES.ADMIN ? 'Admin' : 'User');
  const userInitial = displayName.charAt(0).toUpperCase() || 'U';

  const getRoleLabel = () => {
    switch (role) {
      case ROLES.ADMIN:
        return 'Admin';
      case ROLES.FORM_CREATOR:
        return 'Creator';
      case ROLES.FORM_VIEWER:
        return 'Viewer';
      default:
        return role || 'Member';
    }
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case ROLES.ADMIN:
        return 'role-badge role-badge-admin';
      case ROLES.FORM_CREATOR:
        return 'role-badge role-badge-creator';
      case ROLES.FORM_VIEWER:
        return 'role-badge role-badge-viewer';
      default:
        return 'role-badge';
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Left: Brand + Primary Navigation */}
        <div className="navbar-left">
          <NavLink to="/" className="navbar-brand">
            <svg
              className="navbar-brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="navbar-brand-text">Form Management</span>
          </NavLink>

          <nav className="navbar-main-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
            >
              Home
            </NavLink>

            {isAuthenticated && (
              <>
                {/* Creator navigation (Visible to FORM_CREATOR and ADMIN) */}
                {hasRole(role, ROLES.FORM_CREATOR, { exact: true }) && (
                  <NavLink
                    to="/forms"
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "nav-item-active" : ""}`
                    }
                  >
                    Create Form
                  </NavLink>
                )}

                {/* Viewer navigation (Visible to FORM_VIEWER and ADMIN) */}
                {hasRole(role, ROLES.FORM_VIEWER, { exact: true }) && (
                  <NavLink
                    to="/published-forms"
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "nav-item-active" : ""}`
                    }
                  >
                    Forms
                  </NavLink>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Right: User Menu or Auth CTAs */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="navbar-user-controls">
              {/* Mandatory password change prompt badge */}
              {mustChangePassword && (
                <NavLink
                  to="/change-password"
                  className="nav-pw-alert"
                  title="Password update is required upon initial login"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="nav-pw-alert-icon"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Update Password</span>
                </NavLink>
              )}

              {/* Role Badge */}
              <span className={getRoleBadgeClass()}>{getRoleLabel()}</span>

              {/* User Account Dropdown */}
              <div className="user-menu-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`user-menu-button ${isDropdownOpen ? "user-menu-button-active" : ""}`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User account menu"
                >
                  <div className="user-avatar" aria-hidden="true">
                    {userInitial}
                  </div>
                  <span className="user-menu-name">{displayName}</span>
                  <svg
                    className={`user-menu-chevron ${isDropdownOpen ? "chevron-up" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Dropdown Card */}
                {isDropdownOpen && (
                  <div className="user-dropdown-card" role="menu">
                    <div className="user-dropdown-header">
                      <div className="dropdown-user-name">{displayName}</div>
                      {user?.email && (
                        <div className="dropdown-user-email">{user.email}</div>
                      )}
                      <div className="dropdown-user-role">
                        Role: <strong>{getRoleLabel()}</strong>
                      </div>
                    </div>

                    <div className="user-dropdown-divider" />

                    <div className="user-dropdown-links">
                      <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                          `user-dropdown-item ${isActive ? "dropdown-item-active" : ""}`
                        }
                        role="menuitem"
                      >
                        <svg
                          className="dropdown-item-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>My Profile</span>
                      </NavLink>

                      <NavLink
                        to="/change-password"
                        className={({ isActive }) =>
                          `user-dropdown-item ${isActive ? "dropdown-item-active" : ""}`
                        }
                        role="menuitem"
                      >
                        <svg
                          className="dropdown-item-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Change Password</span>
                        {mustChangePassword && (
                          <span
                            className="dropdown-alert-dot"
                            title="Action required"
                          />
                        )}
                      </NavLink>

                      {hasRole(role, ROLES.ADMIN, { exact: true }) && (
                        <NavLink
                          to="/admin/registrations"
                          className={({ isActive }) =>
                            `user-dropdown-item ${isActive ? "dropdown-item-active" : ""}`
                          }
                          role="menuitem"
                        >
                          <svg
                            className="dropdown-item-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <span>Manage Registrations</span>
                        </NavLink>
                      )}
                    </div>

                    <div className="user-dropdown-divider" />

                    <div className="user-dropdown-footer">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="user-dropdown-logout-btn"
                        role="menuitem"
                      >
                        <svg
                          className="dropdown-item-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="navbar-guest-actions">
              <NavLink to="/login" className="nav-btn-ghost">
                Sign In
              </NavLink>
              <NavLink to="/register" className="nav-btn-primary">
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
