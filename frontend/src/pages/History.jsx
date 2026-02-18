import React, { useEffect, useState } from "react";
import {
  getLocations,
  getFilteredLocations
} from "../api/locationApi";

import { exportLocationsCsv } from "../utils/exportCsv";

function History() {

  const [locations, setLocations] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const load = async () => {
    const data = await getLocations();
    setLocations(data);
  };

  useEffect(() => {
    load();
  }, []);

  const filter = async () => {
    if (!start || !end) return alert("Select dates");

    const data = await getFilteredLocations(start, end);
    setLocations(data);
  };

  return (
    <div className="main-content">

      <h1>History</h1>

      <input type="date" onChange={e => setStart(e.target.value)} />
      <input type="date" onChange={e => setEnd(e.target.value)} />

      <button onClick={filter}>Filter</button>

      <button onClick={() => exportLocationsCsv(locations)}>
        Export CSV
      </button>

      {locations.map(loc => (
        <div key={loc.id} className="card">
          {loc.latitude} , {loc.longitude}
        </div>
      ))}

    </div>
  );
}

export default History;
