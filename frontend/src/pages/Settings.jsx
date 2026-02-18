import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";

function Settings() {
  const [interval, setIntervalValue] = useState(5);
  const [autoStart, setAutoStart] = useState(false);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("trackerSettings"));
    if (saved) {
      setIntervalValue(saved.interval);
      setAutoStart(saved.autoStart);
      setZoom(saved.zoom);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem(
      "trackerSettings",
      JSON.stringify({
        interval,
        autoStart,
        zoom
      })
    );

    alert("Settings Saved ✅");
  };

  return (
    <div className="main-content">
      <h1>Settings</h1>

      <div className="card" style={{ marginTop: "20px" }}>
        <label>Tracking Interval (seconds)</label>
        <input
          type="number"
          value={interval}
          onChange={(e) => setIntervalValue(e.target.value)}
        />

        <label>Default Map Zoom</label>
        <input
          type="number"
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={autoStart}
            onChange={() => setAutoStart(!autoStart)}
          />
          Auto Start Tracking
        </label>

        <button onClick={saveSettings}>Save Settings</button>
      </div>
    </div>
  );
}

export default Settings;
