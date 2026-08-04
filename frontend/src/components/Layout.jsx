import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import brandLogo from "../SettyRents.png";
import { logout } from "../features/auth/slices/authSlice";

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div style={styles.appContainer}>
      <style>
        {`
          .nav-hamburger-btn {
            display: none;
            background: transparent;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            font-size: 20px;
            padding: 6px 10px;
            cursor: pointer;
            color: #0f172a;
          }

          @media (max-width: 768px) {
            .nav-hamburger-btn {
              display: block !important;
            }
            .nav-links-container {
              display: ${mobileMenuOpen ? "flex" : "none"} !important;
              flex-direction: column !important;
              width: 100% !important;
              align-items: stretch !important;
              margin-top: 16px !important;
              padding-top: 12px !important;
              border-top: 1px solid #e2e8f0;
            }
            .nav-link-item {
              text-align: left !important;
              padding: 10px 12px !important;
            }
          }
        `}
      </style>

      <header style={styles.header}>
        <div
          style={styles.navBrand}
          onClick={() => handleNavClick("/dashboard")}
        >
          <img
            src={brandLogo}
            alt="SettyRents Logo"
            style={styles.brandLogoImg}
          />
        </div>

        <button
          className="nav-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <nav className="nav-links-container" style={styles.navLinks}>
          <button
            className="nav-link-item"
            style={styles.navLinkBtn}
            onClick={() => handleNavClick("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="nav-link-item"
            style={styles.navLinkBtn}
            onClick={() => handleNavClick("/buildings")}
          >
            Buildings
          </button>
          <button
            className="nav-link-item"
            style={styles.navLinkBtn}
            onClick={() => handleNavClick("/floors")}
          >
            Floors
          </button>
          <button
            className="nav-link-item"
            style={styles.navLinkBtn}
            onClick={() => handleNavClick("/rooms")}
          >
            Rooms
          </button>
          <button
            className="nav-link-item"
            style={styles.navLinkBtn}
            onClick={() => handleNavClick("/tenants")}
          >
            Tenants
          </button>
          <button
            className="nav-link-item"
            style={styles.navLinkBtn}
            onClick={() => handleNavClick("/rent-entry")}
          >
            Rent Entry
          </button>
          <button
            className="nav-link-item"
            style={styles.navLinkBtn}
            onClick={() => handleNavClick("/bills")}
          >
            Bills
          </button>
          <button
            className="nav-link-item"
            style={styles.logoutBtn}
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  appContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
    flexWrap: "wrap",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  brandLogoImg: {
    height: "62px",
    objectFit: "contain",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  navLinkBtn: {
    background: "transparent",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "6px",
  },
  logoutBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
  },
  mainContent: {
    flex: 1,
    padding: "20px",
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
};

export default Layout;
