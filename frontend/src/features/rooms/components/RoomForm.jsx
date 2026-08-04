import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createRoom, updateRoom, clearError } from "../slices/roomSlice";
import { apiRequest } from "../../../utils/api";

export const RoomForm = ({ currentRoom, clearEditing, buildings }) => {
  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [floors, setFloors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "green" for create, "blue" for update

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading, error } = useSelector((state) => state.rooms || {});

  // Automatically vanish the success message after 4 seconds
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
      setMessageType("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // Fetch floors dynamically whenever buildingId changes
  useEffect(() => {
    if (!buildingId) {
      setFloors([]);
      setFloorId("");
      return;
    }

    const fetchFloorsForBuilding = async () => {
      const data = await apiRequest({
        endpoint: `/floors/building/${buildingId}`,
        method: "GET",
        navigate,
      });
      if (data && data.success) {
        setFloors(data.data || []);
      } else {
        setFloors([]);
      }
    };

    fetchFloorsForBuilding();
  }, [buildingId, navigate]);

  useEffect(() => {
    if (currentRoom) {
      setBuildingId(currentRoom.building_id || "");
      setFloorId(currentRoom.floor_id || "");
      setRoomNumber(currentRoom.room_number || "");
    } else {
      setBuildingId("");
      setFloorId("");
      setRoomNumber("");
    }
    dispatch(clearError());
  }, [currentRoom, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!buildingId || !floorId || !roomNumber.trim()) return;

    dispatch(clearError());
    setSuccessMessage("");
    setMessageType("");

    const roomData = {
      building_id: Number(buildingId),
      floor_id: Number(floorId),
      room_number: roomNumber.trim(),
    };

    if (currentRoom) {
      dispatch(
        updateRoom({
          id: currentRoom.id,
          roomData,
          navigate,
        }),
      ).then((res) => {
        if (!res.error) {
          const msg =
            res.payload?.message ||
            res.payload?.data?.message ||
            (typeof res.payload === "string" ? res.payload : null);

          setSuccessMessage(msg || "Room updated successfully.");
          setMessageType("blue");
          clearEditing();
          setBuildingId("");
          setFloorId("");
          setRoomNumber("");
        }
      });
    } else {
      dispatch(
        createRoom({
          roomData,
          navigate,
        }),
      ).then((res) => {
        if (!res.error) {
          const msg =
            res.payload?.message ||
            res.payload?.data?.message ||
            (typeof res.payload === "string" ? res.payload : null);

          setSuccessMessage(msg || "Room added successfully.");
          setMessageType("green");
          setBuildingId("");
          setFloorId("");
          setRoomNumber("");
        }
      });
    }
  };

  const getSuccessBoxStyle = () => {
    if (messageType === "blue") {
      return styles.updateBox;
    }
    return styles.successBox;
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.formTitle}>
        {currentRoom ? "Update Room" : "Add New Room"}
      </h3>

      {error && (
        <div style={styles.errorBox}>
          {typeof error === "string" ? error : error.message}
        </div>
      )}
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
              setFloorId(""); // Reset floor when building changes
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
          <label style={styles.label}>Select Floor</label>
          <select
            value={floorId}
            onChange={(e) => {
              setFloorId(e.target.value);
              if (error) dispatch(clearError());
              if (successMessage) {
                setSuccessMessage("");
                setMessageType("");
              }
            }}
            required
            disabled={!buildingId}
            style={styles.select}
          >
            <option value="">-- Choose Floor --</option>
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.floor_number}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Room Number / Name</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => {
              setRoomNumber(e.target.value);
              if (error) dispatch(clearError());
              if (successMessage) {
                setSuccessMessage("");
                setMessageType("");
              }
            }}
            placeholder="e.g. 101 or Suite A"
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
              : currentRoom
                ? "Update Room"
                : "Save Room"}
          </button>
          {currentRoom && (
            <button
              type="button"
              onClick={() => {
                clearEditing();
                setBuildingId("");
                setFloorId("");
                setRoomNumber("");
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
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1e40af",
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

export default RoomForm;
