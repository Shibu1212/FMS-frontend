import PropTypes from "prop-types";
import StatusBadge from "../common/StatusBadge";
import { useAuth, ROLES, hasRole } from "../../context/AuthContext.jsx";

export default function FormTable({
  forms,
  deletingFormId,
  onEdit,
  onDelete,
  onManageFields,
  onPreview,
}) {
  const { role } = useAuth();
  return (
    <div className="forms-table-container">
      <table className="forms-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {forms.map((form) => (
            <tr key={form.id}>
              <td>
                <strong>{form.name}</strong>
              </td>

              <td>{form.description || "—"}</td>

              <td>
                <StatusBadge status={form.status} />
              </td>

              <td>{new Date(form.createdAt).toLocaleDateString()}</td>

              <td>
                <div className="form-actions">
                  {!hasRole(role, ROLES.ADMIN, { exact: true }) && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => onManageFields(form)}
                    >
                      Manage Fields
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onPreview(form)}
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onEdit(form)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn-danger-outline"
                    disabled={deletingFormId === form.id}
                    onClick={() => onDelete(form)}
                  >
                    {deletingFormId === form.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

FormTable.propTypes = {
  forms: PropTypes.array.isRequired,

  deletingFormId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  onEdit: PropTypes.func.isRequired,

  onDelete: PropTypes.func.isRequired,

  onManageFields: PropTypes.func.isRequired,

  onPreview: PropTypes.func.isRequired,
};
