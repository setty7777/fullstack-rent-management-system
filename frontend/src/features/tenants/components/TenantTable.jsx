import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeTenant } from "../slices/tenantSlice";
import brandLogo from "../../../SettyRents.png";

export const TenantTable = ({ onEdit, buildings = [], rooms = [] }) => {
  const [filterName, setFilterName] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterStatus, setFilterStatus] = useState("active"); // Default to 'active' (not vacated)
  const [feedback, setFeedback] = useState({ message: "", type: "" }); // "success" or "error"

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tenantState = useSelector((state) => state.tenants);
  const tenants = Array.isArray(tenantState)
    ? tenantState
    : tenantState?.tenants || [];
  const loading = tenantState?.loading || false;

  const showNotification = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 4000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tenant?")) {
      try {
        await dispatch(removeTenant({ id, navigate })).unwrap();
        showNotification("Tenant deleted successfully!", "success");
      } catch (error) {
        showNotification(
          "Failed to delete tenant: " + (error.message || "Unknown error"),
          "error",
        );
      }
    }
  };

  // Robust document extractor handling nested relations, arrays, strings, and missing attributes
  const getDocumentList = (tenant) => {
    const rawDocs =
      tenant.documents ||
      tenant.document ||
      tenant.files ||
      tenant.file ||
      tenant.tenant_documents;

    if (!rawDocs) return [];

    const docArray = Array.isArray(rawDocs) ? rawDocs : [rawDocs];

    return docArray
      .map((doc) => {
        if (!doc) return null;
        if (typeof doc === "string") return doc;
        return doc.url || doc.path || doc.file_path || doc.secure_url || null;
      })
      .filter(Boolean);
  };

  const filteredTenants = tenants.filter((t) => {
    const bId = t.building_id || t.building?.id;
    const rNum = t.room?.room_number || t.room_number;

    // Check vacation status (checking status, is_vacated, or vacated fields safely)
    const isVacated =
      t.is_vacated === true ||
      t.vacated === true ||
      String(t.status).toLowerCase() === "vacated";

    if (filterStatus === "active" && isVacated) return false;
    if (filterStatus === "vacated" && !isVacated) return false;

    return (
      (!filterName || t.name === filterName) &&
      (!filterRoom || String(rNum) === String(filterRoom)) &&
      (!filterBuilding || String(bId) === String(filterBuilding))
    );
  });

  // Professional Real-World Tenant Report Print Styles
  const printStyles = `
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      line-height: 1.4;
    }
    .page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      min-height: 95vh;
      box-sizing: border-box;
      position: relative;
    }
    .invoice-box {
      max-width: 800px;
      margin: auto;
      width: 100%;
      background: #fff;
    }
    /* Header Styling */
    .bill-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 3px solid #0f172a;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .company-details h2 {
      margin: 0;
      color: #0f172a;
      font-size: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .company-details p {
      margin: 3px 0;
      font-size: 11px;
      color: #64748b;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta h3 {
      margin: 0;
      color: #0ea5e9;
      font-size: 16px;
    }
    .invoice-meta p {
      margin: 3px 0;
      font-size: 11px;
      color: #475569;
    }

    /* Tenant Info Summary Grid */
    .info-grid {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 15px;
      margin-bottom: 15px;
      font-size: 12px;
    }
    .info-block div {
      margin-bottom: 4px;
    }
    .info-block strong {
      color: #0f172a;
    }

    /* Main Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
      font-size: 12px;
    }
    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      width: 35%;
    }
    td {
      width: 65%;
      color: #1e293b;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Terms & Conditions Section */
    .terms-section {
      font-size: 10px;
      color: #475569;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
      padding: 12px;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    .terms-section h4 {
      margin: 0 0 6px 0;
      color: #0f172a;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .terms-section ol {
      margin: 0;
      padding-left: 15px;
    }
    .terms-section li {
      margin-bottom: 3px;
    }

    /* Signatures */
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      font-size: 12px;
    }
    .sig-line {
      width: 200px;
      border-top: 1px solid #0f172a;
      text-align: center;
      padding-top: 5px;
      font-weight: 600;
      color: #0f172a;
    }

    /* Full Page Documents */
    .full-page {
      width: 100%;
      height: 100vh;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 20px;
    }
    .doc-container {
      width: 100%;
      height: 90vh;
      border: 2px solid #0f172a;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f8fafc;
      padding: 10px;
      box-sizing: border-box;
    }
    .full-page img, .full-page embed {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .logo { max-width: 110px; margin-bottom: 5px; }
  `;

  const generateTenantHTML = (tenant) => {
    const buildingName = tenant.building?.name || tenant.building_name || "N/A";
    const floorName =
      tenant.floor?.floor_number || tenant.floor_number || "N/A";
    const roomNumber = tenant.room?.room_number || tenant.room_number || "N/A";
    const docUrls = getDocumentList(tenant);

    const filesHtml = docUrls
      .map((fileUrl) => {
        return `
          <div class="full-page">
            <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Verification Document: ${tenant.name}</h3>
            <div class="doc-container">
              ${
                fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)
                  ? `<img src="${fileUrl}" alt="Tenant Document" />`
                  : `<embed src="${fileUrl}" type="application/pdf" width="100%" height="100%" />`
              }
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="page">
        <div class="invoice-box">
          <!-- Header -->
          <div class="bill-header">
            <div class="company-details">
              <img src="${brandLogo}" class="logo" />
              <h2>Setty Rents Property Management</h2>
              <p>Official Tenant Verification & Lease Record</p>
            </div>
            <div class="invoice-meta">
              <h3>TENANT PROFILE STATEMENT</h3>
              <p><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <!-- Scope Grid -->
          <div class="info-grid">
            <div class="info-block">
              <div><strong>Building Assigned:</strong> ${buildingName}</div>
              <div><strong>Floor Level:</strong> ${floorName}</div>
            </div>
            <div class="info-block">
              <div><strong>Room Number:</strong> ${roomNumber}</div>
              <div><strong>Status:</strong> Active / Verified</div>
            </div>
          </div>

          <!-- Tenant Details Table -->
          <table>
            <thead>
              <tr>
                <th colspan="2">Primary Tenant Information</th>
              </tr>
            </thead>
            <tbody>
              <tr><th>Full Name</th><td><strong>${tenant.name || "N/A"}</strong></td></tr>
              <tr><th>Contact Number</th><td>${tenant.phone || "N/A"}</td></tr>
              <tr><th>Building Name</th><td>${buildingName}</td></tr>
              <tr><th>Floor Number</th><td>${floorName}</td></tr>
              <tr><th>Room Number</th><td>${roomNumber}</td></tr>
              <tr><th>Security Advance</th><td>₹ ${Number(tenant.advance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
              <tr><th>Joining Date</th><td>${tenant.join_date || "N/A"}</td></tr>
              <tr><th>Attached Documents</th><td>${docUrls.length > 0 ? `${docUrls.length} file(s) attached (see following pages)` : "No documents attached"}</td></tr>
            </tbody>
          </table>

          <!-- Terms & Conditions Section -->
          <div class="terms-section">
            <h4>Mandatory Property Rules & Regulations</h4>
            <ol>
              <li><strong>Strictly Families Only:</strong> Only family members are allowed to reside. Bachelors are strictly prohibited.</li>
              <li><strong>Notice Period:</strong> Tenants wishing to vacate must provide a mandatory written notice at least <strong>1 month prior</strong>.</li>
              <li><strong>Code of Conduct:</strong> Management reserves the right to request immediate vacation of the premises if behavior towards owners or fellow residents is unsatisfactory or disruptive.</li>
              <li><strong>Cleanliness & Sanitation:</strong> Tenants must strictly avoid throwing any garbage or waste outside the house or in common/nearby areas. Designated trash disposal rules must be followed.</li>
              <li><strong>Occupancy Limits:</strong> Accommodation is strictly restricted to families consisting of 2–4 members (Husband, Wife, and up to 2 children). Any visiting family members staying over must be reported and are subject to additional charges specified by the owner.</li>
            </ol>
          </div>

          <!-- Signatures -->
          <div class="signatures">
            <div class="sig-line">Tenant Acknowledgment</div>
            <div class="sig-line">Authorized Owner / Manager</div>
          </div>
        </div>
      </div>
      ${filesHtml}
    `;
  };

  const printAllTenants = () => {
    if (!filterBuilding) {
      alert(
        "Please select a Building filter to print professional tenant reports.",
      );
      return;
    }
    if (!filteredTenants || !filteredTenants.length) {
      alert("No tenants found to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked! Please allow popups for this website.");
      return;
    }

    const content = filteredTenants.map(generateTenantHTML).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tenant Profile Report - SettyRents</title>
          <style>${printStyles}</style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div style={styles.stateContainer}>
        <p style={styles.stateText}>Loading tenants...</p>
      </div>
    );
  }

  return (
    <div>
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-tenant-wrapper { display: none !important; }
            .mobile-tenant-list { display: flex !important; }
          }
          @media (min-width: 769px) {
            .desktop-tenant-wrapper { display: block !important; }
            .mobile-tenant-list { display: none !important; }
          }
        `}
      </style>

      {/* Feedback Notification Banner */}
      {feedback.message && (
        <div
          style={
            feedback.type === "error" ? styles.errorBox : styles.pinkSuccessBox
          }
        >
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={styles.filterCard}>
        <h3 style={styles.filterTitle}>Filter Tenants</h3>
        <div style={styles.filterGrid}>
          {/* Status Filter (Vacated / Not Vacated) defaulting to Active */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="active">Not Vacated Tenants</option>
            <option value="vacated">Vacated Tenants</option>
            <option value="all">All Tenants</option>
          </select>

          <select
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={styles.select}
          >
            <option value="">All Tenants</option>
            {[...new Set(tenants.map((t) => t.name))].map((name, i) => (
              <option key={i} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            style={styles.select}
          >
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.roomNumber || r.room_number}>
                {r.roomNumber || r.room_number}
              </option>
            ))}
          </select>

          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            style={styles.select}
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button onClick={printAllTenants} style={styles.printBtn}>
            Print Filtered
          </button>
        </div>
      </div>

      {filteredTenants.length === 0 ? (
        <div style={styles.stateContainer}>
          <p style={styles.stateText}>
            No tenants match your selection criteria.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-tenant-wrapper" style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Building</th>
                  <th style={styles.th}>Floor</th>
                  <th style={styles.th}>Room</th>
                  <th style={styles.th}>Advance</th>
                  <th style={styles.th}>Joining</th>
                  <th style={styles.th}>Document</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((t) => {
                  const docUrls = getDocumentList(t);

                  const roomNumber =
                    t.room?.room_number || t.room_number || "N/A";
                  return (
                    <tr key={t.id} style={styles.tr}>
                      <td style={styles.tdBold}>{t.name}</td>
                      <td style={styles.td}>{t.phone}</td>
                      <td style={styles.td}>
                        {t.building?.name || t.building_name || "N/A"}
                      </td>
                      <td style={styles.td}>
                        {t.floor?.floor_number || t.floor_number || "N/A"}
                      </td>
                      <td style={styles.td}>{roomNumber}</td>
                      <td style={styles.td}>{t.advance}</td>
                      <td style={styles.td}>{t.join_date}</td>
                      <td style={styles.td}>
                        {docUrls.length > 0
                          ? docUrls.map((fileUrl, i) => (
                              <a
                                key={i}
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={styles.docLink}
                              >
                                View{i > 0 ? `, ${i + 1}` : ""}
                              </a>
                            ))
                          : "No Docs"}
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => onEdit(t)}
                            style={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            style={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-tenant-list" style={styles.mobileList}>
            {filteredTenants.map((t) => {
              const docUrls = getDocumentList(t);
              return (
                <div key={t.id} style={styles.mobileCard}>
                  <div style={styles.mobileHeader}>
                    <div>
                      <h4 style={styles.mobileTitle}>{t.name}</h4>
                      <p style={styles.mobileSubtitle}>{t.phone}</p>
                    </div>
                    <span style={styles.badge}>
                      {t.room?.room_number || t.room_number || "N/A"}
                    </span>
                  </div>
                  <div style={styles.mobileGrid}>
                    <div style={styles.mobileField}>
                      <span style={styles.mobileLabel}>Building:</span>
                      <strong style={styles.mobileValue}>
                        {t.building?.name || t.building_name || "-"}
                      </strong>
                    </div>
                    <div style={styles.mobileField}>
                      <span style={styles.mobileLabel}>Floor:</span>
                      <strong style={styles.mobileValue}>
                        {t.floor?.floor_number || t.floor_number || "N/A"}
                      </strong>
                    </div>
                    <div style={styles.mobileField}>
                      <span style={styles.mobileLabel}>Advance:</span>
                      <strong style={styles.mobileValue}>{t.advance}</strong>
                    </div>
                    <div style={styles.mobileField}>
                      <span style={styles.mobileLabel}>Joining:</span>
                      <strong style={styles.mobileValue}>{t.join_date}</strong>
                    </div>
                    <div style={styles.mobileField}>
                      <span style={styles.mobileLabel}>Docs:</span>
                      <strong style={styles.mobileValue}>
                        {docUrls.length > 0
                          ? docUrls.map((fileUrl, i) => (
                              <a
                                key={i}
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={styles.docLink}
                              >
                                View
                              </a>
                            ))
                          : "No Docs"}
                      </strong>
                    </div>
                  </div>
                  <div style={styles.mobileActions}>
                    <button onClick={() => onEdit(t)} style={styles.editBtn}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  notificationBanner: {
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid",
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
  filterCard: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  filterTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "12px",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
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
  },
  printBtn: {
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#0ea5e9",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
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
  docLink: {
    color: "#2563eb",
    textDecoration: "underline",
    marginRight: "6px",
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
    gap: "10px",
  },
  mobileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "8px",
  },
  mobileTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
  },
  mobileSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: "2px 0 0 0",
  },
  badge: {
    backgroundColor: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
  },
  mobileGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  mobileField: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
  },
  mobileLabel: {
    color: "#64748b",
  },
  mobileValue: {
    color: "#334155",
  },
  mobileActions: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
    marginTop: "6px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "10px",
  },
};

export default TenantTable;
