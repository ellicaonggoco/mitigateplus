import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [hazardAlerts, setHazardAlerts] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const settingSections = [
    {
      title: "Account",
      items: [
        {
          icon: "person-circle",
          label: "Full Name",
          value: user?.name || "—",
          type: "info",
        },
        {
          icon: "mail",
          label: "Email",
          value: user?.email || "—",
          type: "info",
        },
        {
          icon: "location",
          label: "Barangay",
          value: user?.barangay || "Not set",
          type: "info",
        },
        {
          icon: "shield-checkmark",
          label: "Account Type",
          value: user?.role === "admin" ? "Administrator" : "Resident",
          type: "info",
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: "notifications",
          label: "Push Notifications",
          value: notifications,
          type: "toggle",
          onToggle: setNotifications,
        },
        {
          icon: "warning",
          label: "Hazard Alerts",
          value: hazardAlerts,
          type: "toggle",
          onToggle: setHazardAlerts,
        },
      ],
    },
    {
      title: "Map & Location",
      items: [
        {
          icon: "location",
          label: "Location Access",
          value: locationAccess,
          type: "toggle",
          onToggle: setLocationAccess,
        },
        {
          icon: "map",
          label: "Default Map View",
          value: "All Layers",
          type: "info",
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: "shield-checkmark",
          label: "App Name",
          value: "MitigatePlus",
          type: "info",
        },
        { icon: "code-slash", label: "Version", value: "1.0.0", type: "info" },
        {
          icon: "business",
          label: "Developed for",
          value: "City of Manila MDRRMO",
          type: "info",
        },
        {
          icon: "information-circle",
          label: "Fault Line Data",
          value: "PHIVOLCS",
          type: "info",
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>MitigatePlus Preferences</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#1565c0" />
              <Text style={styles.roleBadgeText}>
                {user?.role === "admin" ? "Administrator" : "Resident"}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <View
                  key={item.label}
                  style={[
                    styles.settingRow,
                    idx < section.items.length - 1 && styles.settingRowBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconBox}>
                      <Ionicons name={item.icon} size={20} color="#1565c0" />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  {item.type === "toggle" ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: "#e0e0e0", true: "#90caf9" }}
                      thumbColor={item.value ? "#1565c0" : "#f5f5f5"}
                    />
                  ) : (
                    <Text style={styles.settingValue}>{item.value}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          © 2025 MitigatePlus · City of Manila MDRRMO{"\n"}
          Powered by PHIVOLCS & PAGASA Data
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4ff" },
  header: {
    backgroundColor: "#1565c0",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#1976d2",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "#90caf9", fontSize: 11, marginTop: 1 },
  scroll: { flex: 1 },
  profileCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#1565c0",
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1565c0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "900" },
  profileName: { fontSize: 17, fontWeight: "800", color: "#1a237e" },
  profileEmail: { fontSize: 12, color: "#888", marginTop: 2 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  roleBadgeText: { fontSize: 11, color: "#1565c0", fontWeight: "700" },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f0f4ff" },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 14, color: "#333", fontWeight: "500" },
  settingValue: {
    fontSize: 13,
    color: "#888",
    maxWidth: 150,
    textAlign: "right",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    padding: 14,
    backgroundColor: "#c62828",
    borderRadius: 12,
    elevation: 3,
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  footer: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 11,
    padding: 16,
    paddingBottom: 32,
    lineHeight: 18,
  },
});

export default SettingsScreen;
