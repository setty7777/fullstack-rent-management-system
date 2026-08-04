import React from "react";

const RentFilter = ({
  filters,
  onChange,
  buildingOptions,
  roomOptions,
  monthOptions,
  yearOptions,
  onPrint,
}) => {
  return (
    <div style={styles.filterCard}>
      <h3 style={styles.filterTitle}>Filter Rent Entries</h3>
      <div style={styles.filterGrid}>
        <select
          name="filterBuilding"
          value={filters.filterBuilding}
          onChange={onChange}
          style={styles.select}
        >
          <option value="">All Buildings</option>
          {buildingOptions.map((b, i) => (
            <option key={i} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          name="filterRoom"
          value={filters.filterRoom}
          onChange={onChange}
          style={styles.select}
        >
          <option value="">All Rooms</option>
          {roomOptions.map((r, i) => (
            <option key={i} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          name="filterMonth"
          value={filters.filterMonth}
          onChange={onChange}
          style={styles.select}
        >
          <option value="">All Months</option>
          {monthOptions.map((m, i) => (
            <option key={i} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          name="filterYear"
          value={filters.filterYear}
          onChange={onChange}
          style={styles.select}
        >
          <option value="">All Years</option>
          {yearOptions.map((y, i) => (
            <option key={i} value={y}>
              {y}
            </option>
          ))}
        </select>

        <button onClick={onPrint} style={styles.printBtn}>
          Print Filtered Report
        </button>
      </div>
    </div>
  );
};

const styles = {
  filterCard: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "24px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
  },
  filterTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "16px",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    alignItems: "center",
  },
  select: {
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    width: "100%",
  },
  printBtn: {
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#0ea5e9",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

export default RentFilter;
