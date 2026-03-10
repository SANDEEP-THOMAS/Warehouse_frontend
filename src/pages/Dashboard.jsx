import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Dashboard() {
  const { auth } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {

        // ✅ FIX 1: correct API path
        // const res = await api.get("/api/dashboard");
        const res = await api.get("/dashboard");

        console.log("Dashboard data:", res.data); // helpful debug

        setData(res.data);
      } catch (error) {

        // ✅ FIX 2: better error handling
        console.log("Dashboard fetch error:", error.response?.data || error.message);

      } finally {

        // ✅ FIX 3: stop loading even if error happens
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <h3 style={{ padding: "20px" }}>Loading Dashboard...</h3>;

  if (!data) return <h3 style={{ padding: "20px" }}>No dashboard data</h3>;

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <h2 style={{ marginBottom: "20px" }}>
          {auth?.user?.role} Dashboard
        </h2>

        {/* ADMIN DASHBOARD */}
        {auth?.user?.role === "ADMIN" && (
          <div style={styles.grid}>
            <Card title="Total Operators" value={data.totalOperators} />
            <Card title="Active Operators" value={data.activeOperators} />
            <Card title="Total Tasks" value={data.totalTasks} />
            <Card title="Pending Tasks" value={data.pendingTasks} />
            <Card title="Completed Today" value={data.completedToday} />
          </div>
        )}

        {/* SUPERVISOR DASHBOARD */}
        {auth?.user?.role === "SUPERVISOR" && (
          <div style={styles.grid}>
            <Card title="Tasks Assigned Today" value={data.tasksAssignedToday} />
            <Card title="Pending Tasks" value={data.pendingTasks} />
            <Card title="Operators On Shift" value={data.operatorsOnShift} />
          </div>
        )}

        {/* OPERATOR DASHBOARD */}
        {auth?.user?.role === "OPERATOR" && (
          <div style={styles.grid}>
            <Card title="My Tasks" value={data.myTasks} />
            <Card title="My Pending Tasks" value={data.myPendingTasks} />
            <Card title="My Completed Tasks" value={data.myCompletedTasks} />
          </div>
        )}
      </div>
    </>
  );
}

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <h4>{title}</h4>
      <p style={styles.value}>{value || 0}</p>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  value: {
    fontSize: "24px",
    fontWeight: "bold",
    marginTop: "10px",
  },
};

export default Dashboard;