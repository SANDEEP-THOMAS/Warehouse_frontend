// import React, { useEffect } from "react";
// import { useState } from "react";
// import api from "../api/axios";

// function Employee() {
//   const [form, setform] = useState({
//     empname: "",
//     empid: "",
//     empdob: "",
//   });

//   const [employees, setemployees] = useState([]);
//   const [editingId, seteditingId] = useState(null);

//   const handleChange = (e) => {
//     setform({ ...form, [e.target.name]: e.target.value });
//     // console.log(form);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // console.log(form);
//     const data = {
//       name: form.empname,
//       employeeCode: form.empid,
//       shift: form.empdob,
//     };

//     try {
//       if (editingId) {
//         await api.patch(`/operators/${editingId}`, data);
//       } else {
//         await api.post("/operators", form);
//       }
//       fetchOPerators();

//       setform({
//         empname: "",
//         empid: "",
//         empdob: "",
//       });

//       seteditingId(null);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const fetchOPerators = async () => {
//     try {
//       const res = await api.get("/operators");
//     //   console.log(res.data);
//       setemployees(res.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await api.delete(`/operators/${id}`);

//       fetchOPerators();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleUpdate = (emp) => {
//     setform({
//       empname: emp.name || "",
//       empid: emp.employeeCode || "",
//       empdob: emp.shift || "",
//     });
//     seteditingId(emp._id);
//   };

//   useEffect(() => {
//     fetchOPerators();
//   }, []);

//   return (
//     <>
//       <h2>Employee Details</h2>
//       {/* <form onSubmit={handleSubmit}>
//         <div
//           style={{ alignItems: "center", justifyContent: "center", margin: 50 }}
//         >
//           <div>
//             <input
//               name="empname"
//               placeholder="employee name"
//               type="text"
//               value={form.empname}
//               required
//               onChange={(e) => handleChange(e)}
//               style={{ margin: 30 ,marginBottom:5 }}
//             />
//           </div>

//           <div>
//             <input
//               name="empid"
//               placeholder="id"
//               type="text"
//               value={form.empid}
//               required
//               onChange={(e) => handleChange(e)}
//               style={{ margin: 30 , marginBottom:5 }}
//             />
//           </div>
//           <div>
//             <input
//               name="empdob"
//               placeholder="date of birth"
//               type="text"
//               value={form.empdob}
//               required
//               onChange={(e) => handleChange(e)}
//               style={{ margin: 30 , marginBottom:5 }}
//             />
//           </div>

//           <div>
//             <button type="submit" style={{ margin: 20 ,marginLeft:30 }}>
//               Submit
//             </button>
//           </div>
//         </div>
//       </form> */}

//       <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
//         <input
//           name="empname"
//           placeholder="Name"
//           value={form.empname}
//           onChange={handleChange}
//           required
//         />

//         <input
//           name="empid"
//           placeholder="Employee Code"
//           value={form.empid}
//           onChange={handleChange}
//           required
//           // disabled={editingId} // optional: prevent changing employee code during edit
//         />

//         {/* <select name="role" value={form.role} onChange={handleChange}>
//             <option value="PICKER">PICKER</option>
//             <option value="PACKER">PACKER</option>
//             <option value="SUPERVISOR">SUPERVISOR</option>
//           </select> */}

//         <input
//           name="empdob"
//           placeholder="EmpDob"
//           value={form.empdob}
//           onChange={handleChange}
//           required
//         />

//         <button type="submit">{editingId ? "Update" : "Create"}</button>
//         {/* <button>Delete</button> */}
//       </form>

//       {employees.map((emp) => (
//         <div>
//           <p style={{ marginLeft: 50, marginTop: 50 }}>
//             EmployeeName:{emp.name}
//           </p>
//           <p style={{ marginLeft: 50 }}>EmployeeId:{emp.employeeCode}</p>
//           <p style={{ marginLeft: 50 }}>EmployeeDob:{emp.shift}</p>
//           <button onClick={() => handleUpdate(emp)} style={{ marginLeft: 50 }}>
//             Edit
//           </button>
//           <button
//             onClick={() => handleDelete(emp._id)}
//             style={{ marginLeft: 50 }}
//           >
//             Delete
//           </button>
//         </div>
//       ))}
//     </>
//   );
// }

// export default Employee;
