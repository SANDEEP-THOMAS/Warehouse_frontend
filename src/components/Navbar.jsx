import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Boxes,
  LayoutDashboard,
  CheckSquare,
  Users2,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

function Navbar() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const role = auth?.user?.role || "";
  const username = auth?.user?.name || auth?.user?.username || "User";

  const getRoleBadgeClass = () => {
    if (role === "ADMIN") return "badge-priority-urgent";
    if (role === "SUPERVISOR") return "badge-pending";
    return "badge-in_progress";
  };

  const navLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      to: "/tasks",
      label: "Tasks",
      icon: CheckSquare,
      show: true, // Everyone has access to tasks (scoped by role)
    },
    {
      to: "/operators",
      label: "Operators",
      icon: Users2,
      show: role === "ADMIN" || role === "SUPERVISOR",
    },
    {
      to: "/users",
      label: "User Access",
      icon: ShieldAlert,
      show: role === "ADMIN",
    },
  ];

  return (
    <header style={styles.header}>
      <div style={styles.navContainer}>
        {/* Brand / Logo */}
        <Link to="/dashboard" style={styles.brand}>
          <div style={styles.logoIcon}>
            <Boxes size={22} color="#ffffff" />
          </div>
          <div>
            <div style={styles.brandTitle}>
              Warehouse<span style={{ color: "var(--primary)" }}>OS</span>
            </div>
            <div style={styles.versionBadge}>v2.0 Enterprise</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={styles.desktopNav}>
          {navLinks
            .filter((link) => link.show)
            .map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                  }}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* User Pill & Logout */}
        <div style={styles.userSection}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>
              <User size={15} color="#cbd5e1" />
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{username}</span>
              <span className={`badge ${getRoleBadgeClass()}`} style={{ fontSize: "10px", padding: "1px 7px" }}>
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            title="Log out of session"
          >
            <LogOut size={16} />
            <span style={styles.logoutText}>Logout</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={styles.mobileToggle}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={styles.mobileNav}>
          {navLinks
            .filter((link) => link.show)
            .map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    ...styles.mobileNavLink,
                    ...(isActive ? styles.navLinkActive : {}),
                  }}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
        </div>
      )}
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--border-subtle)",
    position: "sticky",
    top: 0,
    zIndex: 900,
  },
  navContainer: {
    maxWidth: "1380px",
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
  },
  brandTitle: {
    fontSize: "19px",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },
  versionBadge: {
    fontSize: "10px",
    color: "var(--text-dim)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  desktopNav: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "var(--radius-md)",
    color: "var(--text-muted)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    transition: "var(--transition)",
  },
  navLinkActive: {
    color: "#ffffff",
    backgroundColor: "rgba(99, 102, 241, 0.16)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 12px",
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#fff",
    maxWidth: "130px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    borderRadius: "var(--radius-md)",
    color: "#f87171",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "var(--transition)",
  },
  logoutText: {
    display: "inline",
  },
  mobileToggle: {
    display: "none",
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  mobileNav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px 24px 20px",
    borderTop: "1px solid var(--border-subtle)",
    background: "#0f172a",
  },
  mobileNavLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    color: "var(--text-muted)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "var(--radius-md)",
  },
};

export default Navbar;