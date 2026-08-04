import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createBuilding,
  updateBuilding,
  clearError,
} from "../slices/buildingSlice";

export const BuildingForm = ({ currentBuilding, clearEditing }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "green" for create, "blue" for update

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading, error } = useSelector(
    (state) => state.buildings || {},
  );

  // Automatically vanish the success message after 4 seconds
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
      setMessageType("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (currentBuilding) {
      setName(currentBuilding.name || "");
      setAddress(currentBuilding.address || "");
    } else {
      setName("");
      setAddress("");
    }
    dispatch(clearError());
  }, [currentBuilding, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    dispatch(clearError());
    setSuccessMessage("");
    setMessageType("");

    if (currentBuilding) {
      dispatch(
        updateBuilding({
          id: currentBuilding.id,
          buildingData: { name, address },
          navigate,
        }),
      ).then((res) => {
        if (!res.error) {
          const msg =
            res.payload?.message ||
            res.payload?.data?.message ||
            (typeof res.payload === "string" ? res.payload : null);

          setSuccessMessage(msg || "Building updated successfully.");
          setMessageType("blue"); // Blue alert style for updating
          clearEditing();
          setName("");
          setAddress("");
        }
      });
    } else {
      dispatch(
        createBuilding({
          buildingData: { name, address },
          navigate,
        }),
      ).then((res) => {
        if (!res.error) {
          const msg =
            res.payload?.message ||
            res.payload?.data?.message ||
            (typeof res.payload === "string" ? res.payload : null);

          setSuccessMessage(msg || "Building added successfully.");
          setMessageType("green"); // Green alert style for creating
          setName("");
          setAddress("");
        }
      });
    }
  };

  // Dynamically select alert box style based on whether it was a creation (green) or update (blue)
  const getSuccessBoxStyle = () => {
    if (messageType === "blue") {
      return styles.updateBox; // Blue styling
    }
    return styles.successBox; // Green styling (default)
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.formTitle}>
        {currentBuilding ? "Update Building" : "Add New Building"}
      </h3>

      {/* Backend Error Alert Box (Red for errors/deletions) */}
      {error && (
        <div style={styles.errorBox}>
          {typeof error === "string" ? error : error.message}
        </div>
      )}

      {/* Backend Success Alert Box (Green for create, Blue for update) */}
      {successMessage && (
        <div style={getSuccessBoxStyle()}>{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Building Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) dispatch(clearError());
              if (successMessage) {
                setSuccessMessage("");
                setMessageType("");
              }
            }}
            placeholder="e.g. Sunrise Heights"
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (error) dispatch(clearError());
              if (successMessage) {
                setSuccessMessage("");
                setMessageType("");
              }
            }}
            placeholder="e.g. 123 Main Street"
            required
            style={styles.input}
          />
        </div>
        <div style={styles.buttonGroup}>
          <button
            type="submit"
            disabled={actionLoading}
            style={{
              ...styles.submitBtn,
              opacity: actionLoading ? 0.7 : 1,
              cursor: actionLoading ? "not-allowed" : "pointer",
            }}
          >
            {actionLoading
              ? "Saving..."
              : currentBuilding
                ? "Update Building"
                : "Save Building"}
          </button>
          {currentBuilding && (
            <button
              type="button"
              onClick={() => {
                clearEditing();
                setName("");
                setAddress("");
                dispatch(clearError());
                setSuccessMessage("");
                setMessageType("");
              }}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const styles = {
  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    marginBottom: "24px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "16px",
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
  successBox: {
    padding: "10px 14px",
    marginBottom: "16px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: "13px",
    borderRadius: "8px",
    textAlign: "center",
  },
  updateBox: {
    padding: "10px 14px",
    marginBottom: "16px",
    backgroundColor: "#eff6ff", // Light blue background
    border: "1px solid #bfdbfe", // Soft blue border
    color: "#1e40af", // Dark blue text
    fontSize: "13px",
    borderRadius: "8px",
    textAlign: "center",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    alignItems: "end",
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
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  submitBtn: {
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#0f172a",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    backgroundColor: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default BuildingForm;
