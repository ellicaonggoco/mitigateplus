import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MdDashboard,
  MdMap,
  MdPeople,
  MdBackpack,
  MdLogout,
} from "react-icons/md";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { to: "/", icon: <MdDashboard />, label: "Dashboard" },
    { to: "/hazard-management", icon: <MdMap />, label: "Hazard Management" },
    { to: "/users", icon: <MdPeople />, label: "Users" },
    { to: "/gobag", icon: <MdBackpack />, label: "Go Bag Items" },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        🛡️ <span>MitigatePlus</span>
      </div>
      <nav style={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            style={({ isActive }) => ({
              ...styles.link,
              background: isActive ? "#1b5e20" : "transparent",
            })}
          >
            <span style={styles.icon}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout} style={styles.logout}>
        <MdLogout /> Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "#2e7d32",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    position: "fixed",
    top: 0,
    left: 0,
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold",
    padding: "0 20px 24px",
    borderBottom: "1px solid #388e3c",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  nav: { display: "flex", flexDirection: "column", marginTop: "16px", flex: 1 },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    color: "#fff",
    textDecoration: "none",
    fontSize: "15px",
    borderRadius: "4px",
    margin: "2px 8px",
  },
  icon: { fontSize: "20px" },
  logout: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "8px",
    padding: "12px 20px",
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "15px",
  },
};

export default Sidebar;
