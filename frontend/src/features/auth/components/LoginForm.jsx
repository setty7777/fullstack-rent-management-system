import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../slices/authSlice";
import brandLogo from "../../../SettyRents.png";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;

    dispatch(clearError());

    dispatch(loginUser({ credentials: { username, password }, navigate })).then(
      (res) => {
        if (!res.error) {
          navigate("/dashboard");
        }
      },
    );
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @media (max-width: 480px) {
            .auth-card {
              padding: 20px !important;
              border: none !important;
              box-shadow: none !important;
              background: transparent !important;
            }
          }
        `}
      </style>
      <div className="auth-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <img src={brandLogo} alt="Logo" style={styles.logo} />
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>
            Enter your credentials to access your dashboard
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {typeof error === "string" ? error : error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) dispatch(clearError());
              }}
              placeholder="Enter username"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) dispatch(clearError());
              }}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#f8fafc",
    padding: "16px",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "36px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "24px",
    textAlign: "center",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },
  logo: {
    maxHeight: "110px",
    width: "auto",
    objectFit: "contain",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.4",
  },
  errorBox: {
    padding: "10px 14px",
    marginBottom: "16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "13px",
    borderRadius: "8px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },
  button: {
    width: "100%",
    marginTop: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#0f172a",
    border: "none",
    borderRadius: "8px",
    transition: "background-color 0.2s",
    boxSizing: "border-box",
  },
};

export default LoginForm;
