import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    reports: 0,
    hazards: 0,
    users: 0,
    gobag: 0,
  });
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [r, h, u, g] = await Promise.all([
          API.get("/reports"),
          API.get("/hazards"),
          API.get("/auth/users"),
          API.get("/gobag"),
        ]);
        setStats({
          reports: r.data.length,
          hazards: h.data.length,
          users: u.data.length,
          gobag: g.data.length,
        });
        setReports(r.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: "Reports", value: stats.reports },
    { name: "Hazard Zones", value: stats.hazards },
    { name: "Users", value: stats.users },
    { name: "Go Bag Items", value: stats.gobag },
  ];

  const cards = [
    {
      label: "Total Reports",
      value: stats.reports,
      color: "#e53935",
      icon: "📋",
    },
    {
      label: "Hazard Zones",
      value: stats.hazards,
      color: "#f57c00",
      icon: "🗺️",
    },
    {
      label: "Registered Users",
      value: stats.users,
      color: "#1976d2",
      icon: "👥",
    },
    { label: "Go Bag Items", value: stats.gobag, color: "#2e7d32", icon: "🎒" },
  ];

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Risk Dashboard" />

        <div style={styles.cards}>
          {cards.map((card) => (
            <div
              key={card.label}
              style={{ ...styles.card, borderTop: `4px solid ${card.color}` }}
            >
              <div style={styles.cardIcon}>{card.icon}</div>
              <div style={styles.cardValue}>{card.value}</div>
              <div style={styles.cardLabel}>{card.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.chartBox}>
          <h3 style={styles.sectionTitle}>System Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2e7d32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.tableBox}>
          <h3 style={styles.sectionTitle}>Recent Reports</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} style={styles.tr}>
                  <td style={styles.td}>{r.type}</td>
                  <td style={styles.td}>{r.description?.slice(0, 50)}...</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          r.status === "validated"
                            ? "#e8f5e9"
                            : r.status === "rejected"
                              ? "#ffebee"
                              : "#fff3e0",
                        color:
                          r.status === "validated"
                            ? "#2e7d32"
                            : r.status === "rejected"
                              ? "#c62828"
                              : "#e65100",
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    style={{ ...styles.td, textAlign: "center", color: "#999" }}
                  >
                    No reports yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex" },
  main: { marginLeft: "240px", padding: "24px", flex: 1, minHeight: "100vh" },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  cardIcon: { fontSize: "32px", marginBottom: "8px" },
  cardValue: { fontSize: "32px", fontWeight: "700", color: "#333" },
  cardLabel: { fontSize: "14px", color: "#666", marginTop: "4px" },
  chartBox: {
    background: "#fff",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tableBox: {
    background: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: "16px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f5f5f5" },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    color: "#666",
    fontWeight: "600",
  },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "12px", fontSize: "14px" },
  badge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
};

export default Dashboard;
