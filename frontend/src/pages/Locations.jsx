import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getLocations, createLocation, deleteLocation } from "../api/locationApi";
import "../styles/dashboard.css";

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [form,      setForm]      = useState({ name: "", latitude: "", longitude: "" });

  // FIX: getLocations() already returns the array (res.data) — no extra .data needed
  const loadLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      console.error("Load locations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLocations(); }, []);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // FIX: include required "name" field in payload
  const handleManualAdd = async () => {
    if (!form.name || !form.latitude || !form.longitude)
      return alert("Please fill in all fields.");
    setAdding(true);
    try {
      await createLocation({
        name:      form.name,
        latitude:  parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      setForm({ name: "", latitude: "", longitude: "" });
      await loadLocations();
    } catch (err) {
      console.error("Create location error:", err);
      alert("Failed to add location. Check coordinates.");
    } finally {
      setAdding(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported by your browser.");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await createLocation({
            name:      "Current Location",
            latitude:  coords.latitude,
            longitude: coords.longitude,
          });
          await loadLocations();
        } catch (err) {
          console.error(err);
        }
      },
      () => alert("Could not retrieve your location.")
    );
  };

  const handleDelete = async (id) => {
    try {
      await deleteLocation(id);
      setLocations(l => l.filter(loc => loc.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <header className="topbar">
          <div>
            <div className="topbar-title">Locations</div>
            <div className="topbar-subtitle">Manage your saved location points</div>
          </div>
          <span className="badge badge-purple">{locations.length} saved</span>
        </header>

        <div className="page-content">

          {/* ── Add Form ── */}
          <div className="card mb-24">
            <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "20px", color: "var(--text-primary)" }}>
              Add New Location
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Location Name</label>
                <input
                  className="input-field"
                  name="name"
                  placeholder="e.g. Home, Office"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Latitude</label>
                <input
                  className="input-field"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="28.6139"
                  value={form.latitude}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Longitude</label>
                <input
                  className="input-field"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="77.2090"
                  value={form.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row">
              <button className="btn btn-primary" onClick={handleManualAdd} disabled={adding}>
                {adding ? "Adding…" : "+ Add Manually"}
              </button>
              <button className="btn btn-ghost" onClick={handleCurrentLocation}>
                📍 Use Current Location
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="card">
            {loading ? (
              <div className="loading-dots">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            ) : locations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📍</div>
                <div className="empty-title">No locations saved yet</div>
                <div className="empty-sub">Add your first location above</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Added</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc, i) => (
                    <tr key={loc.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{loc.name}</td>
                      <td>{Number(loc.latitude).toFixed(5)}</td>
                      <td>{Number(loc.longitude).toFixed(5)}</td>
                      <td>{new Date(loc.created_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(loc.id)}
                        >
                          <TrashIcon /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Locations;
