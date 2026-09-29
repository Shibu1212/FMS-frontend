import { useAuth, ROLES, hasRole } from '../context/AuthContext.jsx';

export default function CreatorPlaceholderPage() {
  const { role } = useAuth();

  return (
    <section className="page-container">
      <h1>Create Form</h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Form design and builder area (Role: {ROLES.FORM_CREATOR}).
      </p>

      {hasRole(role, ROLES.FORM_CREATOR) && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
          <strong>Creator Workspace Active</strong>
          <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.25rem' }}>
            Form templates, builder components, and submission configurations will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
