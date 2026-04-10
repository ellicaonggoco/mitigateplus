import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/auth/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="User Management" />
        <div style={styles.box}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Barangay</th>
                <th style={styles.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={styles.tr}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background: u.role === "admin" ? "#e3f2fd" : "#e8f5e9",
                        color: u.role === "admin" ? "#1565c0" : "#2e7d32",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.td}>{u.barangay || "—"}</td>
                  <td style={styles.td}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{ ...styles.td, textAlign: "center", color: "#999" }}
                  >
                    No users found
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
    overflowX: "auto",
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

export default Users;
