import PropTypes from "prop-types";
import StatusBadge from "../common/StatusBadge";
import { useAuth, ROLES, hasRole } from "../../context/AuthContext.jsx";

export default function FormTable({
  forms,
  deletingFormId,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onManageFields,
  onPreview,
}) {
  const { role } = useAuth();

  function getSortIndicator(column) {
    if (sortBy !== column) {
      return "";
    }

    return sortOrder === "asc" ? " ↑" : " ↓";
  }

  return (
    <div className="forms-table-container">
      <table className="forms-table">
        <thead>
          <tr>
            <th>
              <button
                type="button"
                className="table-sort-button"
                onClick={() => onSort("name")}
              >
                Name{getSortIndicator("name")}
              </button>
            </th>

            <th>Description</th>

            <th>
              <button
                type="button"
                className="table-sort-button"
                onClick={() => onSort("status")}
              >
                Status{getSortIndicator("status")}
              </button>
            </th>

            <th>
              <button
                type="button"
                className="table-sort-button"
                onClick={() => onSort("createdAt")}
              >
                Created{getSortIndicator("createdAt")}
              </button>
            </th>

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

  sortBy: PropTypes.string,

  sortOrder: PropTypes.oneOf(["asc", "desc"]),

  onSort: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,

  onDelete: PropTypes.func.isRequired,

  onManageFields: PropTypes.func.isRequired,

  onPreview: PropTypes.func.isRequired,
};
