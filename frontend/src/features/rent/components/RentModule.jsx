import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RentForm from "./RentForm";
import RentFilter from "./RentFilter";
import RentTable from "./RentTable";
import { getRentEntries } from "../slices/rentSlice";
import { getTenants } from "../../tenants/slices/tenantSlice";
import { getBuildings } from "../../buildings/slices/buildingSlice";
import { getRooms } from "../../rooms/slices/roomSlice";
import brandLogo from "../../../SettyRents.png";
const RentModule = () => {
  const [currentEntry, setCurrentEntry] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({
    filterBuilding: "",
    filterRoom: "",
    filterMonth: "",
    filterYear: "",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract states and loading flags from Redux
  const rentState = useSelector((state) => state.rent || {});
  const entries = Array.isArray(rentState)
    ? rentState
    : rentState?.entries || [];
  const rentLoading = rentState?.loading || false;

  const tenantState = useSelector((state) => state.tenants || {});
  const tenants = Array.isArray(tenantState)
    ? tenantState
    : tenantState?.tenants || [];

  const buildingState = useSelector((state) => state.buildings || {});
  const buildings = Array.isArray(buildingState)
    ? buildingState
    : buildingState?.buildings || [];

  const roomState = useSelector((state) => state.rooms || {});
  const rooms = Array.isArray(roomState) ? roomState : roomState?.rooms || [];

  useEffect(() => {
    dispatch(getRentEntries(navigate));
    dispatch(getTenants(navigate));
    dispatch(getBuildings(navigate));
    dispatch(getRooms(navigate));
  }, [dispatch, navigate]);

  // Format entries for table display
  const formattedEntries = entries.map((e) => ({
    ...e,
    building: e.building || e.tenant?.building?.name || "N/A",
    room:
      e.room || e.tenant?.room_number || e.tenant?.room?.room_number || "N/A",
  }));

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Extract unique options dynamically
  const buildingOptions = [...new Set(buildings.map((b) => b.name || b))];
  const roomOptions = [
    ...new Set(
      rooms
        .map((r) => r.room_number || r.roomNo || r.name || r)
        .filter(Boolean),
    ),
  ];
  const monthOptions = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  const yearOptions = [
    ...new Set(entries.map((e) => e.month?.split("-")[0]).filter(Boolean)),
  ];

  // Filter the formatted entries based on selected options
  const filteredEntries = formattedEntries.filter((e) => {
    const [entryYear, entryMonth] = e.month ? e.month.split("-") : ["", ""];

    const matchesBuilding = filters.filterBuilding
      ? e.building === filters.filterBuilding
      : true;
    const matchesRoom = filters.filterRoom
      ? String(e.room) === String(filters.filterRoom)
      : true;
    const matchesMonth = filters.filterMonth
      ? entryMonth === filters.filterMonth
      : true;
    const matchesYear = filters.filterYear
      ? entryYear === filters.filterYear
      : true;

    return matchesBuilding && matchesRoom && matchesMonth && matchesYear;
  });

  // Print Report Handler
  const handlePrintReport = () => {
    if (!filters.filterBuilding || !filters.filterYear) {
      alert(
        "Please select at least a Building and a Year to print the professional report.",
      );
      return;
    }

    const printWindow = window.open("", "_blank");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Rent Collection Statement - ${filters.filterBuilding} (${filters.filterYear})</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #333333;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              line-height: 1.4;
            }
            .invoice-box {
              max-width: 800px;
              margin: auto;
              padding: 10px;
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
              font-size: 22px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .company-details p {
              margin: 3px 0;
              font-size: 12px;
              color: #64748b;
            }
            .invoice-meta {
              text-align: right;
            }
            .invoice-meta h3 {
              margin: 0;
              color: #0ea5e9;
              font-size: 18px;
            }
            .invoice-meta p {
              margin: 3px 0;
              font-size: 12px;
              color: #475569;
            }

            /* Consumer & Filter Summary Grid */
            .info-grid {
              display: flex;
              justify-content: space-between;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 12px 15px;
              margin-bottom: 20px;
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
              margin-bottom: 25px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 10px 12px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #0f172a;
              color: #ffffff;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .text-right {
              text-align: right;
            }

            /* Summary Totals Box */
            .totals-container {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 30px;
            }
            .totals-box {
              width: 320px;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              background: #f8fafc;
              padding: 10px 15px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 13px;
              border-bottom: 1px dashed #e2e8f0;
            }
            .totals-row:last-child {
              border-bottom: none;
              font-weight: bold;
              color: #0f172a;
              font-size: 14px;
              padding-top: 8px;
            }

            /* Terms & Signatures */
            .terms-section {
              font-size: 11px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              margin-bottom: 40px;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
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
            .logo { max-width: 110px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <!-- Header -->
            <div class="bill-header">
              <div class="company-details">
                <img src="${brandLogo}" class="logo" />
                <h2>Setty Rents Financial Services</h2>
                <p>Commercial & Residential Property Management</p>
              </div>
              <div class="invoice-meta">
                <h3>RENT COLLECTION STATEMENT</h3>
                <p><strong>Statement Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Billing Cycle:</strong> Month ${filters.filterMonth || "All"}, Year ${filters.filterYear}</p>
              </div>
            </div>

            <!-- Scope Grid -->
            <div class="info-grid">
              <div class="info-block">
                <div><strong>Building Scope:</strong> ${filters.filterBuilding}</div>
                <div><strong>Room Filter:</strong> ${filters.filterRoom || "All Rooms Managed"}</div>
              </div>
              <div class="info-block">
                <div><strong>Total Tenants Listed:</strong> ${filteredEntries.length}</div>
                <div><strong>Currency:</strong> Indian Rupee (INR)</div>
              </div>
            </div>

            <!-- Statement Table -->
            <table>
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Room</th>
                  <th>Month</th>
                  <th class="text-right">Total (₹)</th>
                  <th class="text-right">Paid (₹)</th>
                  <th class="text-right">Due (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${
                  filteredEntries.length > 0
                    ? filteredEntries
                        .map(
                          (e) => `
                  <tr>
                    <td><strong>${e.tenant?.name || "N/A"}</strong></td>
                    <td>${e.room}</td>
                    <td>${e.month}</td>
                    <td class="text-right">${Number(e.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td class="text-right" style="color: #16a34a;">${Number(e.paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td class="text-right" style="color: ${Number(e.due || 0) > 0 ? "#dc2626" : "#16a34a"}; font-weight: 600;">
                      ${Number(e.due || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td><strong style="text-transform: uppercase; font-size: 11px;">${e.status || "N/A"}</strong></td>
                  </tr>
                `,
                        )
                        .join("")
                    : `
                  <tr>
                    <td colspan="7" style="text-align: center; color: #64748b; padding: 20px;">No rent records found for the selected criteria.</td>
                  </tr>
                `
                }
              </tbody>
            </table>

            <!-- Summary Totals Calculation Box -->
            <div class="totals-container">
              <div class="totals-box">
                <div class="totals-row">
                  <span>Gross Total Rent:</span>
                  <span><strong>₹ ${filteredEntries.reduce((sum, item) => sum + Number(item.total || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                </div>
                <div class="totals-row">
                  <span>Total Amount Paid:</span>
                  <span style="color: #16a34a;"><strong>₹ ${filteredEntries.reduce((sum, item) => sum + Number(item.paid || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                </div>
                <div class="totals-row">
                  <span>Total Outstanding Due:</span>
                  <span style="color: #dc2626;"><strong>₹ ${filteredEntries.reduce((sum, item) => sum + Number(item.due || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                </div>
              </div>
            </div>

            <!-- Terms & Signatures -->
            <div class="terms-section">
              <strong>Terms & Conditions:</strong>
              <ol style="margin: 5px 0 0 15px; padding: 0;">
                <li>This is an electronically generated financial statement compiled through SettyRents Property Portal.</li>
                <li>All pending balances must be cleared immediately to avoid late collection penalties.</li>
              </ol>
            </div>

            <div class="signatures">
              <div class="sig-line">Prepared By</div>
              <div class="sig-line">Authorized Signatory</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Pagination calculations using filtered entries
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = filteredEntries.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Prevent premature rendering/N/A flash while data is loading
  if (rentLoading && entries.length === 0) {
    return (
      <div style={styles.stateContainer}>
        <p style={styles.stateText}>Loading rent details...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.headerSection}>
        <h1 style={styles.pageTitle}>Rent Management</h1>
        <p style={styles.pageSubtitle}>
          Manage and organize tenant rent payments.
        </p>
      </div>

      <RentForm
        currentEntry={currentEntry}
        clearEditing={() => setCurrentEntry(null)}
        tenants={tenants}
        buildings={buildings}
        rooms={rooms}
        rentEntries={entries}
      />

      <RentFilter
        filters={filters}
        onChange={handleFilterChange}
        buildingOptions={buildingOptions}
        roomOptions={roomOptions}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        onPrint={handlePrintReport}
      />

      <RentTable
        entries={currentEntries}
        onEdit={(entry) => setCurrentEntry(entry)}
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
  headerSection: {
    marginBottom: "20px",
  },
  pageTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
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

export default RentModule;
