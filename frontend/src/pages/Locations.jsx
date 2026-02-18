import React, { useEffect, useState } from "react";
import {
  getLocations,
  createLocation,
  deleteLocation,
} from "../api/locationApi";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const loadLocations = async () => {
    const res = await getLocations();
    setLocations(res.data);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleManualAdd = async () => {
    await createLocation({ latitude: lat, longitude: lng });
    setLat("");
    setLng("");
    loadLocations();
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await createLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      loadLocations();
    });
  };

  return (
    <div className="main-content">
      <h1>Locations</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <input
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
        <button onClick={handleManualAdd}>Add Manually</button>
        <button onClick={handleCurrentLocation}>
          Add Current Location
        </button>
      </div>

      {locations.map((loc) => (
        <div className="card" key={loc.id} style={{ marginBottom: "10px" }}>
          <p>
            Lat: {loc.latitude} | Lng: {loc.longitude}
          </p>
          <button onClick={() => deleteLocation(loc.id).then(loadLocations)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default Locations;
