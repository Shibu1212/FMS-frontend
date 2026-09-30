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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSubmissions();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [page, pageSize, search, sortBy, sortOrder]);

  async function loadSubmissions() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyFormResponses({
        page,
        pageSize,
        search,
        sortBy,
        sortOrder,
      });

      setSubmissions(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 0);
      setHasPreviousPage(Boolean(data.hasPreviousPage));
      setHasNextPage(Boolean(data.hasNextPage));
    } catch (err) {
      console.error("Failed to load submissions:", err);

      setError(
        err?.response?.data?.message || "Failed to load your submissions.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }

    setPage(1);
  }

  function handlePreviousPage() {
    if (hasPreviousPage) {
      setPage((previous) => previous - 1);
    }
  }

  function handleNextPage() {
    if (hasNextPage) {
      setPage((previous) => previous + 1);
    }
  }

  function handlePageSizeChange(event) {
    setPageSize(Number(event.target.value));
    setPage(1);
  }

  function getSortIndicator(column) {
    if (sortBy !== column) {
      return "";
    }

    return sortOrder === "asc" ? " ↑" : " ↓";
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

      <div className="section-header">
        <div>
          <h2 className="section-title">Submissions</h2>

          <span>
            {totalCount} {totalCount === 1 ? "submission" : "submissions"}
          </span>
        </div>

        <input
          type="text"
          placeholder="Search forms..."
          value={search}
          onChange={handleSearchChange}
          className="form-search-input"
        />
      </div>

      <AlertMessage type="error" message={error} />

      {submissions.length === 0 ? (
        <div className="empty-state">
          {search
            ? "No submissions found."
            : "You have not submitted any forms yet."}
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="table-sort-button"
                      onClick={() => handleSort("formname")}
                    >
                      Form Name{getSortIndicator("formname")}
                    </button>
                  </th>

                  <th>
                    <button
                      type="button"
                      className="table-sort-button"
                      onClick={() => handleSort("submittedat")}
                    >
                      Submitted At{getSortIndicator("submittedat")}
                    </button>
                  </th>

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
          <div className="pagination-container">
            <div className="pagination-info">
              Showing page {page} of {totalPages}
            </div>

            <div className="pagination-controls">
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage}
              >
                Previous
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleNextPage}
                disabled={!hasNextPage}
              >
                Next
              </button>

              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="page-size-select"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
