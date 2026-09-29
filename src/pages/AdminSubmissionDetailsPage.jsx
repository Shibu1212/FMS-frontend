import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AlertMessage from "../components/common/AlertMessage";
import { getFormResponseById, getFormById } from "../services/formService.js";

export default function AdminSubmissionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubmission();
  }, [id]);

  async function loadSubmission() {
    try {
      setLoading(true);
      setError("");

      // Get submission details
      const submissionData = await getFormResponseById(id);

      setSubmission(submissionData);

      // Get form details
      const formData = await getFormById(submissionData.formId);

      setForm(formData);
    } catch (err) {
      console.error("Failed to load submission:", err);

      setError(err?.response?.data?.message || "Failed to load submission.");
    } finally {
      setLoading(false);
    }
  }

  function getFieldLabel(fieldId) {
    const field = form?.fields?.find((item) => item.id === fieldId);

    return field?.label || `Field ${fieldId}`;
  }

  if (loading) {
    return (
      <section className="page-container">
        <div className="loading-state">Loading submission...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-container">
        <AlertMessage type="error" message={error} />
      </section>
    );
  }

  if (!submission) {
    return (
      <section className="page-container">
        <AlertMessage type="error" message="Submission not found." />
      </section>
    );
  }

  return (
    <section className="page-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {submission.formName || "Submission"}
          </h1>

          <p className="dashboard-subtitle">
            Submitted by {submission.submittedByName || "Unknown"}
            {submission.submittedByEmail
              ? ` (${submission.submittedByEmail})`
              : ""}
            {" on "}
            {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>
      </header>

      <div className="form-response-details">
        {submission.values?.map((item) => (
          <div key={item.formFieldId} className="form-response-item">
            <div className="form-response-label">
              {getFieldLabel(item.formFieldId)}
            </div>

            <div className="form-response-value">{item.value || "—"}</div>
          </div>
        ))}
      </div>

      <div className="published-form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/admin/submissions")}
        >
          Back to Submissions
        </button>
      </div>
    </section>
  );
}
