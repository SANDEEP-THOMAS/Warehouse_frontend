import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import {
  Users2,
  Search,
  Plus,
  Edit2,
  Trash2,
  Power,
  RotateCcw,
  X,
  KeyRound,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

const OPERATOR_ROLES = ["PICKER", "PACKER", "SUPERVISOR", "FORKLIFT", "INVENTORY"];

function Operators() {
  const { auth } = useContext(AuthContext);
  const { showToast } = useToast();

  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const initialForm = {
    name: "",
    employeeCode: "",
    role: "PICKER",
    shift: "Morning (08:00 - 16:00)",
    status: "ACTIVE",
    contactPhone: "",
    customPassword: "",
  };

  const [form, setForm] = useState(initialForm);

  // ================= FETCH OPERATORS =================
  const fetchOperators = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.name = search;
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await api.get("/operators", { params });
      const opArray = Array.isArray(res.data) ? res.data : res.data.operators || [];
      setOperators(opArray);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to load operators", "error");
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, [roleFilter, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOperators();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ================= HANDLE FORM SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        employeeCode: form.employeeCode.trim().toUpperCase(),
        role: form.role,
        shift: form.shift.trim(),
        status: form.status,
        contactPhone: form.contactPhone.trim(),
      };

      if (form.customPassword && form.customPassword.trim()) {
        payload.password = form.customPassword.trim();
      }

      if (editingId) {
        await api.put(`/operators/${editingId}`, payload);
        showToast("Operator profile updated successfully", "success");
      } else {
        const res = await api.post("/operators", payload);
        showToast(`Operator created! Login provisioned: ${res.data.defaultLogin?.username || payload.employeeCode.toLowerCase()}`, "success");
      }

      closeModal();
      fetchOperators();
    } catch (error) {
      showToast(error.response?.data?.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN MODALS =================
  const openCreateModal = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (op) => {
    setForm({
      name: op.name || "",
      employeeCode: op.employeeCode || "",
      role: op.role || "PICKER",
      shift: op.shift || "Morning (08:00 - 16:00)",
      status: op.status || "ACTIVE",
      contactPhone: op.contactPhone || "",
      customPassword: "",
    });
    setEditingId(op._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (op) => {
    const newStatus = op.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.patch(`/operators/${op._id}/status`, { status: newStatus });
      showToast(`Operator ${op.name} is now ${newStatus}`, "success");
      fetchOperators();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update status", "error");
    }
  };

  // ================= DELETE OPERATOR =================
  const handleDeleteOperator = async () => {
    if (!deleteConfirmId) return;

    try {
      setLoading(true);
      await api.delete(`/operators/${deleteConfirmId}`);
      showToast("Operator and credentials removed successfully", "success");
      setDeleteConfirmId(null);
      fetchOperators();
    } catch (error) {
      showToast(error.response?.data?.message || "Could not delete operator", "error");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = auth?.user?.role === "ADMIN";
  const activeCount = operators.filter((o) => o.status === "ACTIVE").length;

  return (
    <>
      <Navbar />

      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <Users2 size={26} color="#6366f1" />
              <span>Operator Workforce Directory</span>
            </h1>
            <p className="page-subtitle">
              Manage warehouse pickers, packers, floor supervisors, and shift rosters
            </p>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Onboard Operator</span>
          </button>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by operator name or employee code..."
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
              {OPERATOR_ROLES.map((r) => (
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
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            <button onClick={fetchOperators} className="btn btn-secondary btn-icon" title="Refresh list">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div style={{ marginBottom: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
          Showing <strong>{operators.length}</strong> operators ({activeCount} active, {operators.length - activeCount} inactive)
        </div>

        {/* Operators Data Table */}
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Employee Code</th>
                <th>Work Role</th>
                <th>Shift Schedule</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {operators.length > 0 ? (
                operators.map((op) => (
                  <tr key={op._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: op.status === "ACTIVE" ? "rgba(99, 102, 241, 0.15)" : "rgba(148, 163, 184, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: op.status === "ACTIVE" ? "#818cf8" : "var(--text-dim)",
                            fontWeight: "700",
                            fontSize: "13px",
                          }}
                        >
                          {op.name ? op.name.charAt(0).toUpperCase() : "O"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: "#fff" }}>{op.name}</div>
                          {op.contactPhone && (
                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                              {op.contactPhone}
                            </div>
                          )}
                        </div>
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
                        {op.employeeCode}
                      </code>
                    </td>

                    <td>
                      <span className="badge badge-role">{op.role || "PICKER"}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        {op.shift}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${op.status === "ACTIVE" ? "badge-active" : "badge-inactive"}`}>
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: op.status === "ACTIVE" ? "#34d399" : "#f87171",
                            display: "inline-block",
                          }}
                        />
                        {op.status}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          onClick={() => handleEdit(op)}
                          className="btn btn-secondary btn-sm"
                          title="Edit operator details"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(op)}
                          className={`btn btn-sm ${op.status === "ACTIVE" ? "btn-secondary" : "btn-success"}`}
                          title={op.status === "ACTIVE" ? "Deactivate operator" : "Activate operator"}
                        >
                          <Power size={14} />
                          <span>{op.status === "ACTIVE" ? "Deactivate" : "Activate"}</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => setDeleteConfirmId(op._id)}
                            className="btn btn-outline-danger btn-sm"
                            title="Delete operator"
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
                      <Users2 size={40} />
                      <h3>No operators found</h3>
                      <p>Try adjusting your search query or filters, or onboard a new operator.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ======================================================== */}
      {/* ADD / EDIT OPERATOR MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: "17px", display: "flex", alignItems: "center", gap: "8px" }}>
                <UserCheck size={20} color="#6366f1" />
                <span>{editingId ? "Update Operator Profile" : "Onboard New Operator"}</span>
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
                    placeholder="e.g. Marcus Vance"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WH-OP-102"
                    value={form.employeeCode}
                    onChange={(e) => setForm({ ...form, employeeCode: e.target.value.toUpperCase() })}
                    className="input-control"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="input-control"
                    >
                      {OPERATOR_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="input-control"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Shift Schedule *</label>
                  <select
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value })}
                    className="input-control"
                  >
                    <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                    <option value="Evening (16:00 - 00:00)">Evening (16:00 - 00:00)</option>
                    <option value="Night (00:00 - 08:00)">Night (00:00 - 08:00)</option>
                    <option value="Weekend Shift">Weekend Shift</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 234-5678"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="input-control"
                  />
                </div>

                {!editingId && (
                  <div className="form-group">
                    <label className="form-label">Custom Password (Optional)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to use employee code as password"
                      value={form.customPassword}
                      onChange={(e) => setForm({ ...form, customPassword: e.target.value })}
                      className="input-control"
                    />
                  </div>
                )}

                {/* Auto Provisioning Notice */}
                {!editingId && form.employeeCode && (
                  <div
                    style={{
                      padding: "12px",
                      background: "rgba(99, 102, 241, 0.1)",
                      border: "1px dashed rgba(99, 102, 241, 0.3)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "12px",
                      color: "#c7d2fe",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <KeyRound size={16} color="#818cf8" style={{ flexShrink: 0 }} />
                    <div>
                      Auto Login Account: <strong>{form.employeeCode.toLowerCase()}</strong> / Default Password: <strong>{form.customPassword || form.employeeCode}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Operator" : "Create Operator & Credentials"}
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
          <div className="modal-card" style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "16px", color: "#f87171", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={20} />
                <span>Confirm Permanent Deletion</span>
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
                Are you sure you want to delete this operator? This will also remove their linked system login credentials. Operators with pending tasks cannot be deleted.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteOperator} className="btn btn-danger" disabled={loading}>
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Operators;