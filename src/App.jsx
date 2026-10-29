import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Operators from "./pages/Operators";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication page */}
        <Route path="/" element={<Login />} />

        {/* Unified Dashboard accessible to all authenticated roles */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Tasks View: Accessible to Admin, Supervisor, and Operator */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />

        {/* Operator Workforce Management: Admin & Supervisor */}
        <Route
          path="/operators"
          element={
            <RoleRoute allowedRoles={["ADMIN", "SUPERVISOR"]}>
              <Operators />
            </RoleRoute>
          }
        />

        {/* System User Accounts & Roles: Strictly Admin */}
        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <Users />
            </RoleRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;