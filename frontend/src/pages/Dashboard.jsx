import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";

import {
  getLocations,
  getDashboardStats,
  createLocation
} from "../api/locationApi";

import "../styles/dashboard.css";
import "leaflet/dist/leaflet.css";

function Dashboard() {

  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState({ total: 0, lastUpdated: "" });
  const [currentPos, setCurrentPos] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const watchRef = useRef(null);

  // LOAD DATA
  const loadData = async () => {
    try {
      const locs = await getLocations();
      const stat = await getDashboardStats();

      setLocations(locs);
      setStats(stat);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // TRACKING
  useEffect(() => {

    if (isTracking && navigator.geolocation) {

      watchRef.current = navigator.geolocation.watchPosition(
        async (pos) => {

          const { latitude, longitude } = pos.coords;

          setCurrentPos([latitude, longitude]);

          await createLocation({
            name: "Live Device",
            latitude,
            longitude
          });

          loadData(); // ⭐ refresh UI

        },
        (err) => console.log(err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchRef.current)
        navigator.geolocation.clearWatch(watchRef.current);
    };

  }, [isTracking]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">

      <aside className="sidebar">
        <h2 className="logo">Tracker</h2>

        <ul>
          <li className="active">Dashboard</li>
          <li onClick={() => navigate("/locations")}>Locations</li>
          <li onClick={() => navigate("/history")}>History</li>
          <li onClick={() => navigate("/settings")}>Settings</li>
        </ul>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-content">

        <header className="topbar">
          <h1>Dashboard</h1>

          <button
            className="tracking-toggle"
            onClick={() => setIsTracking(!isTracking)}
          >
            {isTracking ? "Stop Tracking" : "Start Tracking"}
          </button>
        </header>

        {/* CARDS */}
        <section className="cards">

          <div className="card">
            <h3>Total Locations</h3>
            <p>{stats.total}</p>
          </div>

          <div className="card">
            <h3>Status</h3>
            <p>{isTracking ? "Active" : "Inactive"}</p>
          </div>

          <div className="card">
            <h3>Last Updated</h3>
            <p>{stats.lastUpdated || "No Data"}</p>
          </div>

        </section>

        {/* MAP */}
        <section style={{ height: "60vh", marginTop: "20px" }}>
          <MapContainer
            center={currentPos || [20, 77]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >

            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {locations.map((loc) => (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
              >
                <Popup>
                  {new Date(loc.created_at).toLocaleString()}
                </Popup>
              </Marker>
            ))}

            {locations.length > 1 && (
              <Polyline
                positions={locations.map(l => [l.latitude, l.longitude])}
              />
            )}

            {currentPos && (
              <Marker position={currentPos}>
                <Popup>Current Location</Popup>
              </Marker>
            )}

          </MapContainer>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
