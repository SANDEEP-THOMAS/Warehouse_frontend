// import { useEffect, useState } from "react";
// import api from "../../api/axios";
// import Navbar from "../../components/Navbar";

// const OperatorDashboard = () => {
//   const [data, setData] = useState({});

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await api.get("/dashboard/operator");
//       setData(res.data);
//     };
//     fetchData();
//   }, []);

//   return (
//     <>
//       <Navbar />
//       <div style={{ padding: "20px" }}>
//         <h2>Operator Dashboard</h2>
//         <p>My Tasks: {data.myTasks}</p>
//         <p>My Pending Tasks: {data.pendingTasks}</p>
//         <p>My Completed Tasks: {data.completedTasks}</p>
//       </div>
//     </>
//   );
// };

// export default OperatorDashboard;