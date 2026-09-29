import { Link } from 'react-router-dom';
import { useAuth, ROLES, hasRole } from '../context/AuthContext.jsx';

export default function HomePage() {
  const { isAuthenticated, role, user, mustChangePassword } = useAuth();

  const displayName = user?.name || user?.email?.split('@')[0] || (role === ROLES.ADMIN ? 'Admin' : 'User');

  return (
    <div className="home-container">
      {isAuthenticated ? (
        <section className="home-dashboard-view">
          {/* Welcome Banner */}
          <div className="home-welcome-card">
            <div className="welcome-badge">Active Session</div>
            <h1 className="welcome-title">Welcome back, {displayName}!</h1>
            <p className="welcome-subtitle">
              You are signed in as{" "}
              <strong className="role-highlight">{role || "Member"}</strong>.
              Access your workspaces, manage forms, or update your profile
              below.
            </p>

            {mustChangePassword && (
              <div className="home-alert-warning">
                <div className="alert-warning-icon">⚠️</div>
                <div className="alert-warning-content">
                  <strong>Password Update Required</strong>
                  <p>
                    For security reasons, you are required to change your
                    temporary password.
                  </p>
                </div>
                <Link to="/change-password" className="btn-alert-action">
                  Update Now &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Quick Action Tiles */}
          <div className="home-tiles-grid">
            {/* Admin Tile */}
            {hasRole(role, ROLES.ADMIN, { exact: true }) && (
              <>
                <div className="home-action-tile">
                  <div className="tile-icon tile-icon-indigo">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="7" r="4" />

                      <path
                        d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M19 8v6M16 11h6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3>User Registrations</h3>
                  <p>
                    Review new account registrations, approve verified users, or
                    reject requests.
                  </p>
                  <Link to="/admin/registrations" className="tile-link">
                    Manage Requests &rarr;
                  </Link>
                </div>
              </>
            )}

            {/* Manage Users Tile - Admin Only */}
            {hasRole(role, ROLES.ADMIN, { exact: true }) && (
              <div className="home-action-tile">
                <div className="tile-icon tile-icon-indigo">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="9" cy="7" r="4" />
                    <path
                      d="M22 21v-2a4 4 0 0 0-3-3.87"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 3.13a4 4 0 0 1 0 7.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h3>Manage Users</h3>

                <p>
                  View user accounts, manage roles, and control user access.
                </p>

                <Link to="/admin/users" className="tile-link">
                  Manage Users &rarr;
                </Link>
              </div>
            )}

            {/* Form Management Tile - Admin Only */}
            {hasRole(role, ROLES.ADMIN, { exact: true }) && (
              <div className="home-action-tile">
                <div className="tile-icon tile-icon-blue">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="3"
                      width="16"
                      height="18"
                      rx="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M8 7h8M8 11h8M8 15h5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h3>Form Management</h3>

                <p>Create, edit, preview, and manage application forms.</p>

                <Link to="/forms" className="tile-link">
                  Manage Forms &rarr;
                </Link>
              </div>
            )}
            {/* My Profile Tile - Creator & Viewer Only */}
            {(hasRole(role, ROLES.FORM_CREATOR, { exact: true }) ||
              hasRole(role, ROLES.FORM_VIEWER, { exact: true })) && (
              <div className="home-action-tile">
                <div className="tile-icon tile-icon-blue">
                  <div className="tile-icon tile-icon-blue">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M4 21a8 8 0 0 1 16 0"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <h3>My Profile</h3>

                <p>
                  Keep your basic info, educations, experiences, and
                  certifications up to date.
                </p>

                <Link to="/profile" className="tile-link">
                  View Profile &rarr;
                </Link>
              </div>
            )}

            {/* My Submissions Tile */}
            {hasRole(role, ROLES.FORM_VIEWER, { exact: true }) && (
              <div className="home-action-tile">
                <div className="tile-icon tile-icon-indigo">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="14" y2="17" />
                  </svg>
                </div>

                <h3>My Submissions</h3>

                <p>
                  View the forms you have submitted, review your answers, and
                  update your submissions when needed.
                </p>

                <Link to="/my-submissions" className="tile-link">
                  View Submissions &rarr;
                </Link>
              </div>
            )}

            {/* Create Form Tile - Form Creator Only */}
            {hasRole(role, ROLES.FORM_CREATOR, { exact: true }) && (
              <div className="home-action-tile">
                <div className="tile-icon tile-icon-indigo">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="3"
                      width="16"
                      height="18"
                      rx="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M8 7h8M8 11h5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M16 15v6M13 18h6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h3>Create Form</h3>

                <p>Create a new application form and configure its fields.</p>

                <Link to="/forms" className="tile-link">
                  Create Form &rarr;
                </Link>
              </div>
            )}

            {hasRole(role, ROLES.ADMIN, { exact: true }) && (
              <div className="home-action-tile">
                <div className="tile-icon tile-icon-indigo">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="14" y2="17" />
                  </svg>
                </div>

                <h3>Form Submissions</h3>

                <p>
                  View submissions received from users and search by submitter
                  name or email.
                </p>

                <Link to="/admin/submissions" className="tile-link">
                  View Submissions &rarr;
                </Link>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Guest Hero View */
        <section className="home-guest-hero">
          <div className="hero-content">
            <div className="hero-badge">Enterprise Ready</div>
            <h1 className="hero-title">
              Streamlined Form Creation & Management
            </h1>
            <p className="hero-description">
              A centralized platform to build, publish, and govern form
              workflows with granular role-based permissions, automated
              onboarding approvals, and audit trails.
            </p>
            <div className="hero-cta-group">
              <Link to="/login" className="btn-hero-primary">
                Sign In to Account
              </Link>
              <Link to="/register" className="btn-hero-secondary">
                Request Registration &rarr;
              </Link>
            </div>
          </div>

          <div className="hero-features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h4>Role-Based Governance</h4>
              <p>
                Role authorization tiered across Administrators, Form Creators,
                and Form Viewers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h4>Modular Architecture</h4>
              <p>
                Tailored workspaces for form design, dynamic inputs, and
                real-time response capture.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>Automated Approvals</h4>
              <p>
                Administrator-governed account requests with temporary
                credential generation via email.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
