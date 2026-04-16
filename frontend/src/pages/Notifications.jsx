import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getNotifications } from "../api/notificationApi";
import "../styles/dashboard.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    getNotifications()
      .then(data  => setNotifications(data))
      .catch(err  => console.error("Notifications error:", err))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <header className="topbar">
          <div>
            <div className="topbar-title">Notifications</div>
            <div className="topbar-subtitle">Geofence alerts and system messages</div>
          </div>
          {unreadCount > 0 && (
            <span className="badge badge-danger">{unreadCount} unread</span>
          )}
        </header>

        <div className="page-content">
          <div className="card">
            {loading ? (
              <div className="loading-dots">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <div className="empty-title">All clear!</div>
                <div className="empty-sub">Geofence alerts will appear here when triggered</div>
              </div>
            ) : (
              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className="notif-item">
                    <div className={`notif-dot${n.is_read ? " read" : ""}`} />
                    <div>
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-time">
                        {new Date(n.created_at).toLocaleString()}
                        {!n.is_read && (
                          <span className="badge badge-danger" style={{ marginLeft: "8px", fontSize: "10px" }}>
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
