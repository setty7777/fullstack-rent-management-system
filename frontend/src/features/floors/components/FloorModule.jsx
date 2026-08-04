import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FloorForm from "./FloorForm";
import FloorTable from "./FloorTable";
import { getFloors } from "../slices/floorSlice";
import { getBuildings } from "../../buildings/slices/buildingSlice";

const FloorModule = () => {
  const [currentFloor, setCurrentFloor] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Robust extraction avoiding undefined slice objects
  const floorsState = useSelector((state) => state.floors);
  const floors = Array.isArray(floorsState)
    ? floorsState
    : floorsState?.floors || [];

  const buildingsState = useSelector((state) => state.buildings);
  const buildings = Array.isArray(buildingsState)
    ? buildingsState
    : buildingsState?.buildings || [];

  useEffect(() => {
    dispatch(getFloors(navigate));
    dispatch(getBuildings(navigate));
  }, [dispatch, navigate]);

  // Calculate slice indices for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFloors = floors.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(floors.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={styles.pageTitle}>Floors Management</h1>
        <p style={styles.pageSubtitle}>Manage and organize building floors.</p>
      </div>

      <FloorForm
        currentFloor={currentFloor}
        clearEditing={() => setCurrentFloor(null)}
        buildings={buildings}
      />

      <FloorTable
        floors={currentFloors}
        onEdit={(floor) => setCurrentFloor(floor)}
      />

      {totalPages > 1 && (
        <div style={styles.paginationContainer}>
          <button
            style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span style={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            style={{
              ...styles.pageBtn,
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  headerSection: {
    marginBottom: "24px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#64748b",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "24px",
  },
  pageBtn: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#0f172a",
  },
  pageIndicator: {
    fontSize: "14px",
    color: "#475569",
    fontWeight: "500",
  },
};

export default FloorModule;
