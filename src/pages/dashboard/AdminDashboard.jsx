// import { useEffect, useState } from "react";
// import api from "../../api/axios";
// import Navbar from "../../components/Navbar";

// const AdminDashboard = () => {
//   const [data, setData] = useState({});

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await api.get("/dashboard/admin");
//       setData(res.data);
//     };
//     fetchData();
//   }, []);

//   return (
//     <>
//       <Navbar />
//       <div style={{ padding: "20px" }}>
//         <h2>Admin Dashboard</h2>
//         <p>Total Operators: {data.totalOperators}</p>
//         <p>Active Operators: {data.activeOperators}</p>
//         <p>Total Tasks: {data.totalTasks}</p>
//         <p>Pending Tasks: {data.pendingTasks}</p>
//         <p>Completed Today: {data.completedToday}</p>
//       </div>
//     </>
//   );
// };

// export default AdminDashboard;