import { useEffect, useState } from "react";
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  changeUserRole,
  changeUserStatus,
  deleteUser,
} from "../services/userService.js";
import UserTable from "../components/users/UserTable";
import UserDetailsModal from "../components/users/UserDetailsModal";
import UserFormModal from "../components/users/UserFormModal";
import ConfirmModal from "../components/common/ConfirmModal";

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openActionMenu, setOpenActionMenu] = useState(null);
  

  const [changingRoleFor, setChangingRoleFor] = useState(null);

  // Role change confirmation
  const [roleChangeRequest, setRoleChangeRequest] = useState(null);

  // Success message
  const [successMessage, setSuccessMessage] = useState("");

  // Selected user for profile details
  const [selectedUser, setSelectedUser] = useState(null);

  // Create/Edit user modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    roleId: "",
  });

  const [savingUser, setSavingUser] = useState(false);

  // Activate / Deactivate confirmation
  const [statusChangeRequest, setStatusChangeRequest] = useState(null);
  const [changingStatusFor, setChangingStatusFor] = useState(null);

  // Delete confirmation
  const [deleteUserRequest, setDeleteUserRequest] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    loadUsersAndRoles();
  }, []);

  async function loadUsersAndRoles() {
    try {
      setLoading(true);
      setError("");

      const [usersData, rolesData] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  function openCreateUserModal() {
    setEditingUser(null);

    setUserFormData({
      name: "",
      email: "",
      roleId: "",
    });

    setError("");
    setSuccessMessage("");
    setShowUserModal(true);
  }

  function openEditUserModal(user) {
    const currentRole = roles.find((role) => role.name === user.role);

    setEditingUser(user);

    setUserFormData({
      name: user.name || "",
      email: user.email || "",
      roleId: currentRole?.id || "",
    });

    setError("");
    setSuccessMessage("");
    setShowUserModal(true);
  }

  function closeUserModal() {
    if (savingUser) {
      return;
    }

    setShowUserModal(false);
    setEditingUser(null);
  }

  function handleUserInputChange(event) {
    const { name, value } = event.target;

    setUserFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleUserSubmit(event) {
    event.preventDefault();

    if (!userFormData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!userFormData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!editingUser && !userFormData.roleId) {
      setError("Role is required.");
      return;
    }

    try {
      setSavingUser(true);
      setError("");
      setSuccessMessage("");

      if (editingUser) {
        await updateUser(editingUser.id, {
          name: userFormData.name,
          email: userFormData.email,
        });

        setSuccessMessage("User updated successfully.");
      } else {
        await createUser(userFormData);

        setSuccessMessage(
          "User created successfully. Login credentials have been sent to the user's email.",
        );
      }

      const updatedUsers = await getUsers();

      setUsers(updatedUsers);

      setShowUserModal(false);
      setEditingUser(null);

      setUserFormData({
        name: "",
        email: "",
        roleId: "",
      });

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save user.");
    } finally {
      setSavingUser(false);
    }
  }

  function handleToggleActionMenu(userId) {
    setOpenActionMenu((currentUserId) =>
      currentUserId === userId ? null : userId,
    );
  }

  function handleRoleChange(userId, roleId) {
    const user = users.find((u) => u.id === userId);
    const role = roles.find((r) => r.id === Number(roleId));

    if (!user || !role) {
      return;
    }

    setRoleChangeRequest({
      userId,
      userName: user.name,
      currentRole: user.role || "No Role",
      newRoleId: Number(roleId),
      newRole: role.name,
    });
  }

  async function confirmRoleChange() {
    if (!roleChangeRequest) {
      return;
    }

    try {
      setChangingRoleFor(roleChangeRequest.userId);
      setError("");
      setSuccessMessage("");

      await changeUserRole(
        roleChangeRequest.userId,
        roleChangeRequest.newRoleId,
      );

      const updatedUsers = await getUsers();

      setUsers(updatedUsers);

      setSuccessMessage(
        `Role for ${roleChangeRequest.userName} was updated successfully.`,
      );

      setRoleChangeRequest(null);

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user role.");

      setRoleChangeRequest(null);
    } finally {
      setChangingRoleFor(null);
    }
  }

  function handleStatusChange(user) {
    setStatusChangeRequest({
      userId: user.id,
      userName: user.name,
      currentStatus: user.isActive ? "Active" : "Inactive",
      newStatus: user.isActive ? "Inactive" : "Active",
      newIsActive: !user.isActive,
    });

    setError("");
    setSuccessMessage("");
  }

  function handleDeleteUser(user) {
    setDeleteUserRequest({
      userId: user.id,
      userName: user.name,
      email: user.email,
    });

    setError("");
    setSuccessMessage("");
  }

  async function confirmDeleteUser() {
    if (!deleteUserRequest) {
      return;
    }

    try {
      setDeletingUserId(deleteUserRequest.userId);
      setError("");
      setSuccessMessage("");

      await deleteUser(deleteUserRequest.userId);

      const updatedUsers = await getUsers();

      setUsers(updatedUsers);

      setSuccessMessage(
        `User ${deleteUserRequest.userName} was deleted successfully.`,
      );

      setDeleteUserRequest(null);

      if (selectedUser?.id === deleteUserRequest.userId) {
        setSelectedUser(null);
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user.");

      setDeleteUserRequest(null);
    } finally {
      setDeletingUserId(null);
    }
  }

  async function confirmStatusChange() {
    if (!statusChangeRequest) {
      return;
    }

    try {
      setChangingStatusFor(statusChangeRequest.userId);
      setError("");
      setSuccessMessage("");

      await changeUserStatus(
        statusChangeRequest.userId,
        statusChangeRequest.newIsActive,
      );

      const updatedUsers = await getUsers();

      setUsers(updatedUsers);

      setSuccessMessage(
        `${statusChangeRequest.userName} was ${statusChangeRequest.newIsActive ? "activated" : "deactivated"} successfully.`,
      );

      setStatusChangeRequest(null);

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to change user status.");

      setStatusChangeRequest(null);
    } finally {
      setChangingStatusFor(null);
    }
  }

  if (loading) {
    return (
      <section className="page-container">
        <div className="loading-state">Loading users...</div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Manage Users</h1>

          <p className="dashboard-subtitle">
            View application users and manage their assigned roles.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={openCreateUserModal}
        >
          Create User
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Application Users</h2>

          <span>{users.length} users</span>
        </div>

        {users.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <UserTable
            users={users}
            roles={roles}
            changingRoleFor={changingRoleFor}
            changingStatusFor={changingStatusFor}
            deletingUserId={deletingUserId}
            openActionMenu={openActionMenu}
            onToggleActionMenu={handleToggleActionMenu}
            onView={setSelectedUser}
            onEdit={openEditUserModal}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteUser}
          />
        )}
      </section>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
      />

      {/* Create / Edit User Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
      />

      <UserFormModal
        open={showUserModal}
        editingUser={editingUser}
        userFormData={userFormData}
        roles={roles}
        savingUser={savingUser}
        onClose={closeUserModal}
        onSubmit={handleUserSubmit}
        onInputChange={handleUserInputChange}
      />
      {/* Activate / Deactivate Confirmation Modal */}
      <ConfirmModal
        open={Boolean(statusChangeRequest)}
        title="Confirm Status Change"
        message={
          statusChangeRequest && (
            <>
              <p>Are you sure you want to change the status for:</p>

              <strong>{statusChangeRequest.userName}</strong>

              <div className="role-change-summary">
                <div>
                  <span>Current Status</span>
                  <strong>{statusChangeRequest.currentStatus}</strong>
                </div>

                <div className="role-change-arrow">→</div>

                <div>
                  <span>New Status</span>
                  <strong>{statusChangeRequest.newStatus}</strong>
                </div>
              </div>
            </>
          )
        }
        confirmText="Confirm Change"
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={() => {
          if (changingStatusFor === null) {
            setStatusChangeRequest(null);
          }
        }}
        loading={changingStatusFor !== null}
      />
      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteUserRequest)}
        title="Confirm User Deletion"
        message={
          deleteUserRequest && (
            <>
              <p>Are you sure you want to permanently delete this user?</p>

              <strong>{deleteUserRequest.userName}</strong>

              <p className="delete-user-email">{deleteUserRequest.email}</p>

              <div className="delete-warning">
                This action cannot be undone.
              </div>
            </>
          )
        }
        confirmText="Delete User"
        cancelText="Cancel"
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          if (deletingUserId === null) {
            setDeleteUserRequest(null);
          }
        }}
        loading={deletingUserId !== null}
        danger
      />

      {/* Role Change Confirmation Modal */}
      <ConfirmModal
        open={Boolean(roleChangeRequest)}
        title="Confirm Role Change"
        message={
          roleChangeRequest && (
            <>
              <p>Are you sure you want to change the role for:</p>

              <strong>{roleChangeRequest.userName}</strong>

              <div className="role-change-summary">
                <div>
                  <span>Current Role</span>
                  <strong>{roleChangeRequest.currentRole}</strong>
                </div>

                <div className="role-change-arrow">→</div>

                <div>
                  <span>New Role</span>
                  <strong>{roleChangeRequest.newRole}</strong>
                </div>
              </div>
            </>
          )
        }
        confirmText="Confirm Change"
        cancelText="Cancel"
        onConfirm={confirmRoleChange}
        onCancel={() => {
          if (changingRoleFor === null) {
            setRoleChangeRequest(null);
          }
        }}
        loading={changingRoleFor !== null}
      />
    </section>
  );
}
