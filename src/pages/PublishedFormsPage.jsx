import { useEffect, useState } from "react";
import {
  getPublishedForms
} from "../services/formService.js";
import { useNavigate } from "react-router-dom";

export default function PublishedFormsPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPublishedForms();
  }, []);

  async function loadPublishedForms() {
    try {
      setLoading(true);
      setError("");

      const data = await getPublishedForms();
      setForms(data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load published forms.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="page-container">
        <div className="loading-state">Loading published forms...</div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Published Forms</h1>

          <p className="dashboard-subtitle">
            View forms that are currently published.
          </p>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Available Forms</h2>

          <span>{forms.length} forms</span>
        </div>

        {forms.length === 0 ? (
          <div className="empty-state">No published forms available.</div>
        ) : (
          <div className="published-forms-grid">
            {forms.map((form) => (
              <article key={form.id} className="published-form-card">
                <div className="published-form-card-content">
                  <div className="published-form-card-header">
                    <h3>{form.name}</h3>

                    <span className="form-status form-status-published">
                      PUBLISHED
                    </span>
                  </div>

                  <p className="published-form-description">
                    {form.description || "No description available."}
                  </p>

                  <div className="published-form-footer">
                    <span className="published-form-date">Published form</span>

                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigate(`/forms/published/${form.id}`)}
                      
                    >
                      View Form
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      
    </section>
  );
}
