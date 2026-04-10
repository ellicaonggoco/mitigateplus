import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [alertStatus, setAlertStatus] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await API.get("/reports/validated");
        setReports(res.data);
        const highCount = res.data.filter((r) => r.severity === "high").length;
        const moderateCount = res.data.filter(
          (r) => r.severity === "moderate",
        ).length;
        if (highCount >= 1) {
          setAlertStatus({
            level: "danger",
            color: "#c62828",
            bg: "#ffebee",
            borderColor: "#ef9a9a",
            iconName: "warning",
            title: "HIGH ALERT!",
            iconColor: "#c62828",
            message: `${highCount} high-severity hazard${highCount > 1 ? "s" : ""} reported in Manila. Stay vigilant and follow LGU advisories.`,
          });
        } else if (moderateCount >= 1) {
          setAlertStatus({
            level: "warning",
            color: "#e65100",
            bg: "#fff8e1",
            borderColor: "#ffcc80",
            iconName: "alert-circle",
            title: "Advisory Notice",
            iconColor: "#f57c00",
            message: `${moderateCount} moderate hazard${moderateCount > 1 ? "s" : ""} reported nearby. Stay alert and check the hazard map.`,
          });
        } else {
          setAlertStatus({
            level: "normal",
            color: "#1565c0",
            bg: "#e3f2fd",
            borderColor: "#90caf9",
            iconName: "checkmark-circle",
            title: "Everything looks normal.",
            iconColor: "#1565c0",
            message:
              "Have a great day! Stay prepared and keep your go bag ready.",
          });
        }
      } catch {
        setAlertStatus({
          level: "normal",
          color: "#1565c0",
          bg: "#e3f2fd",
          borderColor: "#90caf9",
          iconName: "checkmark-circle",
          title: "Everything looks normal.",
          iconColor: "#1565c0",
          message:
            "Have a great day! Stay prepared and keep your go bag ready.",
        });
      }
    };
    fetchStatus();
  }, []);

  const features = [
    {
      icon: "map",
      iconLib: "Ionicons",
      title: "Hazard Map",
      desc: "View flood zones & risk areas",
      screen: "Map",
      color: "#1565c0",
      bg: "#e3f2fd",
    },
    {
      icon: "clipboard",
      iconLib: "Ionicons",
      title: "Risk Assessment",
      desc: "Assess your home safety",
      screen: "Assessment",
      color: "#6a1b9a",
      bg: "#f3e5f5",
    },
    {
      icon: "alert-circle",
      iconLib: "MaterialCommunityIcons",
      title: "Report Hazard",
      desc: "Submit a hazard report",
      screen: "Report",
      color: "#c62828",
      bg: "#ffebee",
    },
    {
      icon: "bag-personal",
      iconLib: "MaterialCommunityIcons",
      title: "Go Bag Checker",
      desc: "Build your emergency kit",
      screen: "GoBag",
      color: "#e65100",
      bg: "#fff3e0",
    },
    {
      icon: "robot",
      iconLib: "MaterialCommunityIcons",
      title: "AI Assistant",
      desc: "Get mitigation advice",
      screen: "Chatbot",
      color: "#00695c",
      bg: "#e0f2f1",
    },
  ];

  const renderIcon = (f, size = 28, color) => {
    if (f.iconLib === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={f.icon}
          size={size}
          color={color || f.color}
        />
      );
    }
    return <Ionicons name={f.icon} size={size} color={color || f.color} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={28} color="#fff" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>MitigatePlus</Text>
            <Text style={styles.headerSub}>City of Manila DRRM</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        {alertStatus && (
          <View
            style={[
              styles.statusBanner,
              {
                backgroundColor: alertStatus.bg,
                borderColor: alertStatus.borderColor,
              },
            ]}
          >
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusIconBox,
                  { backgroundColor: alertStatus.color + "20" },
                ]}
              >
                <Ionicons
                  name={alertStatus.iconName}
                  size={28}
                  color={alertStatus.iconColor}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={[styles.statusTitle, { color: alertStatus.color }]}
                >
                  {alertStatus.title}
                </Text>
                <Text style={styles.statusMsg}>{alertStatus.message}</Text>
              </View>
            </View>
            {alertStatus.level !== "normal" && (
              <TouchableOpacity
                style={[
                  styles.viewMapBtn,
                  { backgroundColor: alertStatus.color },
                ]}
                onPress={() => navigation.navigate("Map")}
              >
                <Ionicons name="map" size={14} color="#fff" />
                <Text style={styles.viewMapText}>View Hazard Map</Text>
              </TouchableOpacity>
            )}
            {alertStatus.level !== "normal" &&
              reports.slice(0, 3).map((r, i) => (
                <View
                  key={i}
                  style={[
                    styles.alertChip,
                    { borderColor: alertStatus.borderColor },
                  ]}
                >
                  <Text style={styles.alertChipText}>
                    {r.type} · {r.location?.address?.split(",")[0] || "Manila"}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeText}>
            Welcome, {user?.name?.split(" ")[0]}! 👋
          </Text>
          <Text style={styles.welcomeSub}>
            Brgy. {user?.barangay || "Manila"} · Stay safe and prepared
          </Text>
        </View>

        {/* Feature Grid */}
        <View style={styles.grid}>
          {features.map((f) => (
            <TouchableOpacity
              key={f.screen}
              style={[styles.card, { borderTopColor: f.color }]}
              onPress={() => navigation.navigate(f.screen)}
              activeOpacity={0.85}
            >
              <View style={[styles.cardIconBox, { backgroundColor: f.bg }]}>
                {renderIcon(f, 26)}
              </View>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardDesc}>{f.desc}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardLink, { color: f.color }]}>
                  Open →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsBox}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={18} color="#1565c0" />
            <Text style={styles.tipsTitle}>Mitigation Tips</Text>
          </View>
          {[
            "Know your nearest evacuation center",
            "Keep emergency contacts saved offline",
            "Check your Go Bag every 3 months",
            "Follow official MDRRMO advisories",
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4ff" },
  header: {
    backgroundColor: "#1565c0",
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "#90caf9", fontSize: 11, marginTop: 1 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  scroll: { flex: 1 },
  statusBanner: {
    margin: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    elevation: 2,
  },
  statusRow: { flexDirection: "row", alignItems: "flex-start" },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: { fontSize: 15, fontWeight: "800", marginBottom: 3 },
  statusMsg: { fontSize: 13, color: "#555", lineHeight: 18 },
  viewMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewMapText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  alertChip: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  alertChipText: { fontSize: 12, color: "#444" },
  welcome: { paddingHorizontal: 16, paddingBottom: 4 },
  welcomeText: { fontSize: 18, fontWeight: "700", color: "#1a237e" },
  welcomeSub: { fontSize: 12, color: "#888", marginTop: 2 },
  grid: { padding: 16, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    width: "47%",
    elevation: 3,
    borderTopWidth: 3,
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#1a237e" },
  cardDesc: { fontSize: 11, color: "#888", marginTop: 3, lineHeight: 15 },
  cardFooter: { marginTop: 10 },
  cardLink: { fontSize: 12, fontWeight: "700" },
  tipsBox: {
    margin: 16,
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#1565c0",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  tipsTitle: { fontSize: 14, fontWeight: "700", color: "#1565c0" },
  tipRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1565c0",
    marginRight: 10,
  },
  tipText: { fontSize: 13, color: "#555", flex: 1 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    padding: 14,
    backgroundColor: "#1565c0",
    borderRadius: 12,
    marginBottom: 32,
    elevation: 3,
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default HomeScreen;
