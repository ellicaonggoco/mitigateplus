import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import API from "../services/api";
import Header from "../components/Header";

const GoBagScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await API.get("/gobag");
        setItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const toggleCheck = (id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered =
    filter === "all"
      ? items
      : items.filter((i) => i.forRiskLevel?.includes(filter));
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <Header title="Go Bag Checker" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.progressBox}>
          <Text style={styles.progressText}>
            {checkedCount}/{filtered.length} items packed
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: filtered.length
                    ? `${(checkedCount / filtered.length) * 100}%`
                    : "0%",
                },
              ]}
            />
          </View>
        </View>

        <Text style={styles.label}>Filter by Risk Level:</Text>
        <View style={styles.filterRow}>
          {["all", "low", "moderate", "high"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  filter === f && styles.filterBtnTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2e7d32"
            style={{ marginTop: 40 }}
          />
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[
                styles.itemCard,
                checked[item._id] && styles.itemCardChecked,
              ]}
              onPress={() => toggleCheck(item._id)}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemCheck}>
                  {checked[item._id] ? "✅" : "⬜"}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <View style={styles.whyBox}>
                <Text style={styles.whyTitle}>💡 Why important:</Text>
                <Text style={styles.whyText}>{item.whyImportant}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        {!loading && filtered.length === 0 && (
          <Text style={styles.empty}>
            No items found. Add some from the admin dashboard!
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  scroll: { flex: 1 },
  progressBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  progressText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  progressBar: { height: 10, backgroundColor: "#e0e0e0", borderRadius: 5 },
  progressFill: { height: 10, backgroundColor: "#2e7d32", borderRadius: 5 },
  label: { fontSize: 14, fontWeight: "600", color: "#444", marginBottom: 8 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  filterBtnActive: { backgroundColor: "#2e7d32", borderColor: "#2e7d32" },
  filterBtnText: { fontSize: 13, color: "#444" },
  filterBtnTextActive: { color: "#fff" },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  itemCardChecked: { opacity: 0.6, backgroundColor: "#f1f8e9" },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  itemCheck: { fontSize: 24 },
  itemName: { fontSize: 16, fontWeight: "700", color: "#333" },
  itemCategory: { fontSize: 12, color: "#888", textTransform: "capitalize" },
  itemDesc: { fontSize: 14, color: "#555", marginBottom: 8 },
  whyBox: { backgroundColor: "#f5f5f5", borderRadius: 8, padding: 10 },
  whyTitle: { fontSize: 13, fontWeight: "600", color: "#2e7d32" },
  whyText: { fontSize: 13, color: "#555", marginTop: 4 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 15 },
});

export default GoBagScreen;
