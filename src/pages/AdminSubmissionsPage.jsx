import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../components/common/AlertMessage";
import { getForms, getFormResponses } from "../services/formService.js";

export default function AdminSubmissionsPage() {
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [submissions, setSubmissions] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingForms, setLoadingForms] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState("");
  

  useEffect(() => {
    loadForms();
  }, []);

  async function loadForms() {
    try {
      setLoadingForms(true);
      setError("");

      const data = await getForms();

      setForms(data.items || []);

      if (data.items?.length > 0) {
        setSelectedFormId(String(data.items[0].id));
      }
    } catch (err) {
      console.error("Failed to load forms:", err);

      setError(err?.response?.data?.message || "Failed to load forms.");
    } finally {
      setLoadingForms(false);
    }
  }

  useEffect(() => {
    if (!selectedFormId) {
      setSubmissions([]);
      return;
    }

    loadSubmissions();
  }, [selectedFormId, page, pageSize, sortBy, sortOrder]);

  async function loadSubmissions(searchValue = search) {
    try {
      setLoadingSubmissions(true);
      setError("");

      const data = await getFormResponses(selectedFormId, {
        page,
        pageSize,
        search: searchValue,
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

      setError(err?.response?.data?.message || "Failed to load submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  }

  function handleSearch(event) {
    event.preventDefault();

    setPage(1);
    loadSubmissions(search);
  }

  function handleClearSearch() {
    setSearch("");
    setPage(1);
    loadSubmissions("");
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

  return (
    <section className="page-container">
      <header className="admin-submissions-header">
        <div className="admin-submissions-title">
          <h1 className="dashboard-title">Form Submissions</h1>

          <p className="dashboard-subtitle">
            View and search submissions received for your forms.
          </p>
        </div>

        <form className="admin-submissions-search" onSubmit={handleSearch}>
          <div className="filter-group search-group">
            <label htmlFor="submission-search">Search submissions</label>

            <input
              id="submission-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email..."
              disabled={!selectedFormId}
            />
          </div>

          <button
            type="submit"
            className="btn-primary search-button"
            disabled={!selectedFormId || loadingSubmissions}
          >
            {loadingSubmissions ? "Searching..." : "Search"}
          </button>

          {search && (
            <button
              type="button"
              className="btn-secondary clear-button"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          )}
        </form>
      </header>

      <AlertMessage type="error" message={error} />

      <div className="admin-submissions-form-filter">
        <div className="filter-group">
          <label htmlFor="form-select">Form</label>

          <select
            id="form-select"
            value={selectedFormId}
            onChange={(event) => {
              setSelectedFormId(event.target.value);
              setPage(1);
            }}
            disabled={loadingForms}
          >
            <option value="">
              {loadingForms ? "Loading forms..." : "Select a form"}
            </option>

            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingSubmissions ? (
        <div className="loading-state">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="empty-state">No submissions found.</div>
      ) : (
        <div className="submissions-table-card">
          <div className="submissions-table-header">
            <div>
              <h2>Submissions</h2>
              <p>
                {totalCount} submission
                {totalCount !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          <div className="submissions-table-wrapper">
            <table className="data-table submissions-table">
              <thead>
                <tr>
                  <th>Submitted By</th>
                  <th>Email</th>
                  <th>Submitted At</th>
                  <th className="action-column">Action</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <div className="submitter-cell">
                        <div className="submitter-avatar">
                          {(submission.submittedByName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>{submission.submittedByName || "Unknown"}</span>
                      </div>
                    </td>

                    <td className="email-cell">
                      {submission.submittedByEmail || "—"}
                    </td>

                    <td>{new Date(submission.submittedAt).toLocaleString()}</td>

                    <td className="action-column">
                      <button
                        type="button"
                        className="btn-secondary table-action-button"
                        onClick={() =>
                          navigate(`/admin/submissions/${submission.id}`)
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
        </div>
      )}
    </section>
  );
}
