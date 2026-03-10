import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function Operators() {
  const [operators, setOperators] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    employeeCode: "",
    role: "PICKER",
    shift: "",
  });

  // ================= FETCH =================
  const fetchOperators = async () => {
    try {
      const res = await api.get("/operators");

      // ✅ SAFE RESPONSE HANDLING
      const operatorsArray = Array.isArray(res.data)
        ? res.data
        : res.data.operators || [];

      setOperators(operatorsArray);

    } catch (error) {
      console.log(error);
      setOperators([]);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingId) {
        await api.put(`/operators/${editingId}`, form);
      } else {
        await api.post("/operators", form);
      }

      setForm({
        name: "",
        employeeCode: "",
        role: "PICKER",
        shift: "",
      });

      setEditingId(null);
      fetchOperators();

    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (op) => {
    if (op.status !== "ACTIVE") {
      alert("Cannot edit inactive operator");
      return;
    }

    setForm({
      name: op.name,
      employeeCode: op.employeeCode,
      role: op.role,
      shift: op.shift,
    });

    setEditingId(op._id);
  };

  // ================= HANDLE DEACTIVATE =================
  const handleDeactivate = async (id) => {
    try {
      setLoading(true);

      // ✅ CORRECT ROUTE (PATCH + /deactivate)
      await api.patch(`/operators/${id}/deactivate`);

      // Instant UI update
      setOperators((prev) =>
        prev.map((op) =>
          op._id === id ? { ...op, status: "INACTIVE" } : op
        )
      );

    } catch (error) {
      alert(error.response?.data?.message || "Deactivation failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER =================
  const filteredOperators = operators.filter((op) =>
    op.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h2>Operator Management</h2>

        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="employeeCode"
            placeholder="Employee Code"
            value={form.employeeCode}
            onChange={handleChange}
            required
            disabled={editingId} // optional: prevent changing employee code during edit
          />

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="PICKER">PICKER</option>
            <option value="PACKER">PACKER</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
          </select>

          <input
            name="shift"
            placeholder="Shift"
            value={form.shift}
            onChange={handleChange}
            required
          />

          <button disabled={loading}>
            {editingId ? "Update" : "Create"}
          </button>
        </form>

        <table border="1" width="100%" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Employee Code</th>
              <th>Role</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOperators.length > 0 ? (
              filteredOperators.map((op) => (
                <tr key={op._id}>
                  <td>{op.name}</td>
                  <td>{op.employeeCode}</td>
                  <td>{op.role}</td>
                  <td>{op.shift}</td>
                  <td
                    style={{
                      color: op.status === "ACTIVE" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {op.status}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(op)}>Edit</button>

                    {op.status === "ACTIVE" && (
                      <button
                        onClick={() => handleDeactivate(op._id)}
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
                  No Operators Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Operators;