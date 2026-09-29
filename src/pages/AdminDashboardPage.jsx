import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext.jsx';
import { getRegistrations } from '../services/registrationService.js';

export default function AdminDashboardPage() {
  const { role, mustChangePassword } = useAuth();
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState(null);

  // Fetch real pending registrations count
  useEffect(() => {
    let isMounted = true;
    getRegistrations('Pending')
      .then((data) => {
        if (isMounted) {
          setPendingCount(data.length);
        }
      })
      .catch(() => {
        // Leave pendingCount as fallback if network fails
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryMetrics = [
    {
      id: 'pending-registrations',
      title: 'Pending Registrations',
      value: pendingCount !== null ? String(pendingCount) : '—',
      description: 'Awaiting administrator review and approval',
      status: pendingCount !== null && pendingCount > 0 ? 'Action Needed' : 'All Clear',
      badgeClass: pendingCount !== null && pendingCount > 0 ? 'metric-badge-warning' : 'metric-badge-success',
    },
    {
      id: 'total-users',
      title: 'Total Users',
      value: '12',
      description: 'Registered user accounts across all roles',
      status: 'Healthy',
      badgeClass: 'metric-badge-success',
    },
    {
      id: 'total-forms',
      title: 'Forms',
      value: '8',
      description: 'Configured and published form templates',
      status: 'Active',
      badgeClass: 'metric-badge-info',
    },
    
  ];

  const quickActions = [
    {
      id: "manage-registrations",
      title: "Manage Registrations",
      description:
        "Inspect pending registration requests, approve new accounts, or reject applications.",
      buttonLabel: "Manage Registrations",
      badge: "Active",
      action: () => navigate("/admin/registrations"),
    },
    {
      id: "manage-users",
      title: "Manage Users",
      description:
        "View user profiles, manage account activation states, and inspect assigned roles.",
      buttonLabel: "Manage Users",
      badge: "Active",
      action: () => navigate("/admin/users"),
    },
    
  ];

  return (
    <section className="page-container admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome to the administration panel. Manage system users, registration approvals, and system settings.
          </p>
        </div>

        <div className="session-status-card">
          <span className="session-status-label">Active Session</span>
          <span className="session-status-value">Role: {role || ROLES.ADMIN}</span>
          {mustChangePassword && (
            <span className="session-status-warning">Password Change Required</span>
          )}
        </div>
      </header>

      {/* Summary Metrics Section */}
      <section className="dashboard-section" aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="section-title">
          System Overview
        </h2>
        <div className="dashboard-metrics-grid">
          {summaryMetrics.map((metric) => (
            <div key={metric.id} className="metric-card">
              <div className="metric-header">
                <span className="metric-title">{metric.title}</span>
                <span className={`metric-badge ${metric.badgeClass}`}>
                  {metric.status}
                </span>
              </div>
              <div className="metric-value">{metric.value}</div>
              <p className="metric-description">{metric.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="dashboard-section" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="section-title">
          Quick Actions
        </h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <div key={action.id} className="action-card">
              <div className="action-header">
                <h3 className="action-title">{action.title}</h3>
                <span className="action-badge">{action.badge}</span>
              </div>
              <p className="action-description">{action.description}</p>
              <button
                type="button"
                className="btn-primary action-btn"
                onClick={action.action}
              >
                {action.buttonLabel} →
              </button>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
