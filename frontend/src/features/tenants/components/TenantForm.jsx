import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createTenant, updateTenant, clearError } from "../slices/tenantSlice";
import { apiRequest } from "../../../utils/api";

export const TenantForm = ({ currentTenant, clearEditing, buildings }) => {
  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [advance, setAdvance] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [files, setFiles] = useState([]);

  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Unified alert state replacing browser popups (alert)
  const [alertInfo, setAlertInfo] = useState({ message: "", type: "" });

  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading, error } = useSelector((state) => state.tenants || {});

  // Automatically vanish the alert message after 4 seconds
  useEffect(() => {
    if (!alertInfo.message) return;
    const timer = setTimeout(() => {
      setAlertInfo({ message: "", type: "" });
    }, 4000);
    return () => clearTimeout(timer);
  }, [alertInfo.message]);

  // Fetch floors dynamically whenever buildingId changes with safety guard
  useEffect(() => {
    if (!buildingId || buildingId === "") {
      setFloors([]);
      setFloorId("");
      setRooms([]);
      setRoomId("");
      return;
    }

    const fetchFloorsForBuilding = async () => {
      try {
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
      } catch (err) {
        console.error("Failed to fetch floors", err);
        setFloors([]);
      }
    };

    fetchFloorsForBuilding();
  }, [buildingId, navigate]);

  // Fetch all rooms and filter them client-side by selected floorId
  useEffect(() => {
    if (!floorId) {
      setRooms([]);
      setRoomId("");
      return;
    }

    const fetchRooms = async () => {
      try {
        const data = await apiRequest({
          endpoint: `/rooms`,
          method: "GET",
          navigate,
        });
        if (data && data.success) {
          const matchedRooms = (data.data || []).filter(
            (r) => String(r.floor_id) === String(floorId),
          );
          setRooms(matchedRooms);
        } else {
          setRooms([]);
        }
      } catch (err) {
        console.error("Failed to fetch rooms", err);
        setRooms([]);
      }
    };

    fetchRooms();
  }, [floorId, navigate]);

  // Pre-load dependent dropdown options safely when editing
  useEffect(() => {
    let isMounted = true;

    const loadEditingData = async () => {
      if (currentTenant) {
        setName(currentTenant.name || "");
        setPhone(currentTenant.phone || "");
        setAdvance(currentTenant.advance || "");
        setJoiningDate(currentTenant.join_date || "");

        const bId = currentTenant.building_id
          ? currentTenant.building_id.toString()
          : "";
        const fId = currentTenant.floor_id
          ? currentTenant.floor_id.toString()
          : "";
        const rId = currentTenant.room_id
          ? currentTenant.room_id.toString()
          : "";

        if (bId) {
          try {
            const floorData = await apiRequest({
              endpoint: `/floors/building/${bId}`,
              method: "GET",
              navigate,
            });
            if (isMounted && floorData && floorData.success) {
              setFloors(floorData.data || []);
            }
          } catch (err) {
            console.error("Error loading floors for edit", err);
          }
        }

        if (fId) {
          try {
            const roomData = await apiRequest({
              endpoint: `/rooms`,
              method: "GET",
              navigate,
            });
            if (isMounted && roomData && roomData.success) {
              const matchedRooms = (roomData.data || []).filter(
                (r) => String(r.floor_id) === String(fId),
              );
              setRooms(matchedRooms);
            }
          } catch (err) {
            console.error("Error loading rooms for edit", err);
          }
        }

        if (isMounted) {
          setBuildingId(bId);
          setFloorId(fId);
          setRoomId(rId);
          setFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      } else {
        if (isMounted) resetFormState();
      }
      if (isMounted) dispatch(clearError());
    };

    loadEditingData();

    return () => {
      isMounted = false;
    };
  }, [currentTenant, dispatch, navigate]);

  const resetFormState = () => {
    setName("");
    setPhone("");
    setAdvance("");
    setJoiningDate("");
    setBuildingId("");
    setFloorId("");
    setRoomId("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((f) => {
      if (
        !["image/png", "image/jpeg", "image/jpg", "application/pdf"].includes(
          f.type,
        )
      ) {
        setAlertInfo({
          message: `Invalid file type: ${f.name}`,
          type: "error",
        });
        return false;
      }
      return true;
    });
    setFiles(validFiles);
  };

  const validate = () => {
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setAlertInfo({
        message: "Tenant name must contain only letters and spaces",
        type: "error",
      });
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      setAlertInfo({
        message: "Phone number must contain exactly 10 digits",
        type: "error",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (
      !buildingId ||
      !floorId ||
      !roomId ||
      !name ||
      !phone ||
      !advance ||
      !joiningDate
    ) {
      setAlertInfo({ message: "Please fill all fields", type: "error" });
      return;
    }

    dispatch(clearError());
    setAlertInfo({ message: "", type: "" });

    // Find the selected names from current state lists for instant UI rendering
    const selectedBuilding = buildings.find(
      (b) => String(b.id) === String(buildingId),
    );
    const selectedFloor = floors.find((f) => String(f.id) === String(floorId));
    const selectedRoom = rooms.find((r) => String(r.id) === String(roomId));

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("advance", advance);
    formData.append("join_date", joiningDate);
    formData.append("building_id", Number(buildingId));
    formData.append("floor_id", Number(floorId));
    formData.append("room_id", Number(roomId));

    // Explicitly append each file with key "documents"
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("documents", file);
      });
    }

    if (currentTenant) {
      dispatch(
        updateTenant({
          id: currentTenant.id,
          formData,
          navigate,
        }),
      ).then((res) => {
        console.log("Update Tenant Response:", res);
        if (!res.error) {
          // Manually ensure response data contains the text objects if backend omits them
          if (res.payload && typeof res.payload === "object") {
            res.payload.building = res.payload.building || {
              name: selectedBuilding?.name || "",
            };
            res.payload.floor = res.payload.floor || {
              floor_number: selectedFloor?.floor_number || "",
            };
            res.payload.room = res.payload.room || {
              room_number: selectedRoom?.room_number || "",
            };
          }

          setAlertInfo({
            message: "Tenant updated successfully.",
            type: "update",
          });
          clearEditing();
          resetFormState();
        }
      });
    } else {
      dispatch(
        createTenant({
          formData,
          navigate,
        }),
      ).then((res) => {
        if (!res.error) {
          if (res.payload && typeof res.payload === "object") {
            res.payload.building = res.payload.building || {
              name: selectedBuilding?.name || "",
            };
            res.payload.floor = res.payload.floor || {
              floor_number: selectedFloor?.floor_number || "",
            };
            res.payload.room = res.payload.room || {
              room_number: selectedRoom?.room_number || "",
            };
          }

          setAlertInfo({
            message: "Tenant added successfully.",
            type: "success",
          });
          resetFormState();
        }
      });
    }
  };

  const getAlertBoxStyle = () => {
    if (alertInfo.type === "update") return styles.updateBox;
    if (alertInfo.type === "error") return styles.errorBox;
    return styles.successBox;
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.formTitle}>
        {currentTenant ? "Update Tenant" : "Add New Tenant"}
      </h3>

      {error && (
        <div style={styles.errorBox}>
          {typeof error === "string" ? error : error.message}
        </div>
      )}
      {alertInfo.message && (
        <div style={getAlertBoxStyle()}>{alertInfo.message}</div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Select Building</label>
          <select
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setFloorId("");
              setRoomId("");
              if (error) dispatch(clearError());
              if (alertInfo.message) setAlertInfo({ message: "", type: "" });
            }}
            required
            style={styles.select}
          >
            <option value="">-- Choose Building --</option>
            {buildings &&
              buildings.map((b) => (
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
              setRoomId("");
              if (error) dispatch(clearError());
              if (alertInfo.message) setAlertInfo({ message: "", type: "" });
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
          <label style={styles.label}>Select Room</label>
          <select
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              if (error) dispatch(clearError());
              if (alertInfo.message) setAlertInfo({ message: "", type: "" });
            }}
            required
            disabled={!floorId}
            style={styles.select}
          >
            <option value="">-- Choose Room --</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_number}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Tenant Name</label>
          <input
            type="text"
            placeholder="Tenant Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) dispatch(clearError());
              if (alertInfo.message) setAlertInfo({ message: "", type: "" });
            }}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone (10 digits)</label>
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) dispatch(clearError());
              if (alertInfo.message) setAlertInfo({ message: "", type: "" });
            }}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Advance Amount</label>
          <input
            type="number"
            placeholder="Advance"
            value={advance}
            onChange={(e) => {
              setAdvance(e.target.value);
              if (error) dispatch(clearError());
              if (alertInfo.message) setAlertInfo({ message: "", type: "" });
            }}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Joining Date</label>
          <input
            type="date"
            value={joiningDate}
            onChange={(e) => {
              setJoiningDate(e.target.value);
              if (error) dispatch(clearError());
              if (alertInfo.message) setAlertInfo({ message: "", type: "" });
            }}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Documents (PDF/Images)</label>
          <input
            type="file"
            name="documents"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={styles.fileInput}
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
              : currentTenant
                ? "Update Tenant"
                : "Save Tenant"}
          </button>
          {currentTenant && (
            <button
              type="button"
              onClick={() => {
                clearEditing();
                resetFormState();
                dispatch(clearError());
                setAlertInfo({ message: "", type: "" });
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
  fileInput: {
    fontSize: "13px",
    color: "#475569",
    padding: "6px 0",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    gridColumn: "1 / -1",
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

export default TenantForm;
