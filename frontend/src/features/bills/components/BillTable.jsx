import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeBill } from "../slices/billSlice";

const BillTable = ({ records, onEdit }) => {
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeleteError, setIsDeleteError] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.bills || {});

  // Automatically vanish the delete alert message after 4 seconds
  useEffect(() => {
    if (!deleteMessage) return;

    const timer = setTimeout(() => {
      setDeleteMessage("");
      setIsDeleteError(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [deleteMessage]);

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this electricity bill?")
    ) {
      setDeleteMessage("");
      setIsDeleteError(false);

      dispatch(removeBill({ id, navigate })).then((res) => {
        // Helper to guarantee we return a safe primitive string, never an object/array
        const parseMessage = (payload, err, defaultMsg) => {
          if (typeof payload === "string" && payload.trim() !== "")
            return payload;
          if (payload && typeof payload === "object") {
            if (typeof payload.message === "string") return payload.message;
            if (payload.data && typeof payload.data.message === "string")
              return payload.data.message;
          }
          if (err && typeof err.message === "string") return err.message;
          return defaultMsg;
        };

        if (res.error) {
          const errMsg = parseMessage(
            res.payload,
            res.error,
            "Failed to delete bill entry.",
          );
          setDeleteMessage(errMsg);
          setIsDeleteError(true);
        } else {
          const successMsg = parseMessage(
            res.payload,
            null,
            "Electricity bill deleted successfully.",
          );
          setDeleteMessage(successMsg);
          setIsDeleteError(false);
        }
      });
    }
  };

  const hasRecords = Array.isArray(records) && records.length > 0;

  if (loading && !hasRecords) {
    return (
      <div style={styles.container}>
        <div style={styles.stateContainer}>
          <p style={styles.stateText}>Loading electricity bills...</p>
        </div>
      </div>
    );
  }

  if (!hasRecords) {
    return (
      <div style={styles.container}>
        {deleteMessage && (
          <div style={isDeleteError ? styles.errorBox : styles.pinkSuccessBox}>
            <span>{deleteMessage}</span>
          </div>
        )}
        <div style={styles.stateContainer}>
          <p style={styles.stateText}>
            No electricity bill entries found. Add your first entry above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Delete Status Alert Box */}
      {deleteMessage && (
        <div style={isDeleteError ? styles.errorBox : styles.pinkSuccessBox}>
          <span>{deleteMessage}</span>
        </div>
      )}

      <style>
        {`
          @media (max-width: 768px) {
            .desktop-table-wrapper { display: none !important; }
            .mobile-card-list { display: flex !important; }
          }
          @media (min-width: 769px) {
            .desktop-table-wrapper { display: block !important; }
            .mobile-card-list { display: none !important; }
          }
        `}
      </style>

      {/* Desktop Table View */}
      <div className="desktop-table-wrapper" style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Tenant</th>
              <th style={styles.th}>Room</th>
              <th style={styles.th}>Floor</th>
              <th style={styles.th}>Building</th>
              <th style={styles.th}>Units</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Month</th>
              <th style={styles.th}>Year</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.tdBold}>{item.tenant?.name || "N/A"}</td>
                <td style={styles.td}>
                  {item.tenant?.room?.room_number || "N/A"}
                </td>
                <td style={styles.td}>
                  {item.tenant?.floor?.floor_number || "N/A"}
                </td>
                <td style={styles.td}>
                  {item.tenant?.building?.name || "N/A"}
                </td>
                <td style={styles.td}>{item.units}</td>
                <td style={styles.td}>₹ {item.amount}</td>
                <td style={styles.td}>{item.month}</td>
                <td style={styles.td}>{item.year}</td>
                <td style={{ ...styles.td, textAlign: "right" }}>
                  <div style={styles.actionButtons}>
                    <button onClick={() => onEdit(item)} style={styles.editBtn}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-card-list" style={styles.mobileList}>
        {records.map((item) => (
          <div key={item.id} style={styles.mobileCard}>
            <div style={styles.mobileField}>
              <span style={styles.mobileLabel}>Tenant:</span>
              <span style={styles.mobileValueBold}>
                {item.tenant?.name || "N/A"}
              </span>
            </div>
            <div style={styles.mobileField}>
              <span style={styles.mobileLabel}>Room:</span>
              <span style={styles.mobileValue}>
                {item.tenant?.room?.room_number || "N/A"}
              </span>
            </div>
            <div style={styles.mobileField}>
              <span style={styles.mobileLabel}>Floor:</span>
              <span style={styles.mobileValue}>
                {item.tenant?.floor?.floor_number || "N/A"}
              </span>
            </div>
            <div style={styles.mobileField}>
              <span style={styles.mobileLabel}>Building:</span>
              <span style={styles.mobileValue}>
                {item.tenant?.building?.name || "N/A"}
              </span>
            </div>
            <div style={styles.mobileField}>
              <span style={styles.mobileLabel}>Units:</span>
              <span style={styles.mobileValue}>{item.units}</span>
            </div>
            <div style={styles.mobileField}>
              <span style={styles.mobileLabel}>Amount:</span>
              <span style={styles.mobileValue}>₹ {item.amount}</span>
            </div>
            <div style={styles.mobileField}>
              <span style={styles.mobileLabel}>Month:</span>
              <span style={styles.mobileValue}>{item.month}</span>
            </div>
            <div style={styles.mobileField}>
              <span style={styles.mobileLabel}>Year:</span>
              <span style={styles.mobileValue}>{item.year}</span>
            </div>
            <div style={styles.mobileActions}>
              <button onClick={() => onEdit(item)} style={styles.editBtn}>
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                style={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
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
  pinkSuccessBox: {
    padding: "10px 14px",
    marginBottom: "16px",
    backgroundColor: "#fdf2f8",
    border: "1px solid #fbcfe8",
    color: "#9d174d",
    fontSize: "13px",
    borderRadius: "8px",
    textAlign: "center",
  },
  stateContainer: {
    padding: "40px",
    textAlign: "center",
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  stateText: {
    fontSize: "14px",
    color: "#64748b",
  },
  tableWrapper: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflowX: "auto",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHeaderRow: {
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  th: {
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#334155",
  },
  tdBold: {
    padding: "14px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
  },
  editBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#0f172a",
    backgroundColor: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
  },
  mobileList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  mobileCard: {
    background: "#ffffff",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  mobileField: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mobileLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },
  mobileValue: {
    fontSize: "14px",
    color: "#334155",
  },
  mobileValueBold: {
    fontSize: "14px",
    color: "#0f172a",
    fontWeight: "600",
  },
  mobileActions: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
    marginTop: "8px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "10px",
  },
};

export default BillTable;
