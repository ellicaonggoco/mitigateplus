import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";

const MANILA = {
  lat: 14.5995,
  lng: 120.9842,
  zoom: 13,
  minZoom: 13,
  bounds: { minLat: 14.55, maxLat: 14.64, minLng: 120.96, maxLng: 121.02 },
};

const HAZARD_ICONS = {
  Flood: "💧",
  "Fire Hazard": "🔥",
  Landslide: "⛰️",
  "Fault Line": "⚡",
  "Drainage Issue": "🚧",
  "Structural Damage": "🏚️",
  Other: "⚠️",
};

// Valley Fault System Coordinates
const WEST_VALLEY_FAULT = [
  [14.64, 121.01],
  [14.62, 121.005],
  [14.6, 120.998],
  [14.58, 120.992],
  [14.56, 120.987],
  [14.54, 120.982],
  [14.52, 120.978],
  [14.5, 120.975],
];

const EAST_VALLEY_FAULT = [
  [14.64, 121.08],
  [14.62, 121.07],
  [14.6, 121.06],
  [14.58, 121.05],
  [14.56, 121.04],
  [14.54, 121.03],
];

const MapScreen = () => {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const webViewRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesRes, reportsRes] = await Promise.all([
          API.get("/hazards"),
          API.get("/reports/validated"),
        ]);
        setZones(zonesRes.data);
        setReports(reportsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getZoneColor = (level) => {
    if (level === "high") return "#c62828";
    if (level === "moderate") return "#f57c00";
    return "#2e7d32";
  };

  const buildHTML = () => {
    const showZones = filter === "all" || filter === "zones";
    const showReports = filter === "all" || filter === "reports";
    const showFaults = filter === "all" || filter === "faults";

    // Fault Lines JS
    const faultLinesJS = showFaults
      ? `
      // West Valley Fault Line
      var wvf = L.polyline(${JSON.stringify(WEST_VALLEY_FAULT)}, {
        color: '#7b1fa2',
        weight: 5,
        opacity: 0.9,
        dashArray: '12, 6',
      }).addTo(map);
      wvf.bindPopup(
        '<div style="font-family:sans-serif;min-width:200px">' +
        '<b style="color:#7b1fa2;font-size:14px">⚡ West Valley Fault</b><br>' +
        '<span style="font-size:12px;color:#555">Valley Fault System — Manila</span><br><br>' +
        '<span style="background:#ffebee;color:#c62828;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:bold">⚠️ HIGH SEISMIC RISK ZONE</span><br><br>' +
        '<span style="font-size:11px;color:#555">Areas within 5km are at significant earthquake risk. Ensure your home is earthquake-resistant and have an evacuation plan ready.</span>' +
        '</div>'
      );

      // West Valley Fault danger buffer (5km)
      ${WEST_VALLEY_FAULT.map(
        (coord, i) => `
        L.circle([${coord[0]}, ${coord[1]}], {
          color: '#7b1fa2',
          fillColor: '#7b1fa2',
          fillOpacity: 0.04,
          radius: 1500,
          weight: 0,
          interactive: false
        }).addTo(map);
      `,
      ).join("")}

      // East Valley Fault Line
      var evf = L.polyline(${JSON.stringify(EAST_VALLEY_FAULT)}, {
        color: '#ad1457',
        weight: 5,
        opacity: 0.9,
        dashArray: '12, 6',
      }).addTo(map);
      evf.bindPopup(
        '<div style="font-family:sans-serif;min-width:200px">' +
        '<b style="color:#ad1457;font-size:14px">⚡ East Valley Fault</b><br>' +
        '<span style="font-size:12px;color:#555">Valley Fault System — Metro Manila</span><br><br>' +
        '<span style="background:#ffebee;color:#c62828;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:bold">⚠️ HIGH SEISMIC RISK ZONE</span><br><br>' +
        '<span style="font-size:11px;color:#555">Areas within 5km are at significant earthquake risk. Prepare your home for seismic activity.</span>' +
        '</div>'
      );

      // East Valley Fault danger buffer (5km)
      ${EAST_VALLEY_FAULT.map(
        (coord, i) => `
        L.circle([${coord[0]}, ${coord[1]}], {
          color: '#ad1457',
          fillColor: '#ad1457',
          fillOpacity: 0.04,
          radius: 1500,
          weight: 0,
          interactive: false
        }).addTo(map);
      `,
      ).join("")}

      // Fault line labels
      L.marker([14.60, 120.9980], {
        icon: L.divIcon({
          html: '<div style="background:#7b1fa2;color:white;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.3)">⚡ W. Valley Fault</div>',
          className: '',
          iconAnchor: [60, 10]
        }),
        interactive: false
      }).addTo(map);

      L.marker([14.60, 121.0600], {
        icon: L.divIcon({
          html: '<div style="background:#ad1457;color:white;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.3)">⚡ E. Valley Fault</div>',
          className: '',
          iconAnchor: [60, 10]
        }),
        interactive: false
      }).addTo(map);
    `
      : "";

    // Hazard Zones JS
    const zonesJS = showZones
      ? zones
          .filter((z) => z.coordinates?.length > 0)
          .map((z) => {
            const isFlood =
              z.type?.toLowerCase().includes("flood") ||
              z.type?.toLowerCase().includes("drainage");

            if (isFlood && z.coordinates.length >= 2) {
              const latlngs = z.coordinates
                .map((c) => `[${c.lat},${c.lng}]`)
                .join(",");
              return `
                L.polyline([${latlngs}], {
                  color: '${getZoneColor(z.riskLevel)}',
                  weight: 8,
                  opacity: 0.75,
                  dashArray: '10,5'
                }).addTo(map).bindPopup(
                  '<div style="font-family:sans-serif;min-width:160px">' +
                  '<b style="color:${getZoneColor(z.riskLevel)}">💧 ${z.name}</b><br>' +
                  'Type: ${z.type}<br>' +
                  'Risk: <b>${z.riskLevel?.toUpperCase()}</b><br>' +
                  '<span style="font-size:11px;color:#555">Flood path — dashed line indicates flood route</span>' +
                  '</div>'
                );
              `;
            }

            return `
              L.circle([${z.coordinates[0].lat}, ${z.coordinates[0].lng}], {
                color: '${getZoneColor(z.riskLevel)}',
                fillColor: '${getZoneColor(z.riskLevel)}',
                fillOpacity: 0.25,
                radius: ${Math.max(10, z.radius || 400)},
                weight: 2
              }).addTo(map).bindPopup(
                '<div style="font-family:sans-serif;min-width:160px">' +
                '<b style="color:${getZoneColor(z.riskLevel)}">⚠️ ${z.name}</b><br>' +
                'Type: ${z.type}<br>' +
                'Risk: <b>${z.riskLevel?.toUpperCase()}</b><br>' +
                'Radius: <b>${Math.max(10, z.radius || 400)}m</b>' +
                '</div>'
              );
            `;
          })
          .join("")
      : "";

    // Validated Reports JS
    const reportsJS = showReports
      ? reports
          .filter((r) => r.location?.lat && r.location?.lng)
          .map((r, i) => {
            const emoji = r.emoji || HAZARD_ICONS[r.type] || "⚠️";
            const safeDesc = (r.description || "")
              .slice(0, 80)
              .replace(/'/g, "")
              .replace(/\n/g, " ");
            const safeAddr = (r.location?.address || "Manila").replace(
              /'/g,
              "",
            );
            const sevColor =
              r.severity === "high"
                ? "#c62828"
                : r.severity === "moderate"
                  ? "#e65100"
                  : "#2e7d32";
            const sevBg =
              r.severity === "high"
                ? "#ffebee"
                : r.severity === "moderate"
                  ? "#fff3e0"
                  : "#e8f5e9";
            return `
              var icon${i} = L.divIcon({
                html: '<div style="font-size:28px;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.4))">${emoji}</div>',
                className: "",
                iconSize: [36, 36],
                iconAnchor: [18, 18],
                popupAnchor: [0, -18]
              });
              L.marker([${r.location.lat}, ${r.location.lng}], { icon: icon${i} })
                .addTo(map)
                .bindPopup(
                  '<div style="font-family:sans-serif;min-width:180px">' +
                  '<b style="font-size:14px">${emoji} ${r.type}</b><br>' +
                  '<span style="background:${sevBg};color:${sevColor};padding:2px 8px;border-radius:8px;font-size:11px;font-weight:bold">' +
                  '${(r.severity || "moderate").toUpperCase()}</span><br><br>' +
                  '📍 <span style="font-size:12px">${safeAddr}</span><br>' +
                  '<span style="font-size:12px;color:#555">${safeDesc}</span><br><br>' +
                  '<span style="color:#2e7d32;font-size:11px">✅ Verified by LGU</span>' +
                  '</div>'
                );
            `;
          })
          .join("")
      : "";

    return `<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body, #map { width:100%; height:100vh; overflow:hidden; }
        .legend {
          position:fixed; bottom:16px; right:10px;
          background:rgba(255,255,255,0.97);
          padding:10px 14px; border-radius:12px; z-index:9999;
          box-shadow:0 2px 12px rgba(0,0,0,0.15);
          font-family:sans-serif; font-size:12px; max-width:190px;
        }
        .legend b { display:block; margin-bottom:6px; color:#1565c0; font-size:13px; }
        .row { display:flex; align-items:center; margin:4px 0; gap:7px; }
        .dot { width:11px; height:11px; border-radius:50%; flex-shrink:0; }
        .dline { width:22px; height:3px; border-top:3px dashed; flex-shrink:0; }
      </style>
    </head><body>
      <div id="map"></div>
      <div class="legend">
        <b>🗺️ Map Legend</b>
        <div class="row"><div class="dot" style="background:#c62828"></div>High Risk Zone</div>
        <div class="row"><div class="dot" style="background:#f57c00"></div>Moderate Risk Zone</div>
        <div class="row"><div class="dot" style="background:#2e7d32"></div>Low Risk Zone</div>
        <div class="row"><div class="dline" style="border-color:#1565c0"></div>Flood Path</div>
        <div class="row"><div class="dline" style="border-color:#7b1fa2"></div>W. Valley Fault</div>
        <div class="row"><div class="dline" style="border-color:#ad1457"></div>E. Valley Fault</div>
        <div class="row" style="font-size:11px;color:#888;margin-top:4px">Tap any marker for details</div>
      </div>
      <script>
        try {
          var bounds = L.latLngBounds(
            L.latLng(${MANILA.bounds.minLat}, ${MANILA.bounds.minLng}),
            L.latLng(${MANILA.bounds.maxLat}, ${MANILA.bounds.maxLng})
          );
          var map = L.map('map', {
            center: [${MANILA.lat}, ${MANILA.lng}],
            zoom: ${MANILA.zoom},
            minZoom: ${MANILA.minZoom},
            maxZoom: 18,
            maxBounds: bounds,
            maxBoundsViscosity: 1.0
          });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 18
          }).addTo(map);

          ${faultLinesJS}
          ${zonesJS}
          ${reportsJS}

        } catch(e) {
          document.body.innerHTML = '<p style="padding:20px;color:red;font-family:sans-serif">Map Error: ' + e.message + '</p>';
        }
      </script>
    </body></html>`;
  };

  const filters = [
    { key: "all", label: "All", icon: "layers" },
    { key: "zones", label: "Zones", icon: "warning" },
    { key: "reports", label: "Reports", icon: "alert-circle" },
    { key: "faults", label: "Faults", icon: "pulse" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="map" size={22} color="#fff" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Hazard Map</Text>
          <Text style={styles.headerSub}>City of Manila</Text>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              filter === f.key && styles.filterBtnActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Ionicons
              name={f.icon}
              size={14}
              color={filter === f.key ? "#fff" : "#1565c0"}
            />
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ marginLeft: "auto" }}>
          <Text style={styles.countText}>
            {zones.length} zones · {reports.length} reports
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1565c0" />
          <Text style={styles.loadingText}>Loading Manila hazard map...</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: buildHTML() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          mixedContentMode="always"
        />
      )}
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
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "#90caf9", fontSize: 11, marginTop: 1 },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e3f2fd",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#1565c0",
    backgroundColor: "#f0f4ff",
  },
  filterBtnActive: { backgroundColor: "#1565c0", borderColor: "#1565c0" },
  filterText: { fontSize: 11, color: "#1565c0", fontWeight: "600" },
  filterTextActive: { color: "#fff" },
  countText: { fontSize: 11, color: "#888" },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "#666", fontSize: 14 },
  map: { flex: 1 },
});

export default MapScreen;
