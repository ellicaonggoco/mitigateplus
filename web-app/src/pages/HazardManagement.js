import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

const EMOJI_MAP = {
  Flood: "💧",
  "Fire Hazard": "🔥",
  Landslide: "⛰️",
  "Fault Line": "⚡",
  "Drainage Issue": "🚧",
  "Structural Damage": "🏚️",
  Other: "⚠️",
};

const MANILA = {
  lat: 14.5995,
  lng: 120.9842,
  zoom: 13,
  minZoom: 13,
  bounds: { minLat: 14.55, maxLat: 14.64, minLng: 120.96, maxLng: 121.02 },
};

const HazardManagement = () => {
  const [tab, setTab] = useState("map");
  const [reports, setReports] = useState([]);
  const [zones, setZones] = useState([]);
  const [reportFilter, setReportFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [zoneForm, setZoneForm] = useState({
    name: "",
    type: "",
    riskLevel: "low",
    description: "",
    lat: "",
    lng: "",
    radius: 400,
  });
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [quickZone, setQuickZone] = useState({
    name: "",
    type: "",
    riskLevel: "low",
    radius: 400,
  });
  const [editingZone, setEditingZone] = useState(null);
  const iframeRef = useRef(null);

  const fetchAll = async () => {
    try {
      const [r, h] = await Promise.all([
        API.get("/reports"),
        API.get("/hazards"),
      ]);
      setReports(r.data);
      setZones(h.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.lat && data.lng && !data.type) {
          setClickedLocation({ lat: data.lat, lng: data.lng });
          setTab("map");
        }
        if (data.type === "resize" && data.id && data.radius) {
          updateZoneRadius(data.id, data.radius);
        }
      } catch (e) {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [zones]);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/reports/${id}/status`, { status });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Remove this report?")) return;
    try {
      await API.delete(`/reports/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const addZone = async () => {
    if (!zoneForm.name || !zoneForm.type) {
      alert("Please fill in name and type");
      return;
    }
    try {
      const coordinates =
        zoneForm.lat && zoneForm.lng
          ? [{ lat: parseFloat(zoneForm.lat), lng: parseFloat(zoneForm.lng) }]
          : [];
      await API.post("/hazards", {
        ...zoneForm,
        radius: parseInt(zoneForm.radius),
        coordinates,
      });
      setZoneForm({
        name: "",
        type: "",
        riskLevel: "low",
        description: "",
        lat: "",
        lng: "",
        radius: 400,
      });
      setShowZoneForm(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteZone = async (id) => {
    if (!window.confirm("Delete this hazard zone?")) return;
    try {
      await API.delete(`/hazards/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const updateZoneRadius = async (id, radius) => {
    try {
      await API.put(`/hazards/${id}`, { radius: parseInt(radius) });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAddZone = async () => {
    if (!quickZone.name || !quickZone.type) {
      alert("Please fill in name and type");
      return;
    }
    try {
      await API.post("/hazards", {
        name: quickZone.name,
        type: quickZone.type,
        riskLevel: quickZone.riskLevel,
        radius: parseInt(quickZone.radius),
        coordinates: [{ lat: clickedLocation.lat, lng: clickedLocation.lng }],
        description: `Manually placed by admin at ${new Date().toLocaleString()}`,
      });
      setClickedLocation(null);
      setQuickZone({ name: "", type: "", riskLevel: "low", radius: 400 });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const getZoneColor = (level) => {
    if (level === "high") return "#c62828";
    if (level === "moderate") return "#f57c00";
    return "#2e7d32";
  };

  const radiusLabels = (r) => {
    if (r <= 80) return "Small";
    if (r <= 300) return "Medium";
    if (r <= 500) return "Large";
    if (r <= 900) return "Very Large";
    if (r <= 1000) return "Extra Large";
    return "Massive";
  };

  const validatedReports = reports.filter((r) => r.status === "validated");

  const buildMapHTML = () => {
    const zonesJS = zones
      .filter((z) => z.coordinates?.length > 0)
      .map(
        (z, idx) => `
        (function() {
          var circle${idx} = L.circle([${z.coordinates[0].lat}, ${z.coordinates[0].lng}], {
            color: '${getZoneColor(z.riskLevel)}',
            fillColor: '${getZoneColor(z.riskLevel)}',
            fillOpacity: 0.25,
            radius: ${z.radius || 400},
            weight: 3
          }).addTo(map);

          circle${idx}.bindPopup(
            '<div style="font-family:sans-serif;min-width:160px">' +
            '<b style="color:${getZoneColor(z.riskLevel)}">⚠️ ${z.name}</b><br>' +
            'Type: ${z.type}<br>' +
            'Risk: <b>${z.riskLevel?.toUpperCase()}</b><br>' +
            'Radius: <b>${z.radius || 400}m</b><br><br>' +
            '<span style="font-size:11px;color:#888">🖱️ Hover circle border to resize</span>' +
            '</div>'
          );

          var edgeLat${idx} = ${z.coordinates[0].lat};
          var edgeLng${idx} = ${z.coordinates[0].lng} + (${z.radius || 400} / 111320 / Math.cos(${z.coordinates[0].lat} * Math.PI / 180));

          var handle${idx} = L.marker([edgeLat${idx}, edgeLng${idx}], {
            icon: L.divIcon({
              html: '<div style="width:18px;height:18px;background:${getZoneColor(z.riskLevel)};border:3px solid white;border-radius:50%;cursor:ew-resize;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
              className: '',
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            }),
            draggable: true,
            zIndexOffset: 1000
          }).addTo(map);

          handle${idx}.on('drag', function(e) {
            var center = circle${idx}.getLatLng();
            var handlePos = e.latlng;
            var newRadius = map.distance(center, handlePos);
            radius: ${Math.max(10, z.radius || 400)},
            circle${idx}.setRadius(newRadius);
            handle${idx}.bindTooltip(
              '📏 ' + Math.round(newRadius) + 'm',
              { permanent: true, direction: 'right', className: 'radius-tooltip' }
            ).openTooltip();
            document.getElementById('resizeHint').style.display = 'block';
          });

          handle${idx}.on('dragend', function(e) {
            var center = circle${idx}.getLatLng();
            var handlePos = handle${idx}.getLatLng();
            var finalRadius = Math.round(map.distance(center, handlePos));
            finalRadius = Math.max(100, Math.min(3000, finalRadius));
            window.parent.postMessage(
              JSON.stringify({ type: 'resize', id: '${z._id}', radius: finalRadius }), '*'
            );
            handle${idx}.bindTooltip(
              '📏 ' + finalRadius + 'm ✓ Saved!',
              { permanent: true, direction: 'right', className: 'radius-tooltip' }
            ).openTooltip();
            document.getElementById('resizeHint').style.display = 'none';
            setTimeout(() => handle${idx}.closeTooltip(), 2000);
          });

          circle${idx}.on('mouseover', function() { handle${idx}.setOpacity(1); });
          circle${idx}.on('mouseout', function() { handle${idx}.setOpacity(0.3); });
          handle${idx}.setOpacity(0.3);
        })();
      `,
      )
      .join("");

    const reportsJS = validatedReports
      .filter((r) => r.location?.lat && r.location?.lng)
      .map((r, i) => {
        const emoji = r.emoji || EMOJI_MAP[r.type] || "⚠️";
        const safeDesc = (r.description || "")
          .slice(0, 80)
          .replace(/'/g, "")
          .replace(/\n/g, " ");
        const safeAddr = (r.location?.address || "Manila").replace(/'/g, "");
        return `
          var icon${i} = L.divIcon({
            html: '<div style="font-size:28px;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.4))">${emoji}</div>',
            className: '', iconSize: [36,36], iconAnchor: [18,18], popupAnchor: [0,-18]
          });
          L.marker([${r.location.lat}, ${r.location.lng}], { icon: icon${i} })
            .addTo(map)
            .bindPopup(
              '<div style="font-family:sans-serif;min-width:180px">' +
              '<b style="font-size:15px">${emoji} ${r.type}</b><br>' +
              '<span style="font-size:11px;padding:2px 8px;border-radius:8px;background:${r.severity === "high" ? "#ffebee" : "#fff3e0"};color:${r.severity === "high" ? "#c62828" : "#e65100"}">${(r.severity || "moderate").toUpperCase()}</span><br><br>' +
              '<b>📍</b> ${safeAddr}<br><br>' +
              '${safeDesc}<br><br>' +
              '<span style="color:#2e7d32;font-size:11px">✅ Verified by LGU</span>' +
              '</div>'
            );
        `;
      })
      .join("");

    return `<!DOCTYPE html>
    <html><head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        html,body,#map { width:100%; height:100%; }
        #map { cursor: crosshair; }
        .legend {
          position:absolute; bottom:20px; right:10px;
          background:rgba(255,255,255,0.95); padding:10px 14px;
          border-radius:10px; z-index:1000;
          box-shadow:0 2px 8px rgba(0,0,0,0.2);
          font-family:sans-serif; font-size:12px;
        }
        .legend b { display:block; margin-bottom:6px; }
        .row { display:flex; align-items:center; margin:3px 0; gap:6px; }
        .dot { width:11px; height:11px; border-radius:50%; flex-shrink:0; }
        .click-hint {
          position:absolute; top:10px; left:50%; transform:translateX(-50%);
          background:rgba(25,118,210,0.9); color:white; padding:6px 16px;
          border-radius:20px; font-size:12px; z-index:1000;
          font-family:sans-serif; pointer-events:none; white-space:nowrap;
        }
        .radius-tooltip {
          background: rgba(0,0,0,0.75) !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
          box-shadow: none !important;
        }
        .radius-tooltip::before { display:none !important; }
        .resize-hint {
          position:absolute; bottom:70px; left:50%; transform:translateX(-50%);
          background:rgba(0,0,0,0.65); color:white; padding:5px 14px;
          border-radius:16px; font-size:11px; z-index:1000;
          font-family:sans-serif; pointer-events:none; white-space:nowrap;
          display:none;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="click-hint">📍 Click map to place zone &nbsp;|&nbsp; 🔵 Drag circle border to resize</div>
      <div class="resize-hint" id="resizeHint">📏 Dragging... release to save</div>
      <div class="legend">
        <b>🗺️ Legend</b>
        <div class="row"><div class="dot" style="background:#c62828"></div>High Risk Zone</div>
        <div class="row"><div class="dot" style="background:#f57c00"></div>Moderate Risk Zone</div>
        <div class="row"><div class="dot" style="background:#2e7d32"></div>Low Risk Zone</div>
        <div class="row">💧 Flood &nbsp; 🔥 Fire &nbsp; ⛰️ Landslide</div>
        <div class="row">⚡ Fault &nbsp; 🚧 Drainage &nbsp; ⚠️ Other</div>
      </div>
      <script>
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
          attribution: '© OpenStreetMap', maxZoom: 18
        }).addTo(map);

        var clickMarker = null;
        map.on('click', function(e) {
          if (clickMarker) map.removeLayer(clickMarker);
          clickMarker = L.marker(e.latlng, {
            icon: L.divIcon({
              html: '<div style="font-size:28px">📍</div>',
              className: '', iconSize: [30,30], iconAnchor: [15,30]
            })
          }).addTo(map);
          window.parent.postMessage(
            JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }), '*'
          );
        });

        ${zonesJS}
        ${reportsJS}
      </script>
    </body></html>`;
  };

  const filteredReports = reports.filter((r) => {
    const matchFilter = reportFilter === "all" || r.status === reportFilter;
    const matchSearch =
      !search ||
      r.type?.toLowerCase().includes(search.toLowerCase()) ||
      r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.address?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    validated: reports.filter((r) => r.status === "validated").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Hazard Management" />

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderTop: "4px solid #1976d2" }}>
            <div style={styles.statIcon}>🗺️</div>
            <div style={styles.statVal}>{zones.length}</div>
            <div style={styles.statLabel}>Hazard Zones</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #f57c00" }}>
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statVal}>{counts.pending}</div>
            <div style={styles.statLabel}>Pending Reports</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #2e7d32" }}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statVal}>{counts.validated}</div>
            <div style={styles.statLabel}>On Map</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #c62828" }}>
            <div style={styles.statIcon}>❌</div>
            <div style={styles.statVal}>{counts.rejected}</div>
            <div style={styles.statLabel}>Rejected</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: "map", label: "🗺️ Live Map" },
            { key: "reports", label: "🚨 Reports" },
            { key: "zones", label: "⚠️ Hazard Zones" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                ...styles.tab,
                ...(tab === t.key ? styles.tabActive : {}),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* MAP TAB */}
        {tab === "map" && (
          <div style={styles.mapBox}>
            <div style={styles.mapInfo}>
              <span>🟢 {counts.validated} validated reports on map</span>
              <span>⚠️ {zones.length} hazard zones</span>
              <span style={{ color: "#1976d2", fontSize: "12px" }}>
                💡 Click map to place zone | Hover circle then drag border to
                resize
              </span>
              <button onClick={fetchAll} style={styles.refreshBtn}>
                🔄 Refresh
              </button>
            </div>

            {clickedLocation && (
              <div style={styles.placeForm}>
                <span
                  style={{
                    fontWeight: "600",
                    color: "#1976d2",
                    whiteSpace: "nowrap",
                  }}
                >
                  📍 {clickedLocation.lat.toFixed(4)},{" "}
                  {clickedLocation.lng.toFixed(4)}
                </span>
                <input
                  style={{ ...styles.formInput, flex: 1, minWidth: "130px" }}
                  placeholder="Zone name *"
                  value={quickZone.name}
                  onChange={(e) =>
                    setQuickZone({ ...quickZone, name: e.target.value })
                  }
                />
                <input
                  style={{ ...styles.formInput, flex: 1, minWidth: "130px" }}
                  placeholder="Type (flood, fire...)"
                  value={quickZone.type}
                  onChange={(e) =>
                    setQuickZone({ ...quickZone, type: e.target.value })
                  }
                />
                <select
                  style={{ ...styles.formInput, minWidth: "130px" }}
                  value={quickZone.riskLevel}
                  onChange={(e) =>
                    setQuickZone({ ...quickZone, riskLevel: e.target.value })
                  }
                >
                  <option value="low">🟢 Low Risk</option>
                  <option value="moderate">🟡 Moderate Risk</option>
                  <option value="high">🔴 High Risk</option>
                  <option value="Fire">Fire</option>
                  <option value="Flood">Flood</option>
                  <option value="LandSlide">LandSlide</option>
                  <option value="Fault">Fault</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Other">Other</option>
                </select>
                <div style={styles.sliderBox}>
                  <label style={styles.sliderLabel}>
                    📏 Size: <b>{radiusLabels(quickZone.radius)}</b> (
                    {quickZone.radius}m)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="2000"
                    step="50"
                    value={quickZone.radius}
                    onChange={(e) =>
                      setQuickZone({ ...quickZone, radius: e.target.value })
                    }
                    style={styles.slider}
                  />
                  <div style={styles.sliderTicks}>
                    <span>Tiny</span>
                    <span>Small</span>
                    <span>Med</span>
                    <span>Large</span>
                    <span>Huge</span>
                  </div>
                </div>
                <button onClick={handleQuickAddZone} style={styles.saveBtn}>
                  📌 Place Zone
                </button>
                <button
                  onClick={() => setClickedLocation(null)}
                  style={{
                    ...styles.btn,
                    background: "#555",
                    padding: "8px 14px",
                    fontSize: "13px",
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            <iframe
              ref={iframeRef}
              srcDoc={buildMapHTML()}
              style={styles.map}
              title="Hazard Map"
            />
          </div>
        )}

        {/* REPORTS TAB */}
        {tab === "reports" && (
          <div style={styles.box}>
            <div style={styles.toolbar}>
              <input
                style={styles.search}
                placeholder="🔍 Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div style={styles.filterRow}>
                {["all", "pending", "validated", "rejected"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setReportFilter(f)}
                    style={{
                      ...styles.filterBtn,
                      background: reportFilter === f ? "#2e7d32" : "#f5f5f5",
                      color: reportFilter === f ? "#fff" : "#444",
                    }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)} (
                    {counts[f] ?? reports.length})
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Reporter</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Severity</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => (
                    <tr key={r._id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.typeCell}>
                          {r.emoji || EMOJI_MAP[r.type] || "⚠️"} {r.type}
                        </span>
                      </td>
                      <td style={styles.td}>{r.userId?.name || "N/A"}</td>
                      <td style={styles.td}>
                        <span title={r.description} style={styles.truncate}>
                          {r.description?.slice(0, 50)}...
                        </span>
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        📍{" "}
                        {r.location?.address ||
                          `${r.location?.lat?.toFixed(3)}, ${r.location?.lng?.toFixed(3)}`}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            background:
                              r.severity === "high"
                                ? "#ffebee"
                                : r.severity === "moderate"
                                  ? "#fff3e0"
                                  : "#e8f5e9",
                            color:
                              r.severity === "high"
                                ? "#c62828"
                                : r.severity === "moderate"
                                  ? "#e65100"
                                  : "#2e7d32",
                          }}
                        >
                          {r.severity || "N/A"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            background:
                              r.status === "validated"
                                ? "#e8f5e9"
                                : r.status === "rejected"
                                  ? "#ffebee"
                                  : "#fff3e0",
                            color:
                              r.status === "validated"
                                ? "#2e7d32"
                                : r.status === "rejected"
                                  ? "#c62828"
                                  : "#e65100",
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          {r.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateStatus(r._id, "validated")}
                                style={{ ...styles.btn, background: "#2e7d32" }}
                              >
                                ✓ Validate
                              </button>
                              <button
                                onClick={() => updateStatus(r._id, "rejected")}
                                style={{ ...styles.btn, background: "#c62828" }}
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                          {r.status === "validated" && (
                            <button
                              onClick={() => deleteReport(r._id)}
                              style={{ ...styles.btn, background: "#e65100" }}
                            >
                              🗺️ Remove
                            </button>
                          )}
                          <button
                            onClick={() => deleteReport(r._id)}
                            style={{ ...styles.btn, background: "#555" }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "#999",
                        }}
                      >
                        No reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HAZARD ZONES TAB */}
        {tab === "zones" && (
          <div style={styles.box}>
            <div style={styles.toolbar}>
              <h3 style={{ color: "#2e7d32", fontWeight: "600" }}>
                ⚠️ Hazard Zones
              </h3>
              <button
                onClick={() => setShowZoneForm(!showZoneForm)}
                style={styles.addBtn}
              >
                {showZoneForm ? "✕ Cancel" : "+ Add Zone"}
              </button>
            </div>

            {showZoneForm && (
              <div style={styles.form}>
                <input
                  style={styles.formInput}
                  placeholder="Zone Name *"
                  value={zoneForm.name}
                  onChange={(e) =>
                    setZoneForm({ ...zoneForm, name: e.target.value })
                  }
                />
                <input
                  style={styles.formInput}
                  placeholder="Type (flood, landslide...) *"
                  value={zoneForm.type}
                  onChange={(e) =>
                    setZoneForm({ ...zoneForm, type: e.target.value })
                  }
                />
                <select
                  style={styles.formInput}
                  value={zoneForm.riskLevel}
                  onChange={(e) =>
                    setZoneForm({ ...zoneForm, riskLevel: e.target.value })
                  }
                >
                  <option value="low">🟢 Low Risk</option>
                  <option value="moderate">🟡 Moderate Risk</option>
                  <option value="high">🔴 High Risk</option>
                </select>
                <input
                  style={styles.formInput}
                  placeholder="Description"
                  value={zoneForm.description}
                  onChange={(e) =>
                    setZoneForm({ ...zoneForm, description: e.target.value })
                  }
                />
                <input
                  style={styles.formInput}
                  placeholder="Latitude (e.g. 14.5995)"
                  value={zoneForm.lat}
                  onChange={(e) =>
                    setZoneForm({ ...zoneForm, lat: e.target.value })
                  }
                />
                <input
                  style={styles.formInput}
                  placeholder="Longitude (e.g. 120.9842)"
                  value={zoneForm.lng}
                  onChange={(e) =>
                    setZoneForm({ ...zoneForm, lng: e.target.value })
                  }
                />
                <div
                  style={{
                    ...styles.sliderBox,
                    flex: "1 1 100%",
                    background: "#f0f0f0",
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                >
                  <label style={styles.sliderLabel}>
                    📏 Zone Size: <b>{radiusLabels(zoneForm.radius)}</b> (
                    {zoneForm.radius}m)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={zoneForm.radius}
                    onChange={(e) =>
                      setZoneForm({ ...zoneForm, radius: e.target.value })
                    }
                    style={{ ...styles.slider, width: "100%" }}
                  />
                  <div style={styles.sliderTicks}>
                    <span>Tiny</span>
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                    <span>Huge</span>
                  </div>
                </div>
                <button onClick={addZone} style={styles.saveBtn}>
                  💾 Save Zone
                </button>
              </div>
            )}

            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Risk Level</th>
                  <th style={styles.th}>Coordinates</th>
                  <th style={styles.th}>Size (Radius)</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => (
                  <tr key={z._id} style={styles.tr}>
                    <td style={styles.td}>
                      <b>{z.name}</b>
                    </td>
                    <td style={styles.td}>{z.type}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            z.riskLevel === "high"
                              ? "#ffebee"
                              : z.riskLevel === "moderate"
                                ? "#fff3e0"
                                : "#e8f5e9",
                          color:
                            z.riskLevel === "high"
                              ? "#c62828"
                              : z.riskLevel === "moderate"
                                ? "#e65100"
                                : "#2e7d32",
                        }}
                      >
                        {z.riskLevel}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {z.coordinates?.length > 0
                        ? `${z.coordinates[0].lat?.toFixed(4)}, ${z.coordinates[0].lng?.toFixed(4)}`
                        : "—"}
                    </td>
                    <td style={styles.td}>
                      {editingZone === z._id ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            minWidth: "180px",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "#666" }}>
                            {radiusLabels(z.radius || 400)} ({z.radius || 400}m)
                          </span>
                          <input
                            type="range"
                            min="100"
                            max="2000"
                            step="50"
                            defaultValue={z.radius || 400}
                            onChange={(e) => {
                              const updated = zones.map((zone) =>
                                zone._id === z._id
                                  ? {
                                      ...zone,
                                      radius: parseInt(e.target.value),
                                    }
                                  : zone,
                              );
                              setZones(updated);
                            }}
                            style={{
                              width: "150px",
                              accentColor: getZoneColor(z.riskLevel),
                            }}
                          />
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => {
                                updateZoneRadius(z._id, z.radius);
                                setEditingZone(null);
                              }}
                              style={{
                                ...styles.btn,
                                background: "#2e7d32",
                                fontSize: "10px",
                              }}
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingZone(null);
                                fetchAll();
                              }}
                              style={{
                                ...styles.btn,
                                background: "#555",
                                fontSize: "10px",
                              }}
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontSize: "13px" }}>
                            {radiusLabels(z.radius || 400)}
                            <br />
                            <span style={{ color: "#888", fontSize: "11px" }}>
                              {z.radius || 400}m
                            </span>
                          </span>
                          <button
                            onClick={() => setEditingZone(z._id)}
                            style={{
                              ...styles.btn,
                              background: "#1976d2",
                              fontSize: "10px",
                            }}
                          >
                            📏 Resize
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>{z.description || "—"}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => deleteZone(z._id)}
                        style={{ ...styles.btn, background: "#c62828" }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {zones.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#999",
                      }}
                    >
                      No hazard zones yet. Add one using the map or the form
                      above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex" },
  main: { marginLeft: "240px", padding: "24px", flex: 1, minHeight: "100vh" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  statIcon: { fontSize: "28px", marginBottom: "6px" },
  statVal: { fontSize: "28px", fontWeight: "700", color: "#333" },
  statLabel: { fontSize: "13px", color: "#666", marginTop: "4px" },
  tabs: {
    display: "flex",
    gap: "4px",
    marginBottom: "16px",
    background: "#fff",
    padding: "6px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tab: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    background: "transparent",
    color: "#666",
  },
  tabActive: { background: "#2e7d32", color: "#fff" },
  mapBox: {
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  mapInfo: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    fontSize: "13px",
    color: "#555",
    flexWrap: "wrap",
  },
  refreshBtn: {
    marginLeft: "auto",
    padding: "6px 14px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  placeForm: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "#e3f2fd",
    borderBottom: "1px solid #bbdefb",
    flexWrap: "wrap",
    fontSize: "13px",
  },
  sliderBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "200px",
  },
  sliderLabel: { fontSize: "12px", color: "#444", fontWeight: "500" },
  slider: { width: "180px", accentColor: "#1976d2", cursor: "pointer" },
  sliderTicks: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#888",
    width: "180px",
  },
  map: { width: "100%", height: "550px", border: "none" },
  box: {
    background: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
    flexWrap: "wrap",
  },
  search: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    flex: 1,
    minWidth: "200px",
  },
  filterRow: { display: "flex", gap: "6px", flexWrap: "wrap" },
  filterBtn: {
    padding: "7px 14px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  addBtn: {
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  form: {
    background: "#f9f9f9",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "16px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  formInput: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    flex: "1 1 180px",
  },
  saveBtn: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f5f5f5" },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    color: "#666",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "12px", fontSize: "14px", verticalAlign: "middle" },
  typeCell: { fontWeight: "500" },
  truncate: {
    display: "block",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  actions: { display: "flex", gap: "4px", flexWrap: "wrap" },
  btn: {
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "500",
  },
};

export default HazardManagement;
