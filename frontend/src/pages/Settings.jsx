import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Settings() {
  const [interval,  setInterval]  = useState(5);
  const [autoStart, setAutoStart] = useState(false);
  const [zoom,      setZoom]      = useState(13);
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("trackerSettings") || "{}");
      if (stored.interval  !== undefined) setInterval(stored.interval);
      if (stored.autoStart !== undefined) setAutoStart(stored.autoStart);
      if (stored.zoom      !== undefined) setZoom(stored.zoom);
    } catch { /* ignore corrupt data */ }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("trackerSettings", JSON.stringify({ interval, autoStart, zoom }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <header className="topbar">
          <div>
            <div className="topbar-title">Settings</div>
            <div className="topbar-subtitle">Configure tracking and display preferences</div>
          </div>
        </header>

        <div className="page-content">
          <div style={{ maxWidth: "540px" }}>

            {/* ── Tracking Card ── */}
            <div className="card mb-24">
              <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)", marginBottom: "22px" }}>
                🛰 Tracking
              </div>

              <div className="input-group">
                <label className="input-label">Tracking Interval (seconds)</label>
                <input
                  type="number"
                  className="input-field"
                  min="1" max="300"
                  value={interval}
                  onChange={e => setInterval(Number(e.target.value))}
                />
                <span className="input-hint">How often your location is recorded while tracking is active</span>
              </div>

              <div className="toggle-row" style={{ marginTop: "8px" }}>
                <div className="toggle-info">
                  <div className="toggle-info-title">Auto Start Tracking</div>
                  <div className="toggle-info-sub">Begin tracking automatically on login</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={autoStart}
                    onChange={() => setAutoStart(v => !v)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>

            {/* ── Map Card ── */}
            <div className="card mb-24">
              <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)", marginBottom: "22px" }}>
                🗺 Map Display
              </div>

              <div className="input-group">
                <label className="input-label">Default Zoom Level — {zoom}</label>
                <input
                  type="range"
                  min="2" max="18"
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--purple)", marginTop: "8px" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  <span>World (2)</span>
                  <span>Street (18)</span>
                </div>
              </div>
            </div>

            {/* ── Save Button ── */}
            <button
              className="btn btn-primary"
              onClick={saveSettings}
              style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "15px" }}
            >
              {saved ? "✓  Settings Saved!" : "Save Changes"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
