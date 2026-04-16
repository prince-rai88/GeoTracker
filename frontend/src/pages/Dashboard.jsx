import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import Sidebar from "../components/Sidebar";
import { getLocations, getDashboardStats, createLocation } from "../api/locationApi";
import "../styles/dashboard.css";
import "leaflet/dist/leaflet.css";

// Fix broken default marker icons in Vite/bundler environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─── Mini icon components ─── */
const PinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const CalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
);

function Dashboard() {
  const [locations,   setLocations]   = useState([]);
  const [stats,       setStats]       = useState({ total: 0, lastUpdated: "" });
  const [currentPos,  setCurrentPos]  = useState(null);
  const [isTracking,  setIsTracking]  = useState(false);
  const [loading,     setLoading]     = useState(true);
  const watchRef = useRef(null);

  const loadData = async () => {
    try {
      const [locs, stat] = await Promise.all([getLocations(), getDashboardStats()]);
      setLocations(locs);
      setStats(stat);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (isTracking && navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        async ({ coords: { latitude, longitude } }) => {
          setCurrentPos([latitude, longitude]);
          await createLocation({ name: "Live Device", latitude, longitude });
          loadData();
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [isTracking]);

  const mapCenter = currentPos
    || (locations[0] ? [locations[0].latitude, locations[0].longitude] : [20, 77]);

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        {/* ── Topbar ── */}
        <header className="topbar">
          <div>
            <div className="topbar-title">Dashboard</div>
            <div className="topbar-subtitle">Real-time location tracking overview</div>
          </div>

          <button
            className={`btn-track ${isTracking ? "stop" : "start"}`}
            onClick={() => setIsTracking(t => !t)}
          >
            {isTracking
              ? <><span className="live-dot" /> Stop Tracking</>
              : <><PlayIcon /> Start Tracking</>
            }
          </button>
        </header>

        <div className="page-content">

          {/* ── Stat Cards ── */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><PinIcon /></div>
              <div className="stat-label">Total Locations</div>
              <div className="stat-value">{loading ? "—" : stats.total}</div>
              <div className="stat-sub">Recorded data points</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><ActivityIcon /></div>
              <div className="stat-label">Status</div>
              <div className="stat-value" style={{ marginTop: "6px" }}>
                {isTracking
                  ? <span className="badge badge-success">● Active</span>
                  : <span className="badge badge-warning">○ Idle</span>
                }
              </div>
              <div className="stat-sub">Tracking state</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><CalIcon /></div>
              <div className="stat-label">Last Updated</div>
              <div className="stat-value" style={{ fontSize: "15px", fontWeight: 600, marginTop: "8px" }}>
                {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : "—"}
              </div>
              <div className="stat-sub">
                {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : "No data yet"}
              </div>
            </div>
          </div>

          {/* ── Map ── */}
          <div className="map-section">
            <div className="map-header">
              <span className="map-title">📡 Live Map</span>
              {locations.length > 0 && (
                <span className="badge badge-purple">{locations.length} points</span>
              )}
            </div>

            <div style={{ height: "54vh" }}>
              {loading ? (
                <div className="loading-dots" style={{ height: "100%", alignItems: "center" }}>
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                </div>
              ) : (
                <MapContainer center={mapCenter} zoom={5} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />

                  {locations.map((loc) => (
                    <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                      <Popup>
                        <strong>{loc.name}</strong><br />
                        {new Date(loc.created_at).toLocaleString()}
                      </Popup>
                    </Marker>
                  ))}

                  {locations.length > 1 && (
                    <Polyline
                      positions={locations.map(l => [l.latitude, l.longitude])}
                      pathOptions={{ color: "#7c3aed", weight: 2.5, opacity: 0.7 }}
                    />
                  )}

                  {currentPos && (
                    <Marker position={currentPos}>
                      <Popup>📍 Current Location</Popup>
                    </Marker>
                  )}
                </MapContainer>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
