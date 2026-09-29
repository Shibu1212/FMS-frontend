import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyFormResponses } from "../services/formService.js";
import LoadingState from "../components/common/LoadingState";
import AlertMessage from "../components/common/AlertMessage";

export default function MySubmissionsPage() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyFormResponses();

      setSubmissions(data);
    } catch (err) {
      console.error("Failed to load submissions:", err);

      setError(
        err?.response?.data?.message || "Failed to load your submissions.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="page-container">
        <LoadingState message="Loading your submissions..." />
      </section>
    );
  }

  return (
    <section className="page-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Submissions</h1>
          <p className="dashboard-subtitle">
            View the forms you have submitted.
          </p>
        </div>
      </header>

      <AlertMessage type="error" message={error} />

      {submissions.length === 0 ? (
        <div className="empty-state">You have not submitted any forms yet.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Form Name</th>
                <th>Submitted At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.formName || "—"}</td>

                  <td>{new Date(submission.submittedAt).toLocaleString()}</td>

                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() =>
                        navigate(`/my-submissions/${submission.id}`)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
