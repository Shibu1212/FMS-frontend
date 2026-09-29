import PropTypes from "prop-types";
import { createPortal } from "react-dom";

export default function FormFormModal({
  open,
  editingForm,
  formData,
  saving,
  formStatuses,
  onClose,
  onSubmit,
  onInputChange,
}) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="form-management-overlay" onClick={onClose}>
      <div
        className="form-management-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="form-management-header">
          <div>
            <h2>{editingForm ? "Edit Form" : "Create Form"}</h2>

            <p>
              {editingForm
                ? "Update form details and status."
                : "Create a new form. New forms start as DRAFT."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form className="form-management-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="form-name">Name</label>

            <input
              id="form-name"
              name="name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={onInputChange}
              placeholder="Enter form name"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="form-description">Description</label>

            <textarea
              id="form-description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={onInputChange}
              placeholder="Enter form description"
              rows="4"
              disabled={saving}
            />
          </div>

          {editingForm && (
            <div className="form-group">
              <label htmlFor="form-status">Status</label>

              <select
                id="form-status"
                name="status"
                className="form-input"
                value={formData.status}
                onChange={onInputChange}
                disabled={saving}
              >
                {formStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-management-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving
                ? "Saving..."
                : editingForm
                  ? "Update Form"
                  : "Create Form"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

FormFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  editingForm: PropTypes.object,
  formData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  saving: PropTypes.bool.isRequired,
  formStatuses: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
};
