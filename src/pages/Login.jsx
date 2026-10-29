import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Boxes,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast("Please enter both username and password", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });

      login(res.data);
      showToast(`Welcome back, ${res.data.user.name || res.data.user.username}!`, "success");
      navigate("/dashboard");
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed. Please check your credentials.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="glass-panel">
        {/* Header / Brand */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <Boxes size={28} color="#ffffff" />
          </div>
          <h1 style={styles.title}>Warehouse Operations</h1>
          <p style={styles.subtitle}>Workforce & Logistics Command Center</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username or Employee Code
            </label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                id="username"
                type="text"
                placeholder="e.g. admin or emp01"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-control"
                style={{ paddingLeft: "40px" }}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-control"
                style={{ paddingLeft: "40px", paddingRight: "40px" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.togglePasswordBtn}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "10px", fontSize: "15px" }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to System</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div style={styles.demoBox}>
          <div style={styles.demoTitle}>
            <ShieldCheck size={14} color="#6366f1" />
            <span>Default Root Credentials:</span>
          </div>
          <div style={styles.demoPills}>
            <button
              type="button"
              onClick={() => handleQuickFill("admin", "Admin@123")}
              style={styles.quickFillBtn}
            >
              <strong>Admin:</strong> admin / Admin@123
            </button>
          </div>
        </div>

        <div style={styles.footerNotice}>
          <CheckCircle size={14} color="#10b981" />
          <span>RBAC Protected: Admin, Supervisor & Operator</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "36px 32px",
    borderRadius: "var(--radius-xl)",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  logoBadge: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
  },
  title: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginTop: "4px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "var(--text-dim)",
    pointerEvents: "none",
  },
  togglePasswordBtn: {
    position: "absolute",
    right: "12px",
    background: "transparent",
    border: "none",
    color: "var(--text-dim)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },
  demoBox: {
    marginTop: "24px",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px dashed rgba(99, 102, 241, 0.35)",
  },
  demoTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "var(--text-muted)",
    fontWeight: "600",
    marginBottom: "8px",
  },
  demoPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  quickFillBtn: {
    background: "rgba(99, 102, 241, 0.12)",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    borderRadius: "var(--radius-sm)",
    color: "#c7d2fe",
    padding: "5px 9px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "var(--transition)",
    textAlign: "left",
    width: "100%",
  },
  footerNotice: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    marginTop: "20px",
    fontSize: "12px",
    color: "var(--text-dim)",
  },
};

export default Login;