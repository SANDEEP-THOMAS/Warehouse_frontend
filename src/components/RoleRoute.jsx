import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RoleRoute = ({ children, allowedRoles }) => {
  const { auth } = useContext(AuthContext);

  if (!auth) return <Navigate to="/" />;

  if (!allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default RoleRoute;