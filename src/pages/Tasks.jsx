import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Tasks() {
  const { auth } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [operators, setOperators] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    taskType: "",
    priority: "LOW",
    assignedOperator: "",
  });

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch active operators
  const fetchOperators = async () => {
    try {
      const res = await api.get("/operators");
      const activeOps = Array.isArray(res.data)
        ? res.data.filter((op) => op.status === "ACTIVE")
        : [];
      setOperators(activeOps);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchOperators();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.patch(`/tasks/${editingId}`, form);
      } else {
        await api.post("/tasks", form);
      }

      await fetchTasks();

      setForm({
        title: "",
        description: "",
        taskType: "",
        priority: "LOW",
        assignedOperator: "",
      });

      setEditingId(null);
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };



  // Operator updates task status
const handleStatusUpdate = async (taskId, status) => {
  try {
    await api.patch(`/tasks/${taskId}`, { status });
    fetchTasks();
  } catch (error) {
    alert("Failed to update task status");
  }
};








  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      priority: task.priority,
      assignedOperator: task.assignedOperator?._id || "",
    });
    setEditingId(task._id);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}`, { status });
      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const canCreate = auth.user.role === "ADMIN";

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <h2 style={styles.heading}>Task Management</h2>

        {canCreate && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              style={styles.input}
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <input
              style={styles.input}
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
            />

            <input
              style={styles.input}
              name="taskType"
              placeholder="Task Type"
              value={form.taskType}
              onChange={handleChange}
              required
            />

            <select
              style={styles.input}
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>

            <select
              style={styles.input}
              name="assignedOperator"
              value={form.assignedOperator}
              onChange={handleChange}
              required
            >
              <option value="">Select Operator</option>
              {operators.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.name}
                </option>
              ))}
            </select>

            <button style={styles.button}>
              {editingId ? "Update Task" : "Create Task"}
            </button>
          </form>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Assigned</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          {/* <tbody>
            {tasks.map((task) => (
              <tr key={task._id}>
                <td style={styles.td}>{task.title}</td>
                <td style={styles.td}>{task.taskType}</td>
                <td style={styles.td}>{task.priority}</td>
                <td style={styles.td}>
                  {task.assignedOperator?.name}
                </td>
                <td style={styles.td}>{task.status}</td>
                <td style={styles.td}>
                  {(auth.user.role === "ADMIN" ||
                    auth.user.role === "SUPERVISOR" ||
                    task.assignedOperator?._id === auth.user.operatorId) && (
                    <select
                      style={styles.statusSelect}
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  )}

                  {canCreate && (
                    <button
                      style={styles.editBtn}
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody> */}


          <tbody>
  {tasks.map((task) => (
    <tr key={task._id}>
      <td style={styles.td}>{task.title}</td>
      <td style={styles.td}>{task.taskType}</td>
      <td style={styles.td}>{task.priority}</td>

      <td style={styles.td}>
        {task.assignedOperator?.name}
      </td>

      <td style={styles.td}>{task.status}</td>

      <td style={styles.td}>

        {/* ADMIN / SUPERVISOR / ASSIGNED OPERATOR can update status */}
        {(auth.user.role === "ADMIN" ||
          auth.user.role === "SUPERVISOR" ||
          task.assignedOperator?._id === auth.user.operatorId) && (
          <select
            style={styles.statusSelect}
            value={task.status}
            onChange={(e) =>
              handleStatusChange(task._id, e.target.value)
            }
          >
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        )}

        {/* Only ADMIN / SUPERVISOR can edit */}
        {canCreate && (
          <button
            style={styles.editBtn}
            onClick={() => handleEdit(task)}
          >
            Edit
          </button>
        )}

      </td>
    </tr>
  ))}
</tbody>







        </table>
      </div>
    </>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  heading: {
    marginBottom: "20px",
  },
  form: {
    marginBottom: "30px",
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    minWidth: "180px",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    border: "1px solid #ddd",
    padding: "12px",
    backgroundColor: "#f5f5f5",
    textAlign: "left",
    fontWeight: "600",
  },
  td: {
    border: "1px solid #ddd",
    padding: "12px",
    textAlign: "left",
    verticalAlign: "middle",
  },
  statusSelect: {
    padding: "6px",
    borderRadius: "4px",
  },
  editBtn: {
    marginLeft: "8px",
    padding: "6px 12px",
    backgroundColor: "orange",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
  },
};

export default Tasks;