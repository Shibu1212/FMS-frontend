import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <section className="page-container forbidden-card">
      <div className="forbidden-code">403</div>
      <h1 className="forbidden-title">Access Denied</h1>
      <p className="forbidden-message">
        You do not have permission to access this page.
      </p>
      <Link to="/" className="btn-primary forbidden-btn">
        Back to Home
      </Link>
    </section>
  );
}
