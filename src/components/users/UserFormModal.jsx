import PropTypes from "prop-types";
import { createPortal } from "react-dom";

export default function UserFormModal({
  open,
  editingUser,
  userFormData,
  roles,
  savingUser,
  onClose,
  onSubmit,
  onInputChange,
}) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="user-management-overlay" onClick={onClose}>
      <div
        className="user-management-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="user-management-header">
          <div>
            <h2>{editingUser ? "Edit User" : "Create User"}</h2>

            <p>
              {editingUser
                ? "Update the user's basic information."
                : "Create a new application user."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={savingUser}
          >
            ×
          </button>
        </div>

        <form className="user-management-form" onSubmit={onSubmit}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="user-name">Name</label>

            <input
              id="user-name"
              name="name"
              type="text"
              className="form-input"
              value={userFormData.name}
              onChange={onInputChange}
              placeholder="Enter user name"
              disabled={savingUser}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="user-email">Email</label>

            <input
              id="user-email"
              name="email"
              type="email"
              className="form-input"
              value={userFormData.email}
              onChange={onInputChange}
              placeholder="Enter user email"
              disabled={savingUser}
            />
          </div>

          {/* Role - Create only */}
          {!editingUser && (
            <div className="form-group">
              <label htmlFor="user-role">Role</label>

              <select
                id="user-role"
                name="roleId"
                className="form-input"
                value={userFormData.roleId}
                onChange={onInputChange}
                disabled={savingUser}
              >
                <option value="">Select Role</option>

                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Create Information */}
          {!editingUser && (
            <div className="user-create-info">
              <strong>Important:</strong>

              <span>
                A temporary password will be generated automatically and sent to
                the user's email. The user will be required to change the
                password after login.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="user-management-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={savingUser}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={savingUser}>
              {savingUser
                ? "Saving..."
                : editingUser
                  ? "Update User"
                  : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

UserFormModal.propTypes = {
  open: PropTypes.bool.isRequired,

  editingUser: PropTypes.object,

  userFormData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    roleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  }).isRequired,

  roles: PropTypes.array.isRequired,

  savingUser: PropTypes.bool.isRequired,

  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
};
