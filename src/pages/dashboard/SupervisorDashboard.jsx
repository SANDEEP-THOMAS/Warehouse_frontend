// import { useEffect, useState } from "react";
// import api from "../../api/axios";
// import Navbar from "../../components/Navbar";

// const SupervisorDashboard = () => {
//   const [data, setData] = useState({});

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await api.get("/dashboard/supervisor");
//       setData(res.data);
//     };
//     fetchData();
//   }, []);

//   return (
//     <>
//       <Navbar />
//       <div style={{ padding: "20px" }}>
//         <h2>Supervisor Dashboard</h2>
//         <p>Tasks Assigned Today: {data.tasksToday}</p>
//         <p>Pending Tasks: {data.pendingTasks}</p>
//         <p>Operators on Shift: {data.operatorsOnShift}</p>
//       </div>
//     </>
//   );
// };

// export default SupervisorDashboard;