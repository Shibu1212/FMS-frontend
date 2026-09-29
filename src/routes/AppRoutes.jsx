import { Routes, Route } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import RegistrationManagementPage from '../pages/RegistrationManagementPage';
import CreatorPlaceholderPage from '../pages/CreatorPlaceholderPage';
import ViewerPlaceholderPage from '../pages/ViewerPlaceholderPage';
import ProfilePage from '../pages/ProfilePage';
import ForbiddenPage from '../pages/ForbiddenPage';
import NotFoundPage from '../pages/NotFoundPage';
import UsersManagementPage from "../pages/UsersManagementPage";
import FormManagementPage from "../pages/FormManagementPage";
import PublishedFormsPage from "../pages/PublishedFormsPage";
import { ROLES } from '../context/AuthContext.jsx';
import FillPublishedFormPage from "../pages/FillPublishedFormPage";
import MySubmissionsPage from "../pages/MySubmissionsPage";
import MySubmissionDetailsPage from "../pages/MySubmissionDetailsPage";
import AdminSubmissionsPage from "../pages/AdminSubmissionsPage";
import AdminSubmissionDetailsPage from "../pages/AdminSubmissionDetailsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="forbidden" element={<ForbiddenPage />} />

        {/* Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="creator" element={<CreatorPlaceholderPage />} />
          <Route path="viewer" element={<ViewerPlaceholderPage />} />
        </Route>

        {/* Admin + Form Creator */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.FORM_CREATOR]}
              exact
            />
          }
        >
          <Route path="forms" element={<FormManagementPage />} />
        </Route>

        {/* Admin-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} exact />}>
          <Route
            path="admin/registrations"
            element={<RegistrationManagementPage />}
          />
          <Route path="admin/users" element={<UsersManagementPage />} />
          <Route path="admin/submissions" element={<AdminSubmissionsPage />} />
          <Route
            path="admin/submissions/:id"
            element={<AdminSubmissionDetailsPage />}
          />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={[ROLES.FORM_VIEWER]} exact />}
        >
          <Route path="published-forms" element={<PublishedFormsPage />} />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={[ROLES.FORM_VIEWER]} exact />}
        >
          <Route
            path="forms/published/:id"
            element={<FillPublishedFormPage />}
          />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={[ROLES.FORM_VIEWER]} exact />}
        >
          <Route path="my-submissions" element={<MySubmissionsPage />} />

          <Route
            path="my-submissions/:id"
            element={<MySubmissionDetailsPage />}
          />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
