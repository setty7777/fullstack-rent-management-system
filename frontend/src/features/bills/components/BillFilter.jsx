import React from "react";

const BillFilter = ({
  filters = {},
  onChange = () => {},
  buildingOptions = [],
  roomOptions = [],
  monthOptions = [],
  yearOptions = [],
  onPrint = () => {},
}) => {
  return (
    <div style={styles.filterContainer}>
      <div style={styles.filterGroup}>
        <label style={styles.label}>Building</label>
        <select
          name="filterBuilding"
          value={filters.filterBuilding || ""}
          onChange={onChange}
          style={styles.select}
        >
          <option value="">All Buildings</option>
          {Array.isArray(buildingOptions) &&
            buildingOptions.map((building, index) => (
              <option key={index} value={building}>
                {building}
              </option>
            ))}
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>Room</label>
        <select
          name="filterRoom"
          value={filters.filterRoom || ""}
          onChange={onChange}
          style={styles.select}
        >
          <option value="">All Rooms</option>
          {Array.isArray(roomOptions) &&
            roomOptions.map((room, index) => (
              <option key={index} value={room}>
                {room}
              </option>
            ))}
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>Month</label>
        <select
          name="filterMonth"
          value={filters.filterMonth || ""}
          onChange={onChange}
          style={styles.select}
        >
          <option value="">All Months</option>
          {Array.isArray(monthOptions) &&
            monthOptions.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>Year</label>
        <select
          name="filterYear"
          value={filters.filterYear || ""}
          onChange={onChange}
          style={styles.select}
        >
          <option value="">All Years</option>
          {Array.isArray(yearOptions) &&
            yearOptions.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
        </select>
      </div>

      <div style={styles.buttonGroup}>
        <button onClick={onPrint} style={styles.printBtn}>
          Print Report
        </button>
      </div>
    </div>
  );
};

const styles = {
  filterContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    alignItems: "flex-end",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "24px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1",
    minWidth: "140px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
  },
  select: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    outline: "none",
  },
  buttonGroup: {
    display: "flex",
    alignItems: "flex-end",
  },
  printBtn: {
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "#0ea5e9",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    height: "41px",
  },
};

export default BillFilter;
