import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import API from "../services/api";

const MANILA = {
  lat: 14.5995,
  lng: 120.9842,
  zoom: 14,
  bounds: { minLat: 14.55, maxLat: 14.64, minLng: 120.96, maxLng: 121.02 },
};

const HAZARD_TYPES = [
  {
    type: "Flood",
    emoji: "💧",
    color: "#1565c0",
    bg: "#e3f2fd",
    icon: "water",
    lib: "Ionicons",
    isLine: true,
  },
  {
    type: "Fire Hazard",
    emoji: "🔥",
    color: "#c62828",
    bg: "#ffebee",
    icon: "fire",
    lib: "MaterialCommunityIcons",
    isLine: false,
  },
  {
    type: "Landslide",
    emoji: "⛰️",
    color: "#6d4c41",
    bg: "#efebe9",
    icon: "landslide",
    lib: "MaterialCommunityIcons",
    isLine: false,
  },
  {
    type: "Fault Line",
    emoji: "⚡",
    color: "#6a1b9a",
    bg: "#f3e5f5",
    icon: "pulse",
    lib: "Ionicons",
    isLine: false,
  },
  {
    type: "Drainage Issue",
    emoji: "🚧",
    color: "#f57c00",
    bg: "#fff3e0",
    icon: "pipe-leak",
    lib: "MaterialCommunityIcons",
    isLine: true,
  },
  {
    type: "Structural Damage",
    emoji: "🏚️",
    color: "#546e7a",
    bg: "#eceff1",
    icon: "home-alert",
    lib: "MaterialCommunityIcons",
    isLine: false,
  },
  {
    type: "Other",
    emoji: "⚠️",
    color: "#37474f",
    bg: "#f5f5f5",
    icon: "alert-circle",
    lib: "Ionicons",
    isLine: false,
  },
];

// ============================================================
// MAP PICKER MODAL
// ============================================================
const MapPickerModal = ({
  visible,
  onClose,
  onLocationPicked,
  title,
  existingPin,
  secondPin,
}) => {
  const webViewRef = useRef(null);
  const [pickedLocation, setPickedLocation] = useState(null);

  const buildPickerHTML = () => `
    <!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        html,body,#map { width:100%; height:100vh; }
        .search-box {
          position:fixed; top:10px; left:10px; right:10px;
          z-index:9999; background:white; border-radius:12px;
          padding:10px 14px; box-shadow:0 2px 12px rgba(0,0,0,0.2);
          display:flex; align-items:center; gap:8px;
        }
        .search-box input {
          flex:1; border:none; outline:none; font-size:14px;
          color:#333;
        }
        .search-box button {
          background:#1565c0; color:white; border:none;
          padding:6px 12px; border-radius:8px; font-size:13px;
          cursor:pointer;
        }
        .hint {
          position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
          background:rgba(21,101,192,0.9); color:white;
          padding:8px 18px; border-radius:20px; font-size:13px;
          z-index:9999; white-space:nowrap; font-family:sans-serif;
        }
        .confirm-btn {
          position:fixed; bottom:60px; left:50%; transform:translateX(-50%);
          background:#2e7d32; color:white; border:none;
          padding:12px 28px; border-radius:12px; font-size:15px;
          font-weight:bold; z-index:9999; cursor:pointer;
          box-shadow:0 3px 8px rgba(0,0,0,0.3); display:none;
        }
      </style>
    </head><body>
      <div class="search-box">
        <input id="searchInput" placeholder="Search street, barangay in Manila..." />
        <button onclick="searchLocation()">Search</button>
      </div>
      <div id="map"></div>
      <div class="hint" id="hint">📍 Tap anywhere on the map to pin location</div>
      <button class="confirm-btn" id="confirmBtn" onclick="confirmLocation()">
        ✅ Confirm This Location
      </button>
      <script>
        var map = L.map('map', {
          center: [${existingPin ? existingPin.lat : MANILA.lat}, ${existingPin ? existingPin.lng : MANILA.lng}],
          zoom: 15,
          minZoom: 13,
          maxZoom: 18,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap', maxZoom: 18
        }).addTo(map);

        var currentMarker = null;
        var currentLat = null;
        var currentLng = null;
        var currentAddress = '';

        ${
          existingPin
            ? `
          currentMarker = L.marker([${existingPin.lat}, ${existingPin.lng}], {
            icon: L.divIcon({
              html: '<div style="font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">📍</div>',
              className: '', iconSize:[36,36], iconAnchor:[18,36]
            })
          }).addTo(map);
          currentLat = ${existingPin.lat};
          currentLng = ${existingPin.lng};
          currentAddress = '${existingPin.address || ""}';
          document.getElementById('confirmBtn').style.display = 'block';
          document.getElementById('hint').textContent = '📍 Tap to move pin';
        `
            : ""
        }

        ${
          secondPin
            ? `
          L.marker([${secondPin.lat}, ${secondPin.lng}], {
            icon: L.divIcon({
              html: '<div style="font-size:28px;opacity:0.6">📍</div>',
              className: '', iconSize:[32,32], iconAnchor:[16,32]
            })
          }).addTo(map).bindTooltip('Other pin', {permanent:true, direction:'top'});
        `
            : ""
        }

        map.on('click', function(e) {
          if (currentMarker) map.removeLayer(currentMarker);
          currentLat = e.latlng.lat;
          currentLng = e.latlng.lng;

          currentMarker = L.marker([currentLat, currentLng], {
            icon: L.divIcon({
              html: '<div style="font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">📍</div>',
              className: '', iconSize:[36,36], iconAnchor:[18,36]
            })
          }).addTo(map);

          document.getElementById('confirmBtn').style.display = 'block';
          document.getElementById('hint').textContent = '✅ Tap Confirm to use this location';

          // Reverse geocode
          fetch('https://nominatim.openstreetmap.org/reverse?lat=' + currentLat + '&lon=' + currentLng + '&format=json')
            .then(r => r.json())
            .then(data => {
              currentAddress = data.display_name || (currentLat.toFixed(4) + ', ' + currentLng.toFixed(4));
              if (currentMarker) {
                currentMarker.bindTooltip(currentAddress.split(',').slice(0,2).join(','), {
                  permanent: true, direction: 'top',
                  className: 'leaflet-tooltip'
                }).openTooltip();
              }
            })
            .catch(() => { currentAddress = currentLat.toFixed(4) + ', ' + currentLng.toFixed(4); });
        });

        function searchLocation() {
          var query = document.getElementById('searchInput').value;
          if (!query) return;
          fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query + ' Manila Philippines') + '&format=json&limit=1')
            .then(r => r.json())
            .then(data => {
              if (data && data.length > 0) {
                var lat = parseFloat(data[0].lat);
                var lng = parseFloat(data[0].lon);
                map.setView([lat, lng], 17);
                if (currentMarker) map.removeLayer(currentMarker);
                currentLat = lat;
                currentLng = lng;
                currentAddress = data[0].display_name || query;
                currentMarker = L.marker([lat, lng], {
                  icon: L.divIcon({
                    html: '<div style="font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">📍</div>',
                    className: '', iconSize:[36,36], iconAnchor:[18,36]
                  })
                }).addTo(map).bindTooltip(query, {permanent:true, direction:'top'}).openTooltip();
                document.getElementById('confirmBtn').style.display = 'block';
              } else {
                alert('Location not found. Try a different search term.');
              }
            });
        }

        document.getElementById('searchInput').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') searchLocation();
        });

        function confirmLocation() {
          if (currentLat && currentLng) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              lat: currentLat,
              lng: currentLng,
              address: currentAddress
            }));
          }
        }
      </script>
    </body></html>
  `;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
        </View>
        <WebView
          ref={webViewRef}
          source={{ html: buildPickerHTML() }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          mixedContentMode="always"
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.lat && data.lng) {
                onLocationPicked({
                  lat: data.lat,
                  lng: data.lng,
                  address:
                    data.address ||
                    `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
                });
                onClose();
              }
            } catch (e) {}
          }}
        />
      </View>
    </Modal>
  );
};

// ============================================================
// MAIN REPORT SCREEN
// ============================================================
const ReportScreen = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [location, setLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Map picker state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerMode, setMapPickerMode] = useState("single"); // single | start | end

  const selected = HAZARD_TYPES.find((h) => h.type === selectedType);

  const openMapPicker = (mode) => {
    setMapPickerMode(mode);
    setShowMapPicker(true);
  };

  const handleLocationPicked = (loc) => {
    if (mapPickerMode === "single") setLocation(loc);
    else if (mapPickerMode === "start") setStartLocation(loc);
    else if (mapPickerMode === "end") setEndLocation(loc);
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert("Error", "Please select a hazard type");
      return;
    }
    if (!severity) {
      Alert.alert("Error", "Please select a severity level");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please add a description");
      return;
    }

    if (selected?.isLine) {
      if (!startLocation) {
        Alert.alert(
          "📍 Start Location Required",
          "Please pin the starting location of the hazard on the map.",
        );
        return;
      }
      if (!endLocation) {
        Alert.alert(
          "📍 End Location Required",
          "Please pin the ending location of the hazard on the map.",
        );
        return;
      }
    } else {
      if (!location) {
        Alert.alert(
          "📍 Location Required",
          "Please pin the hazard location on the map before submitting.",
        );
        return;
      }
    }

    setLoading(true);
    try {
      const fullDescription = selected?.isLine
        ? `${description}\n\nStart: ${startLocation?.address || "See map"}\nEnd: ${endLocation?.address || "See map"}`
        : description;

      const reportLocation = selected?.isLine
        ? {
            lat: startLocation.lat,
            lng: startLocation.lng,
            address: startLocation.address,
          }
        : location;

      await API.post("/reports", {
        type: selectedType,
        emoji: selected?.emoji,
        description: fullDescription,
        severity,
        location: reportLocation,
        ...(selected?.isLine && {
          startLocation,
          endLocation,
        }),
      });

      Alert.alert(
        "✅ Report Submitted!",
        "Your hazard report has been submitted successfully. It will appear on the map after LGU validation.",
        [{ text: "OK" }],
      );

      // Reset
      setSelectedType(null);
      setDescription("");
      setSeverity("");
      setLocation(null);
      setStartLocation(null);
      setEndLocation(null);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to submit report",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (hazard, size = 24, color) => {
    if (hazard.lib === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={hazard.icon}
          size={size}
          color={color || hazard.color}
        />
      );
    }
    return (
      <Ionicons name={hazard.icon} size={size} color={color || hazard.color} />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconBox}>
          <Ionicons name="warning" size={22} color="#fff" />
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Report Hazard</Text>
          <Text style={styles.headerSub}>City of Manila</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={18} color="#1565c0" />
          <Text style={styles.infoText}>
            You can report hazards anywhere in Manila. Pin the exact location on
            the map for accurate reporting.
          </Text>
        </View>

        {/* Step 1 — Hazard Type */}
        <Text style={styles.stepLabel}>Step 1 — Select Hazard Type</Text>
        <View style={styles.typeGrid}>
          {HAZARD_TYPES.map((h) => (
            <TouchableOpacity
              key={h.type}
              style={[
                styles.typeCard,
                selectedType === h.type && {
                  borderColor: h.color,
                  backgroundColor: h.bg,
                },
              ]}
              onPress={() => {
                setSelectedType(h.type);
                setLocation(null);
                setStartLocation(null);
                setEndLocation(null);
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.typeIconBox, { backgroundColor: h.bg }]}>
                {renderIcon(h, 24)}
              </View>
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === h.type && { color: h.color },
                ]}
              >
                {h.type}
              </Text>
              {h.isLine && <Text style={styles.typeHint}>Start → End</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {selected && (
          <>
            {/* Step 2 — Severity */}
            <Text style={styles.stepLabel}>Step 2 — Severity Level</Text>
            <View style={styles.severityRow}>
              {[
                { level: "low", label: "Low", color: "#2e7d32", bg: "#e8f5e9" },
                {
                  level: "moderate",
                  label: "Moderate",
                  color: "#f57c00",
                  bg: "#fff3e0",
                },
                {
                  level: "high",
                  label: "High",
                  color: "#c62828",
                  bg: "#ffebee",
                },
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
                  <View
                    style={[
                      styles.severityDot,
                      {
                        backgroundColor:
                          severity === s.level ? "#fff" : s.color,
                      },
                    ]}
                  />
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

            {/* Step 3 — Location */}
            <Text style={styles.stepLabel}>
              Step 3 —{" "}
              {selected.isLine
                ? "Pin Start & End Location on Map"
                : "Pin Location on Map"}
            </Text>

            {selected.isLine ? (
              /* FLOOD / DRAINAGE — Start + End pins */
              <View style={styles.lineLocationBox}>
                <View style={styles.lineLocationRow}>
                  <View style={styles.lineLocationIcon}>
                    <Ionicons
                      name="radio-button-on"
                      size={20}
                      color="#2e7d32"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lineLocationLabel}>
                      Starting Location
                    </Text>
                    {startLocation ? (
                      <Text
                        style={styles.lineLocationAddress}
                        numberOfLines={2}
                      >
                        {startLocation.address}
                      </Text>
                    ) : (
                      <Text style={styles.lineLocationEmpty}>
                        Not pinned yet
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.pinBtn, { backgroundColor: "#2e7d32" }]}
                    onPress={() => openMapPicker("start")}
                  >
                    <Ionicons name="map" size={14} color="#fff" />
                    <Text style={styles.pinBtnText}>
                      {startLocation ? "Change" : "Pin"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.lineConnector} />

                <View style={styles.lineLocationRow}>
                  <View style={styles.lineLocationIcon}>
                    <Ionicons name="location" size={20} color="#c62828" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lineLocationLabel}>
                      Ending Location
                    </Text>
                    {endLocation ? (
                      <Text
                        style={styles.lineLocationAddress}
                        numberOfLines={2}
                      >
                        {endLocation.address}
                      </Text>
                    ) : (
                      <Text style={styles.lineLocationEmpty}>
                        Not pinned yet
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.pinBtn, { backgroundColor: "#c62828" }]}
                    onPress={() => openMapPicker("end")}
                  >
                    <Ionicons name="map" size={14} color="#fff" />
                    <Text style={styles.pinBtnText}>
                      {endLocation ? "Change" : "Pin"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {startLocation && endLocation && (
                  <View style={styles.linePreview}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#2e7d32"
                    />
                    <Text style={styles.linePreviewText}>
                      Route pinned: {startLocation.address?.split(",")[0]} →{" "}
                      {endLocation.address?.split(",")[0]}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              /* OTHER HAZARDS — Single pin */
              <TouchableOpacity
                style={[
                  styles.locationPickerBtn,
                  location && styles.locationPickerBtnSet,
                ]}
                onPress={() => openMapPicker("single")}
              >
                <Ionicons
                  name="map"
                  size={20}
                  color={location ? "#fff" : "#1565c0"}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  {location ? (
                    <>
                      <Text style={styles.locationPickerSetLabel}>
                        📍 Location Pinned
                      </Text>
                      <Text
                        style={styles.locationPickerSetAddr}
                        numberOfLines={2}
                      >
                        {location.address}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.locationPickerLabel}>
                      Tap to open map and pin location
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={location ? "#fff" : "#1565c0"}
                />
              </TouchableOpacity>
            )}

            {/* Step 4 — Description */}
            <Text style={styles.stepLabel}>Step 4 — Description</Text>
            <TextInput
              style={styles.descInput}
              placeholder={`Describe the ${selected.type.toLowerCase()} in detail...`}
              placeholderTextColor="#aaa"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: selected.color }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitEmoji}>{selected.emoji}</Text>
                  <Text style={styles.submitBtnText}>
                    Submit {selected.type} Report
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Map Picker Modal */}
      <MapPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationPicked={handleLocationPicked}
        title={
          mapPickerMode === "start"
            ? "📍 Pin Starting Location"
            : mapPickerMode === "end"
              ? "📍 Pin Ending Location"
              : "📍 Pin Hazard Location"
        }
        existingPin={
          mapPickerMode === "start"
            ? startLocation
            : mapPickerMode === "end"
              ? endLocation
              : location
        }
        secondPin={
          mapPickerMode === "end"
            ? startLocation
            : mapPickerMode === "start"
              ? endLocation
              : null
        }
      />
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
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "#90caf9", fontSize: 11, marginTop: 1 },
  scroll: { flex: 1 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1565c0",
  },
  infoText: { flex: 1, fontSize: 13, color: "#1565c0", lineHeight: 18 },
  stepLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 10,
    marginTop: 4,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    elevation: 2,
  },
  typeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  typeHint: { fontSize: 9, color: "#888", marginTop: 2 },
  severityRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  severityBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  severityDot: { width: 10, height: 10, borderRadius: 5 },
  severityText: { fontSize: 13, fontWeight: "700", color: "#444" },
  lineLocationBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  lineLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lineLocationIcon: { width: 28, alignItems: "center" },
  lineLocationLabel: { fontSize: 12, fontWeight: "700", color: "#555" },
  lineLocationAddress: { fontSize: 12, color: "#333", marginTop: 2 },
  lineLocationEmpty: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
    fontStyle: "italic",
  },
  lineConnector: {
    width: 2,
    height: 24,
    backgroundColor: "#e0e0e0",
    marginLeft: 13,
    marginVertical: 4,
  },
  pinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pinBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  linePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "#e8f5e9",
    padding: 10,
    borderRadius: 8,
  },
  linePreviewText: {
    flex: 1,
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "600",
  },
  locationPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#1565c0",
    marginBottom: 20,
    elevation: 2,
  },
  locationPickerBtnSet: { backgroundColor: "#1565c0", borderColor: "#1565c0" },
  locationPickerLabel: { fontSize: 14, color: "#1565c0", fontWeight: "600" },
  locationPickerSetLabel: { fontSize: 12, color: "#fff", fontWeight: "700" },
  locationPickerSetAddr: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  descInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#333",
    borderWidth: 1.5,
    borderColor: "#e3f2fd",
    minHeight: 100,
    marginBottom: 20,
    elevation: 1,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  submitEmoji: { fontSize: 20 },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    backgroundColor: "#1565c0",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  modalBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  modalTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
});

export default ReportScreen;
