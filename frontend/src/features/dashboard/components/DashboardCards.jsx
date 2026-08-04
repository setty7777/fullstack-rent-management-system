import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { fetchDashboardCountsService } from "../services/dashboard.service";
import { fetchRentApi } from "../../rent/services/rent.service";
import { fetchBillsService } from "../../bills/services/bill.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const DashboardCards = () => {
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    buildings: 0,
    floors: 0,
    rooms: 0,
    tenants: 0,
  });

  const [financials, setFinancials] = useState({
    avgRent: 0,
    avgBill: 0,
  });

  const [trendData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const countData = await fetchDashboardCountsService(navigate);
        if (countData && typeof countData === "object") {
          setCounts({
            buildings: Number(countData.buildings || 0),
            floors: Number(countData.floors || 0),
            rooms: Number(countData.rooms || 0),
            tenants: Number(countData.tenants || 0),
          });
        }

        const rentResponse = await fetchRentApi(navigate);
        const rentEntries = Array.isArray(rentResponse?.data)
          ? rentResponse.data
          : rentResponse?.data?.data ||
            rentResponse?.data?.entries ||
            rentResponse ||
            [];

        if (Array.isArray(rentEntries) && rentEntries.length > 0) {
          const totalRent = rentEntries.reduce(
            (acc, curr) =>
              acc + Number(curr.rent || curr.paid || curr.amount || 0),
            0,
          );
          const avgRent = Math.round(totalRent / rentEntries.length);
          setFinancials((prev) => ({ ...prev, avgRent }));
        }

        const billResponse = await fetchBillsService(navigate);
        const billEntries = Array.isArray(billResponse)
          ? billResponse
          : billResponse?.data || billResponse?.data?.data || [];

        if (Array.isArray(billEntries) && billEntries.length > 0) {
          const totalBill = billEntries.reduce(
            (acc, curr) => acc + Number(curr.amount || curr.billAmount || 0),
            0,
          );
          const avgBill = Math.round(totalBill / billEntries.length);
          setFinancials((prev) => ({ ...prev, avgBill }));
        }
      } catch (error) {
        console.error("Dashboard data load error:", error);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const occupiedRooms = Math.min(counts.tenants, counts.rooms);
  const vacantRooms = 0;

  const metrics = [
    { title: "Buildings", count: counts.buildings, accent: "#3b82f6" },
    { title: "Floors", count: counts.floors, accent: "#10b981" },
    { title: "Rooms", count: counts.rooms, accent: "#f59e0b" },
    { title: "Tenants", count: counts.tenants, accent: "#ef4444" },
    { title: "Vacant Rooms", count: vacantRooms, accent: "#8b5cf6" },
    {
      title: "Avg Rent / Mo",
      count: `₹${financials.avgRent.toLocaleString()}`,
      accent: "#6366f1",
    },
    {
      title: "Avg Current Bill",
      count: `₹${financials.avgBill.toLocaleString()}`,
      accent: "#14b8a6",
    },
  ];

  const barData = {
    labels: ["Buildings", "Floors", "Rooms", "Tenants"],
    datasets: [
      {
        label: "Total Count",
        data: [counts.buildings, counts.floors, counts.rooms, counts.tenants],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const occupancyPieData = {
    labels: ["Occupied Rooms", "Vacant Rooms"],
    datasets: [
      {
        data: [occupiedRooms, vacantRooms],
        backgroundColor: ["#10b981", "#8b5cf6"],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 6,
      },
    ],
  };

  const lineChartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: "Rent Trend (₹)",
        data: [
          12000,
          15000,
          14000,
          18000,
          17500,
          19000,
          financials.avgRent || 18500,
        ],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.08)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Utility Bills (₹)",
        data: [1200, 1400, 1100, 1600, 1300, 1500, financials.avgBill || 1350],
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20, 184, 166, 0.08)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>Dashboard Overview</h1>
          <p style={styles.pageSubtitle}>
            Comprehensive real-time analytics, property metrics, and financial
            performance.
          </p>
        </div>
        <div style={styles.statusBadge}>
          <span style={styles.statusDot} /> System Online
        </div>
      </div>

      <div style={styles.cardsGrid}>
        {metrics.map((item) => (
          <div style={styles.card} key={item.title}>
            <div style={styles.cardHeaderTop}>
              <span style={styles.cardTitle}>{item.title}</span>
              <span
                style={{
                  ...styles.cardIndicator,
                  backgroundColor: item.accent,
                }}
              />
            </div>
            <div style={styles.cardValueRow}>
              <h2 style={styles.cardValue}>{String(item.count)}</h2>
              <span style={styles.cardSubLabel}>Status Metric</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chartsContainer}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Resource Volume (Bar Chart)</h3>
          <div style={styles.chartWrapper}>
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 12, weight: "500" } },
                  },
                  y: {
                    grid: { color: "#f1f5f9" },
                    ticks: { precision: 0, font: { size: 12 } },
                  },
                },
              }}
            />
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Room Occupancy Status</h3>
          <div style={styles.chartWrapper}>
            <Pie
              data={occupancyPieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 12,
                      padding: 16,
                      font: { size: 12, weight: "500" },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ ...styles.chartCard, marginTop: "24px" }}>
        <h3 style={styles.chartTitle}>
          Financial Performance & Utility Trends (Monthly)
        </h3>
        <div style={{ ...styles.chartWrapper, height: "320px" }}>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    boxWidth: 12,
                    padding: 16,
                    font: { size: 12, weight: "600" },
                  },
                },
              },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 12 } } },
                y: {
                  grid: { color: "#f1f5f9" },
                  ticks: { font: { size: 12 } },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1350px",
    margin: "0 auto",
    boxSizing: "border-box",
    width: "100%",
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
    letterSpacing: "-0.01em",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#64748b",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#22c55e",
    borderRadius: "50%",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  card: {
    background: "#ffffff",
    padding: "20px 24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardHeaderTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  cardIndicator: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  cardValueRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  cardValue: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  cardSubLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  chartsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  chartCard: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "20px",
  },
  chartWrapper: {
    position: "relative",
    height: "280px",
    width: "100%",
  },
};

export default DashboardCards;
