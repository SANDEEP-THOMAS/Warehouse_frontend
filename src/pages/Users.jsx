import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function Users() {
  const [users, setUsers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "OPERATOR",
    operatorId: "",
  });

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data?.users || res.data || []);
    } catch (error) {
      console.log("Fetch users error:", error);
      setUsers([]);
    }
  };

  // ================= FETCH OPERATORS =================
  const fetchOperators = async () => {
    try {
      const res = await api.get("/operators");
      setOperators(res.data?.operators || res.data || []);
    } catch (error) {
      console.log("Fetch operators error:", error);
      setOperators([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOperators();
  }, []);

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = { ...form };

      // Remove operatorId if not OPERATOR role
      if (payload.role !== "OPERATOR") {
        delete payload.operatorId;
      }

      if (editingId) {
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editingId}`, payload);
      } else {
        await api.post("/users", payload);
      }

      // Reset form
      setForm({
        name: "",
        username: "",
        password: "",
        role: "OPERATOR",
        operatorId: "",
      });

      setEditingId(null);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (user) => {
    setForm({
      name: user.name || "",
      username: user.username || "",
      password: "",
      role: user.role || "OPERATOR",
      operatorId: user.operatorId?._id || "",
    });

    setEditingId(user._id);
  };

  // ================= HANDLE DEACTIVATE =================
  const handleDeactivate = async (id) => {
    try {
      setLoading(true);

      await api.put(`/users/${id}`, { isActive: false });

      // Update UI immediately
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, isActive: false } : user,
        ),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Deactivation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h2>User Management</h2>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          {!editingId && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          )}

          {/* <select name="role" value={form.role} onChange={handleChange}>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
            <option value="OPERATOR">OPERATOR</option>
          </select> */}
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
          </select>

          {/* {form.role === "OPERATOR" && (
            <select
              name="operatorId"
              value={form.operatorId}
              onChange={handleChange}
              required
            >
              <option value="">Select Operator</option>
              {operators.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.name} ({op.employeeCode})
                </option>
              ))}
            </select>
          )} */}

          <button disabled={loading}>
            {editingId ? "Update User" : "Create User"}
          </button>
        </form>

        {/* ================= TABLE ================= */}
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Linked Operator</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.operatorId
                      ? `${user.operatorId.name} (${user.operatorId.employeeCode})`
                      : "N/A"}
                  </td>
                  {/* <td>
                    <span
                      style={{
                        color: user.isActive ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {user.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td> */}
                  <td>
                    <span
                      style={{
                        color: user.operatorId
                          ? user.operatorId.status === "ACTIVE"
                            ? "green"
                            : "red"
                          : user.isActive
                            ? "green"
                            : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {user.operatorId
                        ? user.operatorId.status
                        : user.isActive
                          ? "ACTIVE"
                          : "INACTIVE"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Edit</button>

                    {/* {user.isActive && (
                      <button
                        onClick={() => handleDeactivate(user._id)}
                        disabled={loading}
                      >
                        Deactivate
                      </button>
                    )} */}

                    {user.isActive &&
                      user.operatorId?.status !== "INACTIVE" && (
                        <button
                          onClick={() => handleDeactivate(user._id)}
                          disabled={loading}
                        >
                          Deactivate
                        </button>
                      )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No Users Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Users;
