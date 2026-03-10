// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";

// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Users from "./pages/Users";
// import Operators from "./pages/Operators";
// import Tasks from "./pages/Tasks";

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Login />} />

//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/users"
//             element={
//               <ProtectedRoute>
//                 <Users />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/operators"
//             element={
//               <ProtectedRoute>
//                 <Operators />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/tasks"
//             element={
//               <ProtectedRoute>
//                 <Tasks />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute"; 

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Operators from "./pages/Operators";
import Tasks from "./pages/Tasks";
import Employee from "./pages/Employee";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public access */}
          <Route path="/" element={<Login />} />
          <Route path='/emp' element={<Employee/>} />

          {/* Any logged-in user (Admin, Supervisor, or Operator) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Strictly for ADMIN only */}
          <Route
            path="/users"
            element={
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Users />
              </RoleRoute>
            }
          />

          {/* Restricted to higher-level staff */}
          <Route
            path="/operators"
            element={
              <RoleRoute allowedRoles={["ADMIN", "SUPERVISOR"]}>
                <Operators />
              </RoleRoute>
            }
          />

          {/* Tasks management for ADMIN and SUPERVISOR */}
          <Route
            path="/tasks"
            element={
              <RoleRoute allowedRoles={["ADMIN", "SUPERVISOR"]}>
                <Tasks />
              </RoleRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;