import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Token ${token}`;
  }
  return req;
});

// GET ALL LOCATIONS
export const getLocations = async () => {
  const res = await API.get("/locations/");
  return res.data;
};

// ADD LOCATION
export const createLocation = async (data) => {
  const res = await API.post("/locations/", data);
  return res.data;
};

// DELETE LOCATION
export const deleteLocation = async (id) => {
  await API.delete(`/locations/${id}/`);
};

// FILTER LOCATIONS
export const getFilteredLocations = async (start, end) => {
  const res = await API.get(`/locations/?start=${start}&end=${end}`);
  return res.data;
};

// DASHBOARD STATS
export const getDashboardStats = async () => {
  const res = await API.get("/locations/");
  const data = res.data;

  return {
    total: data.length,
    lastUpdated: data[0]?.created_at || null,
  };
};
