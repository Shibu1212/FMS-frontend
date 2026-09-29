import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "../common/Modal";

const FIELD_TYPES = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "EMAIL",
  "DATE",
  "DROPDOWN",
  "RADIO",
  "CHECKBOX",
];

const OPTION_FIELD_TYPES = ["DROPDOWN", "RADIO", "CHECKBOX"];

const initialFormData = {
  label: "",
  fieldType: "TEXT",
  isRequired: false,
  displayOrder: 1,
};

export default function FormFieldModal({
  open,
  editingField,
  nextDisplayOrder,
  saving,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(initialFormData);

  const [options, setOptions] = useState([""]);

  const [error, setError] = useState("");

  const isEditing = Boolean(editingField);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingField) {
      setFormData({
        label: editingField.label || "",
        fieldType: editingField.fieldType || "TEXT",
        isRequired: Boolean(editingField.isRequired),
        displayOrder: editingField.displayOrder ?? 1,
      });

      if (editingField.options) {
        setOptions(
          editingField.options
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean),
        );
      } else {
        setOptions([""]);
      }
    } else {
      setFormData({
        ...initialFormData,
        displayOrder: nextDisplayOrder,
      });

      setOptions([""]);
    }

    setError("");
  }, [open, editingField, nextDisplayOrder]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleFieldTypeChange(event) {
    const fieldType = event.target.value;

    setFormData((previous) => ({
      ...previous,
      fieldType,
    }));

    if (!OPTION_FIELD_TYPES.includes(fieldType)) {
      setOptions([""]);
    }
  }

  function handleOptionChange(index, value) {
    setOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  }

  function addOption() {
    setOptions((previous) => [...previous, ""]);
  }

  function removeOption(index) {
    setOptions((previous) =>
      previous.filter((_, optionIndex) => optionIndex !== index),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.label.trim()) {
      setError("Field label is required.");
      return;
    }

    if (!formData.fieldType) {
      setError("Field type is required.");
      return;
    }

    const cleanedOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    if (
      OPTION_FIELD_TYPES.includes(formData.fieldType) &&
      cleanedOptions.length === 0
    ) {
      setError("At least one option is required.");
      return;
    }

    setError("");

    onSubmit({
      label: formData.label,
      fieldType: formData.fieldType,
      isRequired: formData.isRequired,
      displayOrder: Number(formData.displayOrder),

      // Backend currently stores Options as a string.
      options: OPTION_FIELD_TYPES.includes(formData.fieldType)
        ? cleanedOptions.join(",")
        : null,
    });
  }

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit Form Field" : "Add Form Field"}
      onClose={saving ? () => {} : onClose}
      closeOnOverlayClick={!saving}
      width="600px"
    >
      <form className="form-field-modal-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        {/* Field Label */}

        <div className="form-group">
          <label htmlFor="field-label">Field Label</label>

          <input
            id="field-label"
            name="label"
            type="text"
            value={formData.label}
            onChange={handleChange}
            placeholder="Enter field label"
            disabled={saving}
          />
        </div>

        {/* Field Type */}

        <div className="form-group">
          <label htmlFor="field-type">Field Type</label>

          <select
            id="field-type"
            name="fieldType"
            value={formData.fieldType}
            onChange={handleFieldTypeChange}
            disabled={saving}
          >
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Options */}

        {OPTION_FIELD_TYPES.includes(formData.fieldType) && (
          <div className="form-group">
            <div className="form-field-options-header">
              <label>Options</label>

              <button
                type="button"
                className="form-field-add-option-btn"
                onClick={addOption}
                disabled={saving}
              >
                + Add Option
              </button>
            </div>

            <div className="form-field-options-list">
              {options.map((option, index) => (
                <div className="form-field-option-row" key={`option-${index}`}>
                  <input
                    type="text"
                    value={option}
                    onChange={(event) =>
                      handleOptionChange(index, event.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    disabled={saving}
                  />

                  {options.length > 1 && (
                    <button
                      type="button"
                      className="form-field-remove-option-btn"
                      onClick={() => removeOption(index)}
                      disabled={saving}
                      aria-label={`Remove option ${index + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display Order */}

        <div className="form-group">
          <label htmlFor="field-display-order">Display Order</label>

          <input
            id="field-display-order"
            name="displayOrder"
            type="number"
            min="1"
            value={formData.displayOrder}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        {/* Required */}

        <div className="form-checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isRequired"
              checked={formData.isRequired}
              onChange={handleChange}
              disabled={saving}
            />

            <span>Required field</span>
          </label>
        </div>

        {/* Actions */}

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
            {saving ? "Saving..." : isEditing ? "Update Field" : "Add Field"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

FormFieldModal.propTypes = {
  open: PropTypes.bool.isRequired,

  editingField: PropTypes.object,

  nextDisplayOrder: PropTypes.number.isRequired,

  saving: PropTypes.bool.isRequired,

  onClose: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};
