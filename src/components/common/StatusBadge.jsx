import PropTypes from "prop-types";

export default function StatusBadge({ status }) {
  if (!status) {
    return null;
  }

  const normalizedStatus = String(status).toUpperCase();

  return (
    <span
      className={`status-badge status-badge-${normalizedStatus.toLowerCase()}`}
    >
      {normalizedStatus}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};
