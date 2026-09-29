import PropTypes from "prop-types";

export default function PageHeader({ title, subtitle, action = null }) {
  return (
    <header className="dashboard-header">
      <div>
        <h1 className="dashboard-title">{title}</h1>

        {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
      </div>

      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
};
