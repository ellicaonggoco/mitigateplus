import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Header = ({ title, subtitle, icon = "shield-checkmark" }) => (
  <View style={styles.header}>
    <View style={styles.left}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1565c0",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 3,
    borderBottomColor: "#1976d2",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#90caf9",
    fontSize: 11,
    marginTop: 1,
  },
});

export default Header;
