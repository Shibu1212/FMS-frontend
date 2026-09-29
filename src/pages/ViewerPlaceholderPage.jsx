import { useAuth, ROLES, hasRole } from '../context/AuthContext.jsx';

export default function ViewerPlaceholderPage() {
  const { role } = useAuth();

  return (
    <section className="page-container">
      <h1>Forms Directory</h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Forms directory and submission area (Role: {ROLES.FORM_VIEWER}).
      </p>

      {hasRole(role, ROLES.FORM_VIEWER) && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <strong>Viewer Catalog Active</strong>
          <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>
            Assigned forms and submission history will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
