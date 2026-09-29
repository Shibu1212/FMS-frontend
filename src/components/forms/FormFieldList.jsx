import PropTypes from "prop-types";
import StatusBadge from "../common/StatusBadge";

export default function FormFieldList({ fields, onEdit, onDelete }) {
  if (!fields.length) {
    return (
      <div className="form-fields-empty">
        <p>No fields added to this form yet.</p>
      </div>
    );
  }

  return (
    <div className="form-fields-list">
      {fields.map((field) => (
        <div key={field.id} className="form-field-item">
          <div className="form-field-info">
            <div className="form-field-title-row">
              <h4>{field.label}</h4>

              {field.isRequired && (
                <span className="form-field-required">Required</span>
              )}
            </div>

            <div className="form-field-meta">
              <span>Type: {field.fieldType}</span>

              <span>Order: {field.displayOrder}</span>
            </div>

            {field.options && (
              <div className="form-field-options">Options: {field.options}</div>
            )}
          </div>

          <div className="form-field-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onEdit(field)}
            >
              Edit
            </button>

            <button
              type="button"
              className="btn-danger"
              onClick={() => onDelete(field)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

FormFieldList.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      fieldType: PropTypes.string.isRequired,
      isRequired: PropTypes.bool.isRequired,
      displayOrder: PropTypes.number.isRequired,
      options: PropTypes.string,
    }),
  ).isRequired,

  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
