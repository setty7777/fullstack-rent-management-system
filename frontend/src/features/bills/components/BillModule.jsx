import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BillForm from "./BillForm";
import BillFilter from "./BillFilter";
import BillTable from "./BillTable";
import { getBills, removeBill } from "../slices/billSlice";
import { getTenants } from "../../../features/tenants/slices/tenantSlice";
import { getBuildings } from "../../../features/buildings/slices/buildingSlice";
import { getRooms } from "../../../features/rooms/slices/roomSlice";
import brandLogo from "../../../SettyRents.png";

const BillModule = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentEntry, setCurrentEntry] = useState(null);

  // Filter State matching RentModule structure exactly
  const [filters, setFilters] = useState({
    filterBuilding: "",
    filterRoom: "",
    filterMonth: "",
    filterYear: "",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Extract states and loading flags from Redux
  const billState = useSelector((state) => state.bills || {});
  const entries = Array.isArray(billState)
    ? billState
    : billState?.entries || [];
  const billLoading = billState?.loading || false;

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
    dispatch(getBills(navigate));
    dispatch(getTenants(navigate));
    dispatch(getBuildings(navigate));
    dispatch(getRooms(navigate));
  }, [dispatch, navigate]);

  // Format entries for table display
  const formattedEntries = entries.map((e) => ({
    ...e,
    building: e.building || e.tenant?.building?.name || "N/A",
    room:
      e.room || e.tenant?.room?.room_number || e.tenant?.room_number || "N/A",
    floor:
      e.floor ||
      e.tenant?.floor?.name ||
      e.tenant?.floor?.floor_number ||
      "N/A",
    month: e.month
      ? e.month.charAt(0).toUpperCase() + e.month.slice(1).toLowerCase()
      : "N/A",
  }));

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Extract unique options dynamically just like RentModule
  const buildingOptions = [...new Set(buildings.map((b) => b.name || b))];
  const roomOptions = [
    ...new Set(
      rooms
        .map((r) => r.room_number || r.roomNo || r.name || r)
        .filter(Boolean),
    ),
  ];
  const monthOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const yearOptions = [
    ...new Set(entries.map((e) => String(e.year)).filter(Boolean)),
  ];

  // Filter the formatted entries based on selected options
  const filteredEntries = formattedEntries.filter((e) => {
    const matchesBuilding = filters.filterBuilding
      ? e.building === filters.filterBuilding
      : true;
    const matchesRoom = filters.filterRoom
      ? String(e.room) === String(filters.filterRoom)
      : true;
    const matchesMonth = filters.filterMonth
      ? e.month?.toLowerCase() === filters.filterMonth.toLowerCase()
      : true;
    const matchesYear = filters.filterYear
      ? String(e.year) === String(filters.filterYear)
      : true;

    return matchesBuilding && matchesRoom && matchesMonth && matchesYear;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    const res = await dispatch(removeBill({ id, navigate }));
    if (removeBill.fulfilled.match(res)) {
      alert("Bill deleted successfully");
    } else {
      alert("Failed to delete bill");
    }
  };

  // Electricity Bill Report Handler
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
          <title>Official Electricity Statement - ${filters.filterBuilding} (${filters.filterYear})</title>
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
              width: 300px;
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

            /* Footer & Signatures */
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
                <h2>Setty Rents Utility Services</h2>
                <p>Commercial & Residential Property Management</p>
              </div>
              <div class="invoice-meta">
                <h3>ELECTRICITY STATEMENT</h3>
                <p><strong>Statement Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Billing Cycle:</strong> ${filters.filterMonth || "All Months"} ${filters.filterYear}</p>
              </div>
            </div>

            <!-- Consumer / Location Parameters -->
            <div class="info-grid">
              <div class="info-block">
                <div><strong>Building Scope:</strong> ${filters.filterBuilding}</div>
                <div><strong>Room Filter:</strong> ${filters.filterRoom || "All Rooms Managed"}</div>
              </div>
              <div class="info-block">
                <div><strong>Total Consumers Listed:</strong> ${filteredEntries.length}</div>
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
                  <th class="text-right">Prev Read</th>
                  <th class="text-right">Curr Read</th>
                  <th class="text-right">Units</th>
                  <th class="text-right">Rate (₹)</th>
                  <th class="text-right">Amount (₹)</th>
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
                    <td class="text-right">${e.previous_reading || 0}</td>
                    <td class="text-right">${e.current_reading || 0}</td>
                    <td class="text-right">${e.units}</td>
                    <td class="text-right">${e.rate || "-"}</td>
                    <td class="text-right" style="font-weight: 600; color: #0369a1;">₹ ${e.amount.toLocaleString()}</td>
                  </tr>
                `,
                        )
                        .join("")
                    : `
                  <tr>
                    <td colspan="8" style="text-align: center; color: #64748b; padding: 20px;">No records found for the selected criteria.</td>
                  </tr>
                `
                }
              </tbody>
            </table>

            <!-- Summary Totals Calculation Box -->
            <div class="totals-container">
              <div class="totals-box">
                <div class="totals-row">
                  <span>Total Units Consumed:</span>
                  <span><strong>${filteredEntries.reduce((sum, item) => sum + Number(item.units || 0), 0)} kWh</strong></span>
                </div>
                <div class="totals-row">
                  <span>Gross Payable Amount:</span>
                  <span><strong>₹ ${filteredEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            <!-- Terms & Signatures -->
            <div class="terms-section">
              <strong>Terms & Conditions:</strong>
              <ol style="margin: 5px 0 0 15px; padding: 0;">
                <li>This is an electronically generated statement compiled through SettyRents Property Portal. No physical signature required for internal audits.</li>
                <li>Electricity charges must be cleared alongside monthly maintenance dues before the 10th of every calendar cycle.</li>
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
  if (billLoading && entries.length === 0) {
    return (
      <div style={styles.stateContainer}>
        <p style={styles.stateText}>Loading electricity bills...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.headerSection}>
        <h1 style={styles.pageTitle}>Electricity Bills</h1>
        <p style={styles.pageSubtitle}>
          Manage and organize tenant electricity bills and meter readings.
        </p>
      </div>

      <BillForm
        currentEntry={currentEntry}
        clearEditing={() => setCurrentEntry(null)}
        tenants={tenants}
        billEntries={entries}
      />

      <BillFilter
        filters={filters}
        onChange={handleFilterChange}
        buildingOptions={buildingOptions}
        roomOptions={roomOptions}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        onPrint={handlePrintReport}
      />

      <BillTable
        records={currentEntries}
        onEdit={(item) => setCurrentEntry(item)}
        onDelete={handleDelete}
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

export default BillModule;
