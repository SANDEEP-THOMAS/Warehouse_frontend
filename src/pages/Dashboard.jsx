import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import {
  Users2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Sparkles,
} from "lucide-react";

function Dashboard() {
  const { auth } = useContext(AuthContext);
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      showToast(error.response?.data?.message || "Failed to load dashboard metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Operator quick status updater
  const handleOperatorTaskAction = async (taskId, nextStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await api.patch(`/tasks/${taskId}`, { status: nextStatus });
      showToast(`Task marked as ${nextStatus.replace("_", " ")}`, "success");
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update task status", "error");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const role = auth?.user?.role || "OPERATOR";

  if (loading && !data) {
    return (
      <>
        <Navbar />
        <div className="page-container" style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ color: "var(--primary)", marginBottom: "16px" }}>
            <RotateCcw className="animate-spin" size={32} style={{ animation: "spin 1s linear infinite" }} />
          </div>
          <h3>Loading Warehouse Metrics...</h3>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <span>{role === "ADMIN" ? "Executive Command Center" : role === "SUPERVISOR" ? "Shift Supervisor Hub" : "My Workforce Workbench"}</span>
              <span className="badge badge-role">{role}</span>
            </h1>
            <p className="page-subtitle">
              Real-time warehouse workforce and fulfillment analytics
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={fetchDashboard} className="btn btn-secondary btn-sm" title="Refresh metrics">
              <RotateCcw size={15} />
              <span>Refresh</span>
            </button>

            {(role === "ADMIN" || role === "SUPERVISOR") && (
              <Link to="/tasks" className="btn btn-primary btn-sm">
                <Plus size={16} />
                <span>Create Task</span>
              </Link>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1️⃣ ADMIN VIEW */}
        {/* ======================================================== */}
        {role === "ADMIN" && data && (
          <>
            <div className="stats-grid">
              <StatCard
                title="Total Operators"
                value={data.totalOperators || 0}
                icon={Users2}
                color="#6366f1"
                subtitle={`${data.activeOperators || 0} currently active`}
              />
              <StatCard
                title="Active Personnel"
                value={data.activeOperators || 0}
                icon={ShieldCheck}
                color="#10b981"
                subtitle="Ready for assignment"
              />
              <StatCard
                title="Total Work Tasks"
                value={data.totalTasks || 0}
                icon={CheckSquare}
                color="#38bdf8"
                subtitle={`${data.inProgressTasks || 0} in progress`}
              />
              <StatCard
                title="Pending Queue"
                value={data.pendingTasks || 0}
                icon={Clock}
                color="#f59e0b"
                subtitle="Awaiting processing"
              />
              <StatCard
                title="Completed Today"
                value={data.completedToday || 0}
                icon={CheckCircle2}
                color="#10b981"
                subtitle="Shift fulfillment"
              />
              <StatCard
                title="Urgent / High"
                value={data.urgentTasks || 0}
                icon={AlertTriangle}
                color="#ef4444"
                subtitle="Needs immediate action"
              />
            </div>

            {/* Admin Grid: Recent Tasks & Fast Links */}
            <div style={styles.twoColumnGrid}>
              {/* Recent Tasks Feed */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <div style={styles.sectionHeader}>
                  <h3 style={{ fontSize: "16px" }}>Recent Task Dispatches</h3>
                  <Link to="/tasks" className="btn btn-secondary btn-sm">
                    View All Tasks <ArrowRight size={14} />
                  </Link>
                </div>

                {data.recentTasks && data.recentTasks.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                    {data.recentTasks.map((task) => (
                      <div key={task._id} style={styles.taskFeedItem}>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px", color: "#fff" }}>{task.title}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                            Assigned to: <strong style={{ color: "#cbd5e1" }}>{task.assignedOperator?.name || "Unassigned"}</strong> • Type: {task.taskType}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>
                            {task.priority}
                          </span>
                          <span className={`badge badge-${task.status?.toLowerCase()}`}>
                            {task.status?.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: "30px 10px" }}>
                    <p>No tasks recorded yet</p>
                  </div>
                )}
              </div>

              {/* Quick Actions Panel */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Administrative Shortcuts</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Link to="/tasks" style={styles.shortcutCard}>
                    <div style={{ ...styles.shortcutIcon, background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                      <CheckSquare size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#fff", fontSize: "14px" }}>Dispatch & Manage Tasks</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Assign pick, pack, stow tasks to operators</div>
                    </div>
                  </Link>

                  <Link to="/operators" style={styles.shortcutCard}>
                    <div style={{ ...styles.shortcutIcon, background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                      <Users2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#fff", fontSize: "14px" }}>Manage Warehouse Operators</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Onboard pickers, packers, adjust shifts</div>
                    </div>
                  </Link>

                  <Link to="/users" style={styles.shortcutCard}>
                    <div style={{ ...styles.shortcutIcon, background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#fff", fontSize: "14px" }}>System Accounts & Roles</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Configure admin, supervisor, and operator logins</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 2️⃣ SUPERVISOR VIEW */}
        {/* ======================================================== */}
        {role === "SUPERVISOR" && data && (
          <>
            <div className="stats-grid">
              <StatCard
                title="Assigned Today"
                value={data.tasksAssignedToday || 0}
                icon={CheckSquare}
                color="#6366f1"
                subtitle="Tasks initiated this shift"
              />
              <StatCard
                title="Pending Queue"
                value={data.pendingTasks || 0}
                icon={Clock}
                color="#f59e0b"
                subtitle="Waiting for pickup"
              />
              <StatCard
                title="In Progress"
                value={data.inProgressTasks || 0}
                icon={Play}
                color="#38bdf8"
                subtitle="Active on floor"
              />
              <StatCard
                title="Completed Today"
                value={data.completedToday || 0}
                icon={CheckCircle2}
                color="#10b981"
                subtitle="Successful dispatches"
              />
              <StatCard
                title="Staff On Shift"
                value={data.operatorsOnShift || 0}
                icon={Users2}
                color="#818cf8"
                subtitle="Active workforce"
              />
              <StatCard
                title="Urgent Bottlenecks"
                value={data.urgentTasks || 0}
                icon={AlertTriangle}
                color="#ef4444"
                subtitle="High priority pending"
              />
            </div>

            <div className="glass-panel" style={{ padding: "24px" }}>
              <div style={styles.sectionHeader}>
                <h3 style={{ fontSize: "16px" }}>Shift Task Queue</h3>
                <Link to="/tasks" className="btn btn-primary btn-sm">
                  Go to Task Board <ArrowRight size={14} />
                </Link>
              </div>

              {data.recentTasks && data.recentTasks.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                  {data.recentTasks.map((task) => (
                    <div key={task._id} style={styles.taskFeedItem}>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px", color: "#fff" }}>{task.title}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Assigned to: <strong style={{ color: "#cbd5e1" }}>{task.assignedOperator?.name || "Unassigned"}</strong> • Shift: {task.assignedOperator?.shift || "Standard"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <span className={`badge badge-${task.status?.toLowerCase()}`}>
                          {task.status?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No tasks assigned for this shift yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 3️⃣ OPERATOR WORKBENCH VIEW */}
        {/* ======================================================== */}
        {role === "OPERATOR" && data && (
          <>
            {/* Operator Welcome Banner */}
            {data.operator && (
              <div className="glass-panel" style={styles.operatorBanner}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={styles.operatorAvatar}>
                    <Sparkles size={24} color="#6366f1" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "18px" }}>Welcome, {data.operator.name}!</h2>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Badge Code: <strong style={{ color: "#cbd5e1" }}>{data.operator.employeeCode}</strong> • Role: {data.operator.role} • Shift: {data.operator.shift}
                    </p>
                  </div>
                </div>
                <span className="badge badge-active" style={{ fontSize: "12px" }}>On Active Duty</span>
              </div>
            )}

            <div className="stats-grid">
              <StatCard
                title="My Total Tasks"
                value={data.myTasks || 0}
                icon={CheckSquare}
                color="#6366f1"
                subtitle="Assigned to your badge"
              />
              <StatCard
                title="To Begin (Pending)"
                value={data.myPendingTasks || 0}
                icon={Clock}
                color="#f59e0b"
                subtitle="Ready to start"
              />
              <StatCard
                title="In Progress"
                value={data.myInProgressTasks || 0}
                icon={Play}
                color="#38bdf8"
                subtitle="Currently processing"
              />
              <StatCard
                title="Completed"
                value={data.myCompletedTasks || 0}
                icon={CheckCircle2}
                color="#10b981"
                subtitle="Successfully fulfilled"
              />
            </div>

            {/* Operator Active Tasks List with Instant Action Buttons */}
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div style={styles.sectionHeader}>
                <h3 style={{ fontSize: "16px" }}>My Assigned Task Orders</h3>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Update task status directly as you complete work on the floor
                </span>
              </div>

              {data.recentTasks && data.recentTasks.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "18px" }}>
                  {data.recentTasks.map((task) => (
                    <div key={task._id} style={styles.operatorTaskCard}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: "700", fontSize: "15px", color: "#fff" }}>{task.title}</span>
                          <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>
                            {task.priority}
                          </span>
                          <span className={`badge badge-${task.status?.toLowerCase()}`}>
                            {task.status?.replace("_", " ")}
                          </span>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0" }}>
                          {task.description}
                        </p>
                        <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                          Type: <strong style={{ color: "#94a3b8" }}>{task.taskType}</strong> • Dispatched: {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Quick Status Control Buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {task.status === "PENDING" && (
                          <button
                            onClick={() => handleOperatorTaskAction(task._id, "IN_PROGRESS")}
                            className="btn btn-primary btn-sm"
                            disabled={updatingTaskId === task._id}
                          >
                            <Play size={14} />
                            <span>Start Task</span>
                          </button>
                        )}

                        {task.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => handleOperatorTaskAction(task._id, "COMPLETED")}
                            className="btn btn-success btn-sm"
                            disabled={updatingTaskId === task._id}
                          >
                            <CheckCircle2 size={14} />
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {task.status === "COMPLETED" && (
                          <span style={{ fontSize: "12px", color: "#34d399", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={16} /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <CheckSquare size={36} />
                  <h3>No tasks currently assigned</h3>
                  <p>Check back with your shift supervisor for new assignment batches.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h4>{title}</h4>
        <div className="stat-number">{value}</div>
        {subtitle && <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>{subtitle}</p>}
      </div>
      <div
        className="stat-icon-wrap"
        style={{
          background: `${color}18`,
          borderColor: `${color}35`,
          color: color,
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
}

const styles = {
  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "24px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskFeedItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    background: "rgba(15, 23, 42, 0.45)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)",
  },
  shortcutCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    background: "rgba(15, 23, 42, 0.45)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
    transition: "var(--transition)",
  },
  shortcutIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  operatorBanner: {
    padding: "20px 24px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
  },
  operatorAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "rgba(99, 102, 241, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  operatorTaskCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px",
    background: "rgba(15, 23, 42, 0.55)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)",
    flexWrap: "wrap",
    gap: "12px",
  },
};

export default Dashboard;