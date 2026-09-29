import PropTypes from "prop-types";

export default function Modal({
  open,
  title,
  children,
  onClose,
  width = "600px",
  closeOnOverlayClick = true,
  showCloseButton = true,
}) {
  if (!open) {
    return null;
  }

  function handleOverlayClick() {
    if (closeOnOverlayClick) {
      onClose();
    }
  }

  return (
    <div className="common-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="common-modal"
        style={{ maxWidth: width }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="common-modal-header">
          <h2>{title}</h2>

          {showCloseButton && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        <div className="common-modal-content">{children}</div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  width: PropTypes.string,
  closeOnOverlayClick: PropTypes.bool,
  showCloseButton: PropTypes.bool,
};
