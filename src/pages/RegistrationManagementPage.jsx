import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
} from '../services/registrationService.js';

const STATUS_FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];

export default function RegistrationManagementPage() {
  const [selectedFilter, setSelectedFilter] = useState('Pending');
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Detail modal state
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Confirmation modal state for approve / reject
  const [confirmDialog, setConfirmDialog] = useState(null); // { id, name, type: 'approve' | 'reject' }
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch registrations
  useEffect(() => {
    let isCurrent = true;

    getRegistrations(selectedFilter)
      .then((data) => {
        if (isCurrent) {
          setRegistrations(data);
          setError('');
        }
      })
      .catch((err) => {
        if (isCurrent) {
          if (err.response?.status === 403) {
            setError('Access denied. Administrator privileges are required to view registrations.');
          } else if (err.response?.status === 401) {
            setError('Authentication session expired. Please sign in again.');
          } else {
            setError('Unable to load registration requests. Please ensure the backend is reachable.');
          }
          setRegistrations([]);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedFilter, refreshTrigger]);

  // Handle status filter change
  const handleFilterChange = (filter) => {
    if (filter === selectedFilter) return;
    setIsLoading(true);
    setSelectedFilter(filter);
    setFeedback(null);
  };

  // View detail
  const handleViewDetail = async (id) => {
    setLoadingDetail(true);
    setDetailError('');
    setDetailModalItem(null);

    try {
      const data = await getRegistrationById(id);
      setDetailModalItem(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setDetailError('Registration request not found.');
      } else {
        setDetailError('Failed to fetch registration details. Please try again.');
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  // Close detail modal
  const handleCloseDetail = () => {
    setDetailModalItem(null);
    setDetailError('');
  };

  // Open confirmation dialog
  const promptAction = (item, type) => {
    setConfirmDialog({
      id: item.id,
      name: item.name,
      type, // 'approve' or 'reject'
    });
  };

  // Execute approval or rejection
  const handleExecuteAction = async () => {
    if (!confirmDialog || isProcessingAction) return;

    setIsProcessingAction(true);
    setFeedback(null);

    const { id, name, type } = confirmDialog;
    const targetStatus = type === 'approve' ? 'Approved' : 'Rejected';

    try {
      await updateRegistrationStatus(id, targetStatus);

      setFeedback({
        type: 'success',
        message: `Registration for "${name}" has been successfully ${type === 'approve' ? 'approved' : 'rejected'}.`,
      });

      // Close confirmation dialog and detail modal
      setConfirmDialog(null);
      setDetailModalItem(null);

      // Refresh list
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (typeof err.response?.data === 'string' ? err.response.data : '');

      setFeedback({
        type: 'error',
        message: backendMessage || `Failed to ${type} registration for "${name}". Please try again.`,
      });
      setConfirmDialog(null);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const formatDateTime = (isoDateString) => {
    if (!isoDateString) return '—';
    try {
      return new Date(isoDateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoDateString;
    }
  };

  return (
    <section className="page-container registrations-page">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="breadcrumb-nav">
        <Link to="/admin" className="breadcrumb-link">
          ← Back to Admin Dashboard
        </Link>
      </nav>

      <header className="page-header">
        <div>
          <h1>Registration Management</h1>
          <p className="page-subtitle">
            Review, approve, or reject user registration requests for the Form Management System.
          </p>
        </div>
      </header>

      {/* Global feedback messages */}
      {feedback && (
        <div
          className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}
          role="alert"
        >
          {feedback.message}
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-bar" role="toolbar" aria-label="Status Filters">
        <span className="filter-label">Filter Status:</span>
        <div className="filter-tabs">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-tab ${selectedFilter === filter ? 'filter-tab-active' : ''}`}
              onClick={() => handleFilterChange(filter)}
              disabled={isLoading}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Registration Table / List */}
      {isLoading ? (
        <div className="loading-state" role="status">
          <p>Loading registration requests...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="empty-state" role="status">
          <h3>No registration requests found.</h3>
          <p>
            {selectedFilter === 'All'
              ? 'There are currently no registration requests in the system.'
              : `There are no registration requests with status "${selectedFilter}".`}
          </p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table" aria-label="Registration Requests">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Requested At</th>
                <th>Reviewed At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((item) => {
                const isPending = item.status === 'Pending';
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>#{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className={`status-pill status-${item.status?.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDateTime(item.requestedAt)}</td>
                    <td>{formatDateTime(item.reviewedAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="btn-table btn-view"
                          onClick={() => handleViewDetail(item.id)}
                          title="View registration details"
                        >
                          View
                        </button>
                        {isPending && (
                          <>
                            <button
                              type="button"
                              className="btn-table btn-approve"
                              onClick={() => promptAction(item, 'approve')}
                              disabled={isProcessingAction}
                              title="Approve registration"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn-table btn-reject"
                              onClick={() => promptAction(item, 'reject')}
                              disabled={isProcessingAction}
                              title="Reject registration"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Registration Details Modal */}
      {(detailModalItem || loadingDetail || detailError) && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-card">
            <div className="modal-header">
              <h2 id="modal-title">Registration Details</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseDetail}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {loadingDetail && <p>Loading details...</p>}
              {detailError && <div className="alert alert-error">{detailError}</div>}
              {detailModalItem && (
                <div className="detail-fields">
                  <div className="detail-row">
                    <span className="detail-label">Request ID:</span>
                    <span className="detail-value">#{detailModalItem.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{detailModalItem.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email Address:</span>
                    <span className="detail-value">{detailModalItem.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span className={`status-pill status-${detailModalItem.status?.toLowerCase()}`}>
                        {detailModalItem.status}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Requested Date:</span>
                    <span className="detail-value">{formatDateTime(detailModalItem.requestedAt)}</span>
                  </div>
                  {detailModalItem.reviewedAt && (
                    <div className="detail-row">
                      <span className="detail-label">Reviewed Date:</span>
                      <span className="detail-value">{formatDateTime(detailModalItem.reviewedAt)}</span>
                    </div>
                  )}
                  {detailModalItem.reviewedBy && (
                    <div className="detail-row">
                      <span className="detail-label">Reviewed By Admin ID:</span>
                      <span className="detail-value">#{detailModalItem.reviewedBy}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {detailModalItem && detailModalItem.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-approve"
                    style={{ padding: '0.4rem 0.9rem', borderRadius: '4px' }}
                    onClick={() => promptAction(detailModalItem, 'approve')}
                    disabled={isProcessingAction}
                  >
                    Approve Request
                  </button>
                  <button
                    type="button"
                    className="btn-reject"
                    style={{ padding: '0.4rem 0.9rem', borderRadius: '4px' }}
                    onClick={() => promptAction(detailModalItem, 'reject')}
                    disabled={isProcessingAction}
                  >
                    Reject Request
                  </button>
                </div>
              )}
              <button type="button" className="btn-secondary" onClick={handleCloseDetail}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 id="confirm-title">
                {confirmDialog.type === 'approve' ? 'Approve Registration' : 'Reject Registration'}
              </h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to{' '}
                <strong>{confirmDialog.type}</strong> the registration request for{' '}
                <strong>{confirmDialog.name}</strong>?
              </p>
              {confirmDialog.type === 'approve' && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                  This will provision their user account, assign the FORM_VIEWER role, and send an account approval
                  email with a temporary password.
                </p>
              )}
              {confirmDialog.type === 'reject' && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                  The request will be marked as Rejected and no user account will be created.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmDialog(null)}
                disabled={isProcessingAction}
              >
                Cancel
              </button>
              <button
                type="button"
                className={confirmDialog.type === 'approve' ? 'btn-approve' : 'btn-reject'}
                style={{ padding: '0.45rem 1rem', borderRadius: '4px' }}
                onClick={handleExecuteAction}
                disabled={isProcessingAction}
              >
                {isProcessingAction
                  ? `${confirmDialog.type === 'approve' ? 'Approving...' : 'Rejecting...'}`
                  : `Confirm ${confirmDialog.type === 'approve' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
