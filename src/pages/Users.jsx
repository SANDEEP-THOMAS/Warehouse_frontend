import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import {
  ShieldAlert,
  Search,
  Plus,
  Edit2,
  Trash2,
  Power,
  RotateCcw,
  X,
  UserCheck,
  Key,
} from "lucide-react";

const ROLES = ["ADMIN", "SUPERVISOR", "OPERATOR"];

function Users() {
  const { auth } = useContext(AuthContext);
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const initialForm = {
    name: "",
    username: "",
    password: "",
    role: "SUPERVISOR",
    operatorId: "",
  };

  const [form, setForm] = useState(initialForm);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await api.get("/users", { params });
      setUsers(Array.isArray(res.data) ? res.data : res.data?.users || []);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH OPERATORS =================
  const fetchOperators = async () => {
    try {
      const res = await api.get("/operators");
      const list = Array.isArray(res.data) ? res.data : res.data?.operators || [];
      setOperators(list);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOperators();
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ================= SUBMIT USER =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.role === "OPERATOR" && !form.operatorId) {
      showToast("Please link an operator profile for Operator role", "error");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        role: form.role,
      };

      if (form.role === "OPERATOR") {
        payload.operatorId = form.operatorId;
      }

      if (form.password && form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (editingId) {
        await api.put(`/users/${editingId}`, payload);
        showToast("User account updated successfully", "success");
      } else {
        if (!payload.password) {
          showToast("Password is required for new accounts", "error");
          setLoading(false);
          return;
        }
        await api.post("/users", payload);
        showToast("User account created successfully", "success");
      }

      closeModal();
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user._id}/status`, { isActive: !user.isActive });
      showToast(`User ${user.username} is now ${!user.isActive ? "active" : "inactive"}`, "success");
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update user status", "error");
    }
  };

  // ================= DELETE USER =================
  const handleDeleteUser = async () => {
    if (!deleteConfirmId) return;

    try {
      setLoading(true);
      await api.delete(`/users/${deleteConfirmId}`);
      showToast("User account deleted successfully", "success");
      setDeleteConfirmId(null);
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.message || "Could not delete user", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= MODAL HANDLERS =================
  const openCreateModal = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name || "",
      username: user.username || "",
      password: "",
      role: user.role || "SUPERVISOR",
      operatorId: user.operatorId?._id || "",
    });
    setEditingId(user._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <>
      <Navbar />

      <main className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <ShieldAlert size={26} color="#6366f1" />
              <span>User Accounts & Security</span>
            </h1>
            <p className="page-subtitle">
              Manage system access credentials, role permissions, and operator links
            </p>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Create User Account</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-control"
              style={{ width: "auto" }}
            >
              <option value="ALL">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-control"
              style={{ width: "auto" }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <button onClick={fetchUsers} className="btn btn-secondary btn-icon" title="Refresh users">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Username</th>
                <th>Role</th>
                <th>Linked Operator</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: "rgba(99, 102, 241, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#818cf8",
                            fontWeight: "700",
                            fontSize: "12px",
                          }}
                        >
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div style={{ fontWeight: "600", color: "#fff" }}>{user.name}</div>
                      </div>
                    </td>

                    <td>
                      <code
                        style={{
                          background: "rgba(15, 23, 42, 0.6)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-subtle)",
                          color: "#38bdf8",
                          fontSize: "12px",
                        }}
                      >
                        {user.username}
                      </code>
                    </td>

                    <td>
                      <span className="badge badge-role">{user.role}</span>
                    </td>

                    <td>
                      {user.operatorId ? (
                        <span style={{ fontSize: "13px", color: "#cbd5e1" }}>
                          {user.operatorId.name} ({user.operatorId.employeeCode})
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-dim)", fontSize: "12px" }}>N/A (System User)</span>
                      )}
                    </td>

                    <td>
                      <span className={`badge ${user.isActive ? "badge-active" : "badge-inactive"}`}>
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: user.isActive ? "#34d399" : "#f87171",
                            display: "inline-block",
                          }}
                        />
                        {user.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn btn-secondary btn-sm"
                          title="Edit user details"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`btn btn-sm ${user.isActive ? "btn-secondary" : "btn-success"}`}
                          title={user.isActive ? "Deactivate account" : "Activate account"}
                        >
                          <Power size={14} />
                          <span>{user.isActive ? "Deactivate" : "Activate"}</span>
                        </button>

                        {user._id !== auth?.user?._id && user.username !== "admin" && (
                          <button
                            onClick={() => setDeleteConfirmId(user._id)}
                            className="btn btn-outline-danger btn-sm"
                            title="Delete account"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <ShieldAlert size={40} />
                      <h3>No users found</h3>
                      <p>Try clearing your filters or create a new user account.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ======================================================== */}
      {/* ADD / EDIT USER MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: "17px", display: "flex", alignItems: "center", gap: "8px" }}>
                <UserCheck size={20} color="#6366f1" />
                <span>{editingId ? "Edit User Account" : "Create System User"}</span>
              </h3>
              <button
                onClick={closeModal}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johnathan Miller"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jmiller"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                    className="input-control"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {editingId ? "New Password (Leave blank to keep existing)" : "Password *"}
                  </label>
                  <input
                    type="password"
                    placeholder="Enter secure password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-control"
                    required={!editingId}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">System Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input-control"
                  >
                    <option value="ADMIN">ADMIN (Full System Privileges)</option>
                    <option value="SUPERVISOR">SUPERVISOR (Task & Shift Management)</option>
                    <option value="OPERATOR">OPERATOR (Personal Tasks)</option>
                  </select>
                </div>

                {form.role === "OPERATOR" && (
                  <div className="form-group">
                    <label className="form-label">Link Operator Profile *</label>
                    <select
                      value={form.operatorId}
                      onChange={(e) => setForm({ ...form, operatorId: e.target.value })}
                      className="input-control"
                      required
                    >
                      <option value="">Select an operator</option>
                      {operators.map((op) => (
                        <option key={op._id} value={op._id}>
                          {op.name} ({op.employeeCode}) • {op.role} - {op.shift}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Account" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "16px", color: "#f87171", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={20} />
                <span>Delete User Account</span>
              </h3>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Are you sure you want to permanently delete this user account? The user will no longer be able to log in.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteUser} className="btn btn-danger" disabled={loading}>
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Users;
