import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AlertMessage from "../components/common/AlertMessage";
import {
  getPublishedFormById,
  submitFormResponse,
  getMyFormResponses,
} from "../services/formService.js";

export default function FillPublishedFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [existingResponse, setExistingResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadForm();
  }, [id]);

  async function loadForm() {
    try {
      setLoading(true);
      setError("");

      console.log("Published Form ID:", id);

      const [formDataResponse, myResponsesResponse] = await Promise.all([
        getPublishedFormById(id),
        getMyFormResponses(),
      ]);

      setForm(formDataResponse);

      const myResponses = myResponsesResponse.items || [];

      const existing = myResponses.find(
        (response) => response.formId === Number(id),
      );

      setExistingResponse(existing || null);

      const initialValues = {};

      formDataResponse.fields?.forEach((field) => {
        initialValues[field.id] = field.fieldType === "CHECKBOX" ? [] : "";
      });

      setFormData(initialValues);
    } catch (err) {
      console.error("Failed to load published form:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load published form.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(fieldId, value) {
    setFormData((previous) => ({
      ...previous,
      [fieldId]: value,
    }));
  }

  function handleCheckboxChange(fieldId, option) {
    setFormData((previous) => {
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

  async function handleSubmit(event) {
    event.preventDefault();

    setValidationError("");
    setError("");
    setSuccessMessage("");

    for (const field of form.fields || []) {
      const value = formData[field.id];

      if (field.isRequired) {
        if (field.fieldType === "CHECKBOX") {
          if (!value || value.length === 0) {
            setValidationError(`${field.label} is required.`);
            return;
          }
        } else if (
          value === undefined ||
          value === null ||
          String(value).trim() === ""
        ) {
          setValidationError(`${field.label} is required.`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      const values = (form.fields || [])
        .filter((field) => {
          const value = formData[field.id];

          if (field.fieldType === "CHECKBOX") {
            return Array.isArray(value) && value.length > 0;
          }

          return (
            value !== undefined && value !== null && String(value).trim() !== ""
          );
        })
        .map((field) => ({
          formFieldId: field.id,
          value: String(formData[field.id]),
        }));

      if (existingResponse) {
        setError("You have already submitted this form.");
        return;
      }

      await submitFormResponse(form.id, values);

      setSuccessMessage("Form submitted successfully.");

      setTimeout(() => {
        navigate("/published-forms");
      }, 1000);
    } catch (err) {
      console.error("Failed to submit form:", err);

      setError(err?.response?.data?.message || "Failed to submit form.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="page-container">
        <div className="loading-state">Loading form...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-container">
        <div className="error-message">{error}</div>
      </section>
    );
  }

  if (!form) {
    return (
      <section className="page-container">
        <div className="empty-state">Form not found.</div>
      </section>
    );
  }

  if (existingResponse) {
    return (
      <section className="page-container">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{form.name}</h1>

            <p className="dashboard-subtitle">
              You have already submitted this form.
            </p>
          </div>
        </header>

        <div className="empty-state">
          <p>Your response has already been submitted.</p>

          <div className="published-form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/published-forms")}
            >
              Back to Forms
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`/my-submissions/${existingResponse.id}`)}
            >
              View Submission
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <AlertMessage type="success" message={successMessage} />

      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{form.name}</h1>

          <p className="dashboard-subtitle">
            {form.description || "Please complete the form below."}
          </p>
        </div>
      </header>

      <form className="published-form-fill" onSubmit={handleSubmit}>
        {validationError && (
          <div className="error-message">{validationError}</div>
        )}

        {form.fields
          ?.sort((a, b) => a.displayOrder - b.displayOrder)
          .map((field) => (
            <div key={field.id} className="published-form-field">
              <label>
                {field.label}

                {field.isRequired && <span className="required-mark"> *</span>}
              </label>

              {field.fieldType === "TEXT" && (
                <input
                  type="text"
                  value={formData[field.id] || ""}
                  onChange={(event) =>
                    handleChange(field.id, event.target.value)
                  }
                />
              )}

              {field.fieldType === "TEXTAREA" && (
                <textarea
                  value={formData[field.id] || ""}
                  onChange={(event) =>
                    handleChange(field.id, event.target.value)
                  }
                  rows={4}
                />
              )}

              {field.fieldType === "NUMBER" && (
                <input
                  type="number"
                  value={formData[field.id] || ""}
                  onChange={(event) =>
                    handleChange(field.id, event.target.value)
                  }
                />
              )}

              {field.fieldType === "EMAIL" && (
                <input
                  type="email"
                  value={formData[field.id] || ""}
                  onChange={(event) =>
                    handleChange(field.id, event.target.value)
                  }
                />
              )}

              {field.fieldType === "DATE" && (
                <input
                  type="date"
                  value={formData[field.id] || ""}
                  onChange={(event) =>
                    handleChange(field.id, event.target.value)
                  }
                />
              )}

              {field.fieldType === "DROPDOWN" && (
                <select
                  value={formData[field.id] || ""}
                  onChange={(event) =>
                    handleChange(field.id, event.target.value)
                  }
                >
                  <option value="">Select an option</option>

                  {field.options
                    ?.split(",")
                    .map((option) => option.trim())
                    .filter(Boolean)
                    .map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              )}

              {field.fieldType === "RADIO" && (
                <div className="published-form-radio-group">
                  {field.options
                    ?.split(",")
                    .map((option) => option.trim())
                    .filter(Boolean)
                    .map((option) => (
                      <label key={option}>
                        <input
                          type="radio"
                          name={`field-${field.id}`}
                          value={option}
                          checked={formData[field.id] === option}
                          onChange={(event) =>
                            handleChange(field.id, event.target.value)
                          }
                        />

                        <span>{option}</span>
                      </label>
                    ))}
                </div>
              )}

              {field.fieldType === "CHECKBOX" && (
                <div className="published-form-checkbox-group">
                  {field.options
                    ?.split(",")
                    .map((option) => option.trim())
                    .filter(Boolean)
                    .map((option) => (
                      <label key={option} className="published-form-checkbox">
                        <input
                          type="checkbox"
                          checked={(formData[field.id] || []).includes(option)}
                          onChange={() =>
                            handleCheckboxChange(field.id, option)
                          }
                        />

                        <span>{option}</span>
                      </label>
                    ))}
                </div>
              )}
            </div>
          ))}

        <div className="published-form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/forms/published-forms")}
            disabled={submitting}
          >
            Cancel
          </button>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting
              ? existingResponse
                ? "Updating..."
                : "Submitting..."
              : existingResponse
                ? "Update Submission"
                : "Submit Form"}
          </button>
        </div>
      </form>
    </section>
  );
}
