import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "../common/Modal";

export default function FormPreviewModal({ open, form, fields, onClose }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    if (!open) {
      return;
    }

    const initialValues = {};

    fields.forEach((field) => {
      if (field.fieldType === "CHECKBOX") {
        initialValues[field.id] = [];
      } else {
        initialValues[field.id] = "";
      }
    });

    setValues(initialValues);
  }, [open, fields]);

  function handleChange(fieldId, value) {
    setValues((previous) => ({
      ...previous,
      [fieldId]: value,
    }));
  }

  function handleCheckboxChange(fieldId, option) {
    setValues((previous) => {
      const currentValues = previous[fieldId] || [];

      const exists = currentValues.includes(option);

      return {
        ...previous,
        [fieldId]: exists
          ? currentValues.filter((item) => item !== option)
          : [...currentValues, option],
      };
    });
  }

  function renderField(field) {
    const options = field.options
      ? field.options
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean)
      : [];

    switch (field.fieldType) {
      case "TEXT":
        return (
          <input
            type="text"
            value={values[field.id] || ""}
            onChange={(event) => handleChange(field.id, event.target.value)}
            placeholder={`Enter ${field.label}`}
          />
        );

      case "TEXTAREA":
        return (
          <textarea
            rows="4"
            value={values[field.id] || ""}
            onChange={(event) => handleChange(field.id, event.target.value)}
            placeholder={`Enter ${field.label}`}
          />
        );

      case "NUMBER":
        return (
          <input
            type="number"
            value={values[field.id] || ""}
            onChange={(event) => handleChange(field.id, event.target.value)}
            placeholder={`Enter ${field.label}`}
          />
        );

      case "EMAIL":
        return (
          <input
            type="email"
            value={values[field.id] || ""}
            onChange={(event) => handleChange(field.id, event.target.value)}
            placeholder={`Enter ${field.label}`}
          />
        );

      case "DATE":
        return (
          <input
            type="date"
            value={values[field.id] || ""}
            onChange={(event) => handleChange(field.id, event.target.value)}
          />
        );

      case "DROPDOWN":
        return (
          <select
            value={values[field.id] || ""}
            onChange={(event) => handleChange(field.id, event.target.value)}
          >
            <option value="">Select {field.label}</option>

            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "RADIO":
        return (
          <div className="form-preview-options">
            {options.map((option) => (
              <label key={option} className="form-preview-option">
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={option}
                  checked={values[field.id] === option}
                  onChange={() => handleChange(field.id, option)}
                />

                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case "CHECKBOX":
        return (
          <div className="form-preview-options">
            {options.map((option) => (
              <label key={option} className="form-preview-option">
                <input
                  type="checkbox"
                  checked={(values[field.id] || []).includes(option)}
                  onChange={() => handleCheckboxChange(field.id, option)}
                />

                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <Modal
      open={open}
      title={form ? `Preview — ${form.name}` : "Form Preview"}
      onClose={onClose}
      width="800px"
    >
      <div className="form-preview">
        {form?.description && (
          <p className="form-preview-description">{form.description}</p>
        )}

        {fields.length === 0 ? (
          <div className="empty-state">
            No fields have been added to this form yet.
          </div>
        ) : (
          <div className="form-preview-fields">
            {fields.map((field) => (
              <div className="form-preview-field" key={field.id}>
                <label>
                  {field.label}

                  {field.isRequired && (
                    <span className="form-preview-required">*</span>
                  )}
                </label>

                {renderField(field)}
              </div>
            ))}
          </div>
        )}

        <div className="form-preview-footer">
          {/* <button type="button" className="btn-secondary" onClick={onClose}>
            Close Preview
          </button> */}

          <button type="button" className="btn-primary" disabled>
            Submit
          </button>
        </div>
      </div>
    </Modal>
  );
}

FormPreviewModal.propTypes = {
  open: PropTypes.bool.isRequired,

  form: PropTypes.object,

  fields: PropTypes.array.isRequired,

  onClose: PropTypes.func.isRequired,
};
