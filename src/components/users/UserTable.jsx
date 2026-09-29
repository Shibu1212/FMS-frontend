import PropTypes from "prop-types";
import StatusBadge from "../common/StatusBadge";

export default function UserTable({
  users,
  roles,
  changingRoleFor,
  changingStatusFor,
  deletingUserId,
  openActionMenu,
  onToggleActionMenu,
  onView,
  onEdit,
  onRoleChange,
  onStatusChange,
  onDelete,
}) {
  return (
    <div className="users-table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>

              <td>{user.email}</td>

              <td>
                <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
              </td>

              <td>
                <select
                  value={
                    roles.find((role) => role.name === user.role)?.id || ""
                  }
                  disabled={changingRoleFor === user.id}
                  onChange={(event) =>
                    onRoleChange(user.id, event.target.value)
                  }
                >
                  <option value="" disabled>
                    Select Role
                  </option>

                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                {changingRoleFor === user.id && <span>Updating...</span>}
              </td>

              <td>
                <div className="user-action-menu">
                  <button
                    type="button"
                    className="user-action-menu-button"
                    onClick={() => onToggleActionMenu(user.id)}
                    aria-label={`Actions for ${user.name}`}
                  >
                    ⋮
                  </button>

                  {openActionMenu === user.id && (
                    <div className="user-action-dropdown">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => {
                          onView(user);
                          onToggleActionMenu(user.id);
                        }}
                      >
                        View Details
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          onEdit(user);
                          onToggleActionMenu(user.id);
                        }}
                      >
                        Edit
                      </button>

                      {/* Activate / Deactivate */}
                      <button
                        type="button"
                        disabled={changingStatusFor === user.id}
                        onClick={() => {
                          onStatusChange(user);
                          onToggleActionMenu(user.id);
                        }}
                      >
                        {changingStatusFor === user.id
                          ? "Updating..."
                          : user.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className="danger-action"
                        disabled={deletingUserId === user.id}
                        onClick={() => {
                          onDelete(user);
                          onToggleActionMenu(user.id);
                        }}
                      >
                        {deletingUserId === user.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  roles: PropTypes.array.isRequired,

  changingRoleFor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  changingStatusFor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  deletingUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  openActionMenu: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  onToggleActionMenu: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onRoleChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
