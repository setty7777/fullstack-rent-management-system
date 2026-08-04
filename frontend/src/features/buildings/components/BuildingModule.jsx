import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BuildingForm from "./BuildingForm";
import BuildingTable from "./BuildingTable";
import { getBuildings } from "../slices/buildingSlice";

const BuildingModule = () => {
  const [currentBuilding, setCurrentBuilding] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Change this to how many buildings you want per page

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get buildings list from Redux store (adjust selector path if needed based on your slice)
  const { buildings } = useSelector(
    (state) => state.buildings || { buildings: [] },
  );

  useEffect(() => {
    dispatch(getBuildings(navigate));
  }, [dispatch, navigate]);

  // Calculate slice indices for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBuildings = Array.isArray(buildings)
    ? buildings.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  const totalPages = Math.ceil((buildings?.length || 0) / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={styles.pageTitle}>Buildings Management</h1>
        <p style={styles.pageSubtitle}>
          Manage your real estate properties and locations.
        </p>
      </div>

      <BuildingForm
        currentBuilding={currentBuilding}
        clearEditing={() => setCurrentBuilding(null)}
      />

      {/* Pass the paginated subset of buildings to your table */}
      <BuildingTable
        buildings={currentBuildings}
        onEdit={(building) => setCurrentBuilding(building)}
      />

      {/* Pagination Controls */}
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

export default BuildingModule;
