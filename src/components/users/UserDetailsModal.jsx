import PropTypes from "prop-types";
import { createPortal } from "react-dom";

export default function UserDetailsModal({ user, open, onClose }) {
  if (!open || !user) {
    return null;
  }

  return createPortal(
    <div className="user-details-overlay" onClick={onClose}>
      <div
        className="user-details-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="user-details-header">
          <div>
            <h2>{user.name}</h2>

            <p>{user.email}</p>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="user-details-content">
          {/* Basic Information */}
          <section className="user-detail-section">
            <h3>Basic Information</h3>

            <div className="user-detail-grid">
              <div>
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{user.isActive ? "Active" : "Inactive"}</strong>
              </div>

              <div>
                <span>Role</span>
                <strong>{user.role || "No Role"}</strong>
              </div>
            </div>
          </section>

          {/* Education */}
          <section className="user-detail-section">
            <h3>Education</h3>

            {user.educations?.length > 0 ? (
              <div className="detail-list">
                {user.educations.map((education) => (
                  <div key={education.id} className="detail-card">
                    <h4>{education.degree}</h4>

                    <p>{education.fieldOfStudy}</p>

                    <p>{education.institutionName}</p>

                    <p>{education.institutionLocation}</p>

                    <p>
                      {education.educationType}
                      {" · "}
                      {education.gradeType}

                      {education.cgpa != null && ` · CGPA: ${education.cgpa}`}

                      {education.percentage != null &&
                        ` · Percentage: ${education.percentage}%`}
                    </p>

                    <p>
                      {new Date(education.startDate).getFullYear()}
                      {" - "}
                      {education.endDate
                        ? new Date(education.endDate).getFullYear()
                        : education.isCurrentlyStudying
                          ? "Present"
                          : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No education details available.</p>
            )}
          </section>

          {/* Experience */}
          <section className="user-detail-section">
            <h3>Experience</h3>

            {user.experiences?.length > 0 ? (
              <div className="detail-list">
                {user.experiences.map((experience) => (
                  <div key={experience.id} className="detail-card">
                    <h4>{experience.jobTitle}</h4>

                    <p>{experience.companyName}</p>

                    <p>{experience.location}</p>

                    <p>{experience.employmentType}</p>

                    <p>
                      {new Date(experience.startDate).getFullYear()}
                      {" - "}
                      {experience.endDate
                        ? new Date(experience.endDate).getFullYear()
                        : experience.isCurrent
                          ? "Present"
                          : ""}
                    </p>

                    {experience.description && <p>{experience.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No experience details available.</p>
            )}
          </section>

          {/* Certifications */}
          <section className="user-detail-section">
            <h3>Certifications</h3>

            {user.certifications?.length > 0 ? (
              <div className="detail-list">
                {user.certifications.map((certification) => (
                  <div key={certification.id} className="detail-card">
                    <h4>{certification.name}</h4>

                    <p>{certification.issuingOrganization}</p>

                    {certification.credentialId && (
                      <p>Credential ID: {certification.credentialId}</p>
                    )}

                    <p>
                      Issued:{" "}
                      {new Date(certification.issueDate).toLocaleDateString()}
                    </p>

                    {!certification.doesNotExpire &&
                      certification.expirationDate && (
                        <p>
                          Expires:{" "}
                          {new Date(
                            certification.expirationDate,
                          ).toLocaleDateString()}
                        </p>
                      )}

                    {certification.credentialUrl && (
                      <a
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Credential
                      </a>
                    )}

                    {certification.description && (
                      <p>{certification.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No certification details available.</p>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}

UserDetailsModal.propTypes = {
  user: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
