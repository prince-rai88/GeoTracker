import React, { useEffect, useState } from "react";
import { getNotifications } from "../api/notificationApi";

function Notifications() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getNotifications();
    setNotes(data);
  };

  return (
    <div className="main-content">
      <h1>Notifications</h1>

      {notes.length === 0 && <p>No alerts yet</p>}

      {notes.map((n) => (
        <div key={n.id} className="card">
          <p>{n.message}</p>
          <small>{new Date(n.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
