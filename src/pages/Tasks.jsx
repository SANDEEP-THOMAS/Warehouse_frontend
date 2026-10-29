import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import {
  CheckSquare,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  ShieldAlert,
} from "lucide-react";

const TASK_TYPES = ["PICKING", "PACKING", "STOWING", "RECEIVING", "CYCLE_COUNT", "SHIPPING"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUS_TABS = ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function Tasks() {
  const { auth } = useContext(AuthContext);
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [operatorFilter, setOperatorFilter] = useState("ALL");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const initialForm = {
    title: "",
    description: "",
    taskType: "PICKING",
    priority: "MEDIUM",
    assignedOperator: "",
    notes: "",
  };

  const [form, setForm] = useState(initialForm);

  // ================= FETCH DATA =================
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== "ALL") params.status = activeTab;
      if (priorityFilter !== "ALL") params.priority = priorityFilter;
      if (operatorFilter !== "ALL") params.operatorId = operatorFilter;
      if (search) params.search = search;

      const res = await api.get("/tasks", { params });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveOperators = async () => {
    try {
      const res = await api.get("/operators");
      const ops = Array.isArray(res.data) ? res.data : res.data.operators || [];
      setOperators(ops.filter((op) => op.status === "ACTIVE"));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchActiveOperators();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [activeTab, priorityFilter, operatorFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ================= FORM SUBMISSION =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.assignedOperator) {
      showToast("Please assign this task to an active operator", "error");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await api.patch(`/tasks/${editingId}`, form);
        showToast("Task details updated successfully", "success");
      } else {
        await api.post("/tasks", form);
        showToast("Work task dispatched successfully", "success");
      }

      closeModal();
      fetchTasks();
    } catch (error) {
      showToast(error.response?.data?.message || "Error submitting task", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS UPDATE =================
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      showToast(`Task status updated to ${newStatus.replace("_", " ")}`, "success");
      fetchTasks();
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid status transition", "error");
    }
  };

  // ================= MODAL CONTROLS =================
  const openCreateModal = () => {
    setForm({
      ...initialForm,
      assignedOperator: operators.length > 0 ? operators[0]._id : "",
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title || "",
      description: task.description || "",
      taskType: task.taskType || "PICKING",
      priority: task.priority || "MEDIUM",
      assignedOperator: task.assignedOperator?._id || "",
      notes: task.notes || "",
    });
    setEditingId(task._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  // ================= DELETE TASK =================
  const handleDeleteTask = async () => {
    if (!deleteConfirmId) return;

    try {
      setLoading(true);
      await api.delete(`/tasks/${deleteConfirmId}`);
      showToast("Task deleted successfully", "success");
      setDeleteConfirmId(null);
      fetchTasks();
    } catch (error) {
      showToast(error.response?.data?.message || "Could not delete task", "error");
    } finally {
      setLoading(false);
    }
  };

  const userRole = auth?.user?.role || "OPERATOR";
  const canDispatch = userRole === "ADMIN" || userRole === "SUPERVISOR";
  const isAdmin = userRole === "ADMIN";

  return (
    <>
      <Navbar />

      <main className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <CheckSquare size={26} color="#6366f1" />
              <span>Warehouse Task Board</span>
            </h1>
            <p className="page-subtitle">
              Dispatch, track, and monitor pick, pack, stow, and inventory work orders
            </p>
          </div>

          {canDispatch && (
            <button onClick={openCreateModal} className="btn btn-primary">
              <Plus size={18} />
              <span>Dispatch New Task</span>
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="tabs-container">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Filters Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by title, description, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-control"
              style={{ width: "auto" }}
            >
              <option value="ALL">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>

            {canDispatch && (
              <select
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
                className="input-control"
                style={{ width: "auto" }}
              >
                <option value="ALL">All Operators</option>
                {operators.map((op) => (
                  <option key={op._id} value={op._id}>
                    {op.name} ({op.employeeCode})
                  </option>
                ))}
              </select>
            )}

            <button onClick={fetchTasks} className="btn btn-secondary btn-icon" title="Refresh tasks">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Task Order</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Assigned Operator</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: "700", color: "#fff", fontSize: "14px" }}>
                          {task.title}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            maxWidth: "320px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: "2px",
                          }}
                        >
                          {task.description}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#cbd5e1",
                          background: "rgba(15, 23, 42, 0.6)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {task.taskType}
                      </span>
                    </td>

                    <td>
                      <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      {task.assignedOperator ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "rgba(99, 102, 241, 0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#818cf8",
                              fontWeight: "700",
                              fontSize: "11px",
                            }}
                          >
                            {task.assignedOperator.name?.charAt(0) || "O"}
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>
                              {task.assignedOperator.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                              {task.assignedOperator.employeeCode}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-dim)", fontSize: "13px" }}>Unassigned</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`badge badge-${task.status?.toLowerCase()}`}>
                          {task.status?.replace("_", " ")}
                        </span>

                        {/* Status Switcher Dropdown */}
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="input-control"
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            width: "auto",
                            background: "rgba(30, 41, 59, 0.9)",
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          {canDispatch && <option value="CANCELLED">CANCELLED</option>}
                        </select>
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        {canDispatch && (
                          <button
                            onClick={() => handleEdit(task)}
                            className="btn btn-secondary btn-sm"
                            title="Edit task"
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => setDeleteConfirmId(task._id)}
                            className="btn btn-outline-danger btn-sm"
                            title="Delete task"
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
                      <CheckSquare size={40} />
                      <h3>No tasks match your current view</h3>
                      <p>Try switching filter tabs or dispatch a new task order.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ======================================================== */}
      {/* ADD / EDIT TASK MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: "17px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckSquare size={20} color="#6366f1" />
                <span>{editingId ? "Edit Work Order" : "Dispatch New Warehouse Task"}</span>
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
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pick Batch #A-402 (Aisle 4, Shelf 2)"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Instructions / Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="List specific items, SKUs, quantity, or handling requirements..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-control"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Task Category *</label>
                    <select
                      value={form.taskType}
                      onChange={(e) => setForm({ ...form, taskType: e.target.value })}
                      className="input-control"
                    >
                      {TASK_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority Level *</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="input-control"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign To Operator *</label>
                  <select
                    value={form.assignedOperator}
                    onChange={(e) => setForm({ ...form, assignedOperator: e.target.value })}
                    className="input-control"
                    required
                  >
                    <option value="">Select an active operator</option>
                    {operators.map((op) => (
                      <option key={op._id} value={op._id}>
                        {op.name} ({op.employeeCode}) • {op.role} - {op.shift}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Warehouse Notes / Location Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Zone B, Bay 14, Forklift Required"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Processing..." : editingId ? "Save Changes" : "Dispatch Task"}
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
                <span>Delete Task</span>
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
                Are you sure you want to permanently delete this task order? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteTask} className="btn btn-danger" disabled={loading}>
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Tasks;