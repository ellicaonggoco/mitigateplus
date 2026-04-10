import { useAuth } from "../context/AuthContext";
import { MdAccountCircle } from "react-icons/md";

const Navbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <div style={styles.navbar}>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.user}>
        <MdAccountCircle size={28} color="#2e7d32" />
        <span>{user?.name || "Admin"}</span>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    padding: "16px 24px",
    borderRadius: "8px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  title: { fontSize: "22px", fontWeight: "600", color: "#2e7d32" },
  user: { display: "flex", alignItems: "center", gap: "8px", fontSize: "15px" },
};

export default Navbar;
