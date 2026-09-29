import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, hasAnyRole } from '../context/AuthContext.jsx';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';

/**
 * Unified industry-standard ProtectedRoute component.
 * Handles:
 * 1. Authentication check: redirects to /login if unauthenticated.
 * 2. Mandatory password change check: forces /change-password if mustChangePassword is true.
 * 3. Role-based authorization check: renders ForbiddenPage if user lacks allowedRoles.
 * 4. Renders <Outlet /> or children when authorized.
 */
export default function ProtectedRoute({ allowedRoles, exact = false, children }) {
  const { isAuthenticated, mustChangePassword, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Force password change upon first login for any route except /change-password
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = hasAnyRole(role, allowedRoles, { exact });
    if (!isAuthorized) {
      return <ForbiddenPage />;
    }
  }

  return children ? children : <Outlet />;
}
