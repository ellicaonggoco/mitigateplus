import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

const GoBagItems = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    whyImportant: "",
    forRiskLevel: [],
  });
  const [showForm, setShowForm] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await API.get("/gobag");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async () => {
    try {
      await API.post("/gobag", form);
      setForm({
        name: "",
        category: "",
        description: "",
        whyImportant: "",
        forRiskLevel: [],
      });
      setShowForm(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await API.delete(`/gobag/${id}`);
      fetchItems();
    }
  };

  const toggleRiskLevel = (level) => {
    setForm((prev) => ({
      ...prev,
      forRiskLevel: prev.forRiskLevel.includes(level)
        ? prev.forRiskLevel.filter((l) => l !== level)
        : [...prev.forRiskLevel, level],
    }));
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Go Bag Items" />
        <div style={styles.box}>
          <div style={styles.header}>
            <h3 style={styles.sectionTitle}>Go Bag Items</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              style={styles.addBtn}
            >
              {showForm ? "✕ Cancel" : "+ Add Item"}
            </button>
          </div>

          {showForm && (
            <div style={styles.form}>
              <input
                style={styles.input}
                placeholder="Item Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Category (food, medical, documents, tools)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <input
                style={styles.input}
                placeholder="Why is this important?"
                value={form.whyImportant}
                onChange={(e) =>
                  setForm({ ...form, whyImportant: e.target.value })
                }
              />
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <span style={{ fontSize: "14px", color: "#666" }}>
                  For Risk Level:
                </span>
                {["low", "moderate", "high"].map((level) => (
                  <label
                    key={level}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "14px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.forRiskLevel.includes(level)}
                      onChange={() => toggleRiskLevel(level)}
                    />
                    {level}
                  </label>
                ))}
              </div>
              <button onClick={handleSubmit} style={styles.saveBtn}>
                Save Item
              </button>
            </div>
          )}

          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Why Important</th>
                <th style={styles.th}>Risk Levels</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={styles.tr}>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.category}</td>
                  <td style={styles.td}>{item.description}</td>
                  <td style={styles.td}>{item.whyImportant}</td>
                  <td style={styles.td}>{item.forRiskLevel?.join(", ")}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{ ...styles.btn, background: "#c62828" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ ...styles.td, textAlign: "center", color: "#999" }}
                  >
                    No items yet
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
  btn: {
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default GoBagItems;
