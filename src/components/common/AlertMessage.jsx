import PropTypes from "prop-types";

export default function AlertMessage({ type = "info", message }) {
  if (!message) {
    return null;
  }

  return <div className={`alert-message alert-message-${type}`}>{message}</div>;
}

AlertMessage.propTypes = {
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  message: PropTypes.node,
};
