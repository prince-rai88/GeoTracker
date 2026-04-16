import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getLocations, getFilteredLocations } from "../api/locationApi";
import { exportLocationsCsv } from "../utils/exportCsv";
import "../styles/dashboard.css";

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

function History() {
  const [locations, setLocations] = useState([]);
  const [start,     setStart]     = useState("");
  const [end,       setEnd]       = useState("");
  const [loading,   setLoading]   = useState(true);
  const [filtered,  setFiltered]  = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
      setFiltered(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const applyFilter = async () => {
    if (!start || !end) return alert("Please select both a start and end date.");
    setLoading(true);
    try {
      const data = await getFilteredLocations(start, end);
      setLocations(data);
      setFiltered(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setStart(""); setEnd("");
    loadAll();
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <header className="topbar">
          <div>
            <div className="topbar-title">History</div>
            <div className="topbar-subtitle">Browse and export your location history</div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => exportLocationsCsv(locations)}
            disabled={locations.length === 0}
          >
            <DownloadIcon /> Export CSV
          </button>
        </header>

        <div className="page-content">

          {/* ── Filter bar ── */}
          <div className="card mb-24">
            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Filter by Date Range
            </div>
            <div className="row">
              <div className="input-group flex-1" style={{ marginBottom: 0, minWidth: 140 }}>
                <label className="input-label">From</label>
                <input type="date" className="input-field" value={start} onChange={e => setStart(e.target.value)} />
              </div>
              <div className="input-group flex-1" style={{ marginBottom: 0, minWidth: 140 }}>
                <label className="input-label">To</label>
                <input type="date" className="input-field" value={end} onChange={e => setEnd(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={applyFilter} style={{ marginTop: "20px" }}>
                Apply Filter
              </button>
              {filtered && (
                <button className="btn btn-ghost" onClick={clearFilter} style={{ marginTop: "20px" }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="card">
            {filtered && (
              <div style={{ marginBottom: "16px" }}>
                <span className="badge badge-info">
                  {locations.length} results · {start} → {end}
                </span>
              </div>
            )}

            {loading ? (
              <div className="loading-dots">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            ) : locations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <div className="empty-title">No records found</div>
                <div className="empty-sub">
                  {filtered ? "Try widening your date range" : "Start tracking to see history here"}
                </div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Timestamp</th>
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

export default History;
