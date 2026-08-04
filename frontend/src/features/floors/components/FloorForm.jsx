import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createFloor, updateFloor, clearError } from "../slices/floorSlice";

export const FloorForm = ({ currentFloor, clearEditing, buildings }) => {
  const [buildingId, setBuildingId] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "green" for create, "blue" for update

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading, error } = useSelector((state) => state.floors || {});

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
    if (currentFloor) {
      setBuildingId(currentFloor.building_id || "");
      setFloorNumber(currentFloor.floor_number || "");
    } else {
      setBuildingId("");
      setFloorNumber("");
    }
    dispatch(clearError());
  }, [currentFloor, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!buildingId || !floorNumber.trim()) return;

    dispatch(clearError());
    setSuccessMessage("");
    setMessageType("");

    const floorData = {
      building_id: Number(buildingId),
      floor_number: floorNumber.trim(),
    };

    if (currentFloor) {
      dispatch(
        updateFloor({
          id: currentFloor.id,
          floorData,
          navigate,
        }),
      ).then((res) => {
        if (!res.error) {
          const msg =
            res.payload?.message ||
            res.payload?.data?.message ||
            (typeof res.payload === "string" ? res.payload : null);

          setSuccessMessage(msg || "Floor updated successfully.");
          setMessageType("blue"); // Blue alert style for updating
          clearEditing();
          setBuildingId("");
          setFloorNumber("");
        }
      });
    } else {
      dispatch(
        createFloor({
          floorData,
          navigate,
        }),
      ).then((res) => {
        if (!res.error) {
          const msg =
            res.payload?.message ||
            res.payload?.data?.message ||
            (typeof res.payload === "string" ? res.payload : null);

          setSuccessMessage(msg || "Floor added successfully.");
          setMessageType("green"); // Green alert style for creating
          setBuildingId("");
          setFloorNumber("");
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
        {currentFloor ? "Update Floor" : "Add New Floor"}
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
          <label style={styles.label}>Select Building</label>
          <select
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              if (error) dispatch(clearError());
              if (successMessage) {
                setSuccessMessage("");
                setMessageType("");
              }
            }}
            required
            style={styles.select}
          >
            <option value="">-- Choose Building --</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Floor Number / Name</label>
          <input
            type="text"
            value={floorNumber}
            onChange={(e) => {
              setFloorNumber(e.target.value);
              if (error) dispatch(clearError());
              if (successMessage) {
                setSuccessMessage("");
                setMessageType("");
              }
            }}
            placeholder="e.g. Ground Floor or 1st Floor"
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
              : currentFloor
                ? "Update Floor"
                : "Save Floor"}
          </button>
          {currentFloor && (
            <button
              type="button"
              onClick={() => {
                clearEditing();
                setBuildingId("");
                setFloorNumber("");
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
  select: {
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

export default FloorForm;
