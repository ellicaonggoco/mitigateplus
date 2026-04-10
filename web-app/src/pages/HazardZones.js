import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

const HazardZones = () => {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "",
    riskLevel: "low",
    description: "",
  });
  const [showForm, setShowForm] = useState(false);

  const fetchZones = async () => {
    try {
      const res = await API.get("/hazards");
      setZones(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSubmit = async () => {
    try {
      await API.post("/hazards", { ...form, coordinates: [] });
      setForm({ name: "", type: "", riskLevel: "low", description: "" });
      setShowForm(false);
      fetchZones();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this hazard zone?")) {
      await API.delete(`/hazards/${id}`);
      fetchZones();
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Hazard Zone Management" />
        <div style={styles.box}>
          <div style={styles.header}>
            <h3 style={styles.sectionTitle}>Hazard Zones</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              style={styles.addBtn}
            >
              {showForm ? "✕ Cancel" : "+ Add Zone"}
            </button>
          </div>

          {showForm && (
            <div style={styles.form}>
              <input
                style={styles.input}
                placeholder="Zone Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Type (flood, landslide, fault_line)"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
              <select
                style={styles.input}
                value={form.riskLevel}
                onChange={(e) =>
                  setForm({ ...form, riskLevel: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
              <input
                style={styles.input}
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <button onClick={handleSubmit} style={styles.saveBtn}>
                Save Zone
              </button>
            </div>
          )}

          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Risk Level</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z._id} style={styles.tr}>
                  <td style={styles.td}>{z.name}</td>
                  <td style={styles.td}>{z.type}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          z.riskLevel === "high"
                            ? "#ffebee"
                            : z.riskLevel === "moderate"
                              ? "#fff3e0"
                              : "#e8f5e9",
                        color:
                          z.riskLevel === "high"
                            ? "#c62828"
                            : z.riskLevel === "moderate"
                              ? "#e65100"
                              : "#2e7d32",
                      }}
                    >
                      {z.riskLevel}
                    </span>
                  </td>
                  <td style={styles.td}>{z.description}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDelete(z._id)}
                      style={{ ...styles.btn, background: "#c62828" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {zones.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{ ...styles.td, textAlign: "center", color: "#999" }}
                  >
                    No hazard zones yet
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
  main: { marginLeft: "240px", padding: "24px", flex: 1 },
  box: {
    background: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  sectionTitle: { fontSize: "16px", fontWeight: "600", color: "#2e7d32" },
  addBtn: {
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  form: {
    background: "#f9f9f9",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "16px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    flex: "1 1 200px",
  },
  saveBtn: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
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
  btn: {
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default HazardZones;
