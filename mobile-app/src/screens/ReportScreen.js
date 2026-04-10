import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import API from "../services/api";
import Header from "../components/Header";

const HAZARD_TYPES = [
  {
    type: "Flood",
    emoji: "💧",
    color: "#1565c0",
    hasArea: true,
    placeholder:
      "Describe the flood situation (water level, affected streets...)",
    extraFields: ["startLocation", "endLocation"],
  },
  {
    type: "Fire Hazard",
    emoji: "🔥",
    color: "#e53935",
    hasArea: false,
    placeholder: "Describe the fire hazard (source, materials involved...)",
    extraFields: [],
  },
  {
    type: "Landslide",
    emoji: "⛰️",
    color: "#6d4c41",
    hasArea: false,
    placeholder: "Describe the landslide (area affected, soil type...)",
    extraFields: [],
  },
  {
    type: "Fault Line",
    emoji: "⚡",
    color: "#7b1fa2",
    hasArea: false,
    placeholder: "Describe the fault line risk (cracks, ground movement...)",
    extraFields: [],
  },
  {
    type: "Drainage Issue",
    emoji: "🚧",
    color: "#f57c00",
    hasArea: true,
    placeholder: "Describe the drainage issue (clogged, overflowing...)",
    extraFields: ["startLocation", "endLocation"],
  },
  {
    type: "Structural Damage",
    emoji: "🏚️",
    color: "#546e7a",
    hasArea: false,
    placeholder: "Describe the structural damage (cracks, collapsed walls...)",
    extraFields: [],
  },
  {
    type: "Other",
    emoji: "⚠️",
    color: "#546e7a",
    hasArea: false,
    placeholder: "Describe the hazard in detail...",
    extraFields: [],
  },
];

const ReportScreen = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: "" });
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const addrStr = address[0]
        ? `${address[0].street || ""}, ${address[0].district || ""}, ${address[0].city || "Manila"}`
        : "Manila";
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        address: addrStr,
      });
      Alert.alert("📍 Location Set!", addrStr);
    } catch (err) {
      Alert.alert("Error", "Could not get location");
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert("Error", "Please select a hazard type");
      return;
    }
    if (!description) {
      Alert.alert("Error", "Please add a description");
      return;
    }
    if (!severity) {
      Alert.alert("Error", "Please select severity level");
      return;
    }
    if (!location.lat) {
      Alert.alert("Error", "Please get your current location");
      return;
    }

    setLoading(true);
    try {
      const hazardInfo = HAZARD_TYPES.find((h) => h.type === selectedType);
      const fullDescription = hazardInfo?.hasArea
        ? `${description}\n\nStart Location: ${startLocation || "Not specified"}\nEnd Location: ${endLocation || "Not specified"}`
        : description;

      await API.post("/reports", {
        type: selectedType,
        emoji: hazardInfo?.emoji,
        description: fullDescription,
        severity,
        location,
      });

      Alert.alert(
        "✅ Success!",
        "Your hazard report has been submitted. It will appear on the map after LGU validation.",
      );
      setSelectedType(null);
      setDescription("");
      setLocation({ lat: 0, lng: 0, address: "" });
      setStartLocation("");
      setEndLocation("");
      setSeverity("");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to submit report",
      );
    } finally {
      setLoading(false);
    }
  };

  const selected = HAZARD_TYPES.find((h) => h.type === selectedType);

  return (
    <View style={styles.container}>
      <Header title="Report Hazard" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Hazard Type */}
        <Text style={styles.sectionTitle}>1. Select Hazard Type</Text>
        <View style={styles.typeGrid}>
          {HAZARD_TYPES.map((h) => (
            <TouchableOpacity
              key={h.type}
              style={[
                styles.typeCard,
                selectedType === h.type && {
                  ...styles.typeCardActive,
                  borderColor: h.color,
                },
              ]}
              onPress={() => setSelectedType(h.type)}
            >
              <Text style={styles.typeEmoji}>{h.emoji}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === h.type && { color: h.color },
                ]}
              >
                {h.type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Severity */}
        {selectedType && (
          <>
            <Text style={styles.sectionTitle}>2. Severity Level</Text>
            <View style={styles.severityRow}>
              {[
                { level: "low", label: "🟢 Low", color: "#2e7d32" },
                { level: "moderate", label: "🟡 Moderate", color: "#f57c00" },
                { level: "high", label: "🔴 High", color: "#c62828" },
              ].map((s) => (
                <TouchableOpacity
                  key={s.level}
                  style={[
                    styles.severityBtn,
                    severity === s.level && {
                      backgroundColor: s.color,
                      borderColor: s.color,
                    },
                  ]}
                  onPress={() => setSeverity(s.level)}
                >
                  <Text
                    style={[
                      styles.severityText,
                      severity === s.level && { color: "#fff" },
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Flood/Drainage extra fields */}
            {selected?.hasArea && (
              <>
                <Text style={styles.sectionTitle}>3. Affected Area</Text>
                <View style={styles.areaBox}>
                  <Text style={styles.areaLabel}>
                    📍 Starting Location / Street
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Cor. Rizal Ave & Claro M. Recto"
                    value={startLocation}
                    onChangeText={setStartLocation}
                  />
                  <Text style={styles.areaLabel}>
                    📍 Ending Location / Street
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Cor. España Blvd & Lacson Ave"
                    value={endLocation}
                    onChangeText={setEndLocation}
                  />
                </View>
              </>
            )}

            {/* Description */}
            <Text style={styles.sectionTitle}>
              {selected?.hasArea ? "4." : "3."} Description
            </Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder={selected?.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Location */}
            <Text style={styles.sectionTitle}>
              {selected?.hasArea ? "5." : "4."} Your Current Location
            </Text>
            <TouchableOpacity
              style={[
                styles.locationBtn,
                location.lat && styles.locationBtnSet,
              ]}
              onPress={getLocation}
              disabled={gettingLocation}
            >
              <Text
                style={[
                  styles.locationBtnText,
                  location.lat && { color: "#fff" },
                ]}
              >
                {gettingLocation
                  ? "📡 Getting location..."
                  : location.address || "📍 Get My Current Location"}
              </Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: selected?.color || "#2e7d32" },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading
                  ? "Submitting..."
                  : `${selected?.emoji} Submit ${selected?.type} Report`}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  scroll: { flex: 1 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeCard: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eee",
    elevation: 2,
  },
  typeCardActive: {
    backgroundColor: "#f9fff9",
    borderWidth: 2,
  },
  typeEmoji: { fontSize: 28, marginBottom: 4 },
  typeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  severityRow: { flexDirection: "row", gap: 10 },
  severityBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  severityText: { fontSize: 13, fontWeight: "600", color: "#444" },
  areaBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
    elevation: 1,
  },
  areaLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  locationBtn: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#2e7d32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  locationBtnSet: { backgroundColor: "#2e7d32" },
  locationBtnText: { color: "#2e7d32", fontWeight: "600", fontSize: 14 },
  submitBtn: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
    elevation: 3,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default ReportScreen;
