import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

const STATUS_COLORS = {
  validated: { bg: "#e8f5e9", color: "#2e7d32" },
  rejected: { bg: "#ffebee", color: "#c62828" },
  pending: { bg: "#fff3e0", color: "#e65100" },
};

const EMOJI_MAP = {
  Flood: "💧",
  "Fire Hazard": "🔥",
  Landslide: "⛰️",
  "Fault Line": "⚡",
  "Drainage Issue": "🚧",
  "Structural Damage": "🏚️",
  Other: "⚠️",
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports");
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/reports/${id}/status`, { status });
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReport = async (id, type) => {
    if (!window.confirm(`Remove "${type}" report from the map permanently?`))
      return;
    try {
      await API.delete(`/reports/${id}`);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = reports.filter((r) => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch =
      r.type?.toLowerCase().includes(search.toLowerCase()) ||
      r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.address?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    validated: reports.filter((r) => r.status === "validated").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Report Management" />

        {/* Stats */}
        <div style={styles.statsRow}>
          {Object.entries(counts).map(([key, val]) => (
            <div
              key={key}
              style={{
                ...styles.statCard,
                borderTop: `3px solid ${key === "pending" ? "#f57c00" : key === "validated" ? "#2e7d32" : key === "rejected" ? "#c62828" : "#1976d2"}`,
                cursor: "pointer",
                opacity: filter === key ? 1 : 0.7,
              }}
              onClick={() => setFilter(key)}
            >
              <div style={styles.statVal}>{val}</div>
              <div style={styles.statLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.box}>
          {/* Search & Filter */}
          <div style={styles.toolbar}>
            <input
              style={styles.search}
              placeholder="🔍 Search by type, reporter, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={styles.filters}>
              {["all", "pending", "validated", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...styles.filterBtn,
                    background: filter === f ? "#2e7d32" : "#f5f5f5",
                    color: filter === f ? "#fff" : "#444",
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Reporter</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Severity</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.typeCell}>
                        <span style={styles.emoji}>
                          {r.emoji || EMOJI_MAP[r.type] || "⚠️"}
                        </span>
                        <span>{r.type}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{r.userId?.name || "N/A"}</td>
                    <td style={styles.td}>
                      <div style={styles.descCell} title={r.description}>
                        {r.description?.slice(0, 60)}...
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.locationCell}>
                        📍{" "}
                        {r.location?.address ||
                          `${r.location?.lat?.toFixed(4)}, ${r.location?.lng?.toFixed(4)}`}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {r.severity && (
                        <span
                          style={{
                            ...styles.badge,
                            background:
                              r.severity === "high"
                                ? "#ffebee"
                                : r.severity === "moderate"
                                  ? "#fff3e0"
                                  : "#e8f5e9",
                            color:
                              r.severity === "high"
                                ? "#c62828"
                                : r.severity === "moderate"
                                  ? "#e65100"
                                  : "#2e7d32",
                          }}
                        >
                          {r.severity}
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...STATUS_COLORS[r.status],
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(r._id, "validated")}
                              style={{ ...styles.btn, background: "#2e7d32" }}
                              title="Validate — appears on map"
                            >
                              ✓ Validate
                            </button>
                            <button
                              onClick={() => updateStatus(r._id, "rejected")}
                              style={{ ...styles.btn, background: "#c62828" }}
                              title="Reject report"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {r.status === "validated" && (
                          <button
                            onClick={() => deleteReport(r._id, r.type)}
                            style={{ ...styles.btn, background: "#e65100" }}
                            title="Remove from map — hazard resolved"
                          >
                            🗺️ Remove
                          </button>
                        )}
                        <button
                          onClick={() => deleteReport(r._id, r.type)}
                          style={{ ...styles.btn, background: "#555" }}
                          title="Delete permanently"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        color: "#999",
                        padding: "40px",
                      }}
                    >
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex" },
  main: { marginLeft: "240px", padding: "24px", flex: 1 },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  statVal: { fontSize: "28px", fontWeight: "700", color: "#333" },
  statLabel: { fontSize: "13px", color: "#666", marginTop: "4px" },
  box: {
    background: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
    flexWrap: "wrap",
  },
  search: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    flex: 1,
    minWidth: "200px",
  },
  filters: { display: "flex", gap: "8px" },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f5f5f5" },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    color: "#666",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "12px", fontSize: "14px", verticalAlign: "middle" },
  typeCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "500",
  },
  emoji: { fontSize: "20px" },
  descCell: {
    maxWidth: "200px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#555",
  },
  locationCell: { maxWidth: "150px", fontSize: "12px", color: "#666" },
  badge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  actions: { display: "flex", gap: "4px", flexWrap: "wrap" },
  btn: {
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
};

export default Reports;
