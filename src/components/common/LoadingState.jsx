import PropTypes from "prop-types";

export default function LoadingState({ message = "Loading..." }) {
  return <div className="loading-state">{message}</div>;
}

LoadingState.propTypes = {
  message: PropTypes.string,
};
