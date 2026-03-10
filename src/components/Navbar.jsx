import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.nav}>
      <h3>Warehouse System</h3>

      <div>
        <Link style={styles.link} to="/dashboard">
          Dashboard
        </Link>

        {auth?.user.role === "ADMIN" && (
          <Link style={styles.link} to="/users">
            Users
          </Link>
        )}

        {/* Hide for OPERATOR */}
        {auth?.user.role !== "OPERATOR" && (
          <Link style={styles.link} to="/operators">
            Operators
          </Link>
        )}

        {/* Hide for OPERATOR */}
        {auth?.user.role !== "OPERATOR" && (
          <Link style={styles.link} to="/tasks">
            Tasks
          </Link>
        )}

        {/* Logged in user display */}
        <span style={styles.user}>
          {auth?.user?.username} ({auth?.user?.role})
        </span>

        <button style={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    backgroundColor: "#343a40",
    color: "white",
  },
  link: {
    marginRight: "15px",
    color: "white",
    textDecoration: "none",
  },
  user: {
    marginRight: "15px",
    color: "#ffc107",
    fontWeight: "bold",
  },
  logout: {
    padding: "5px 10px",
    backgroundColor: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default Navbar;