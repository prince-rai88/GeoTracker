// FIX: use shared axiosInstance (Bearer prefix, reads "access" key from localStorage)
import axiosInstance from "./axios";

// GET ALL LOCATIONS
export const getLocations = async () => {
  const res = await axiosInstance.get("/locations/");
  return res.data;
};

// ADD LOCATION
export const createLocation = async (data) => {
  const res = await axiosInstance.post("/locations/", data);
  return res.data;
};

// DELETE LOCATION
export const deleteLocation = async (id) => {
  await axiosInstance.delete(`/locations/${id}/`);
};

// FILTER LOCATIONS BY DATE RANGE
export const getFilteredLocations = async (start, end) => {
  const res = await axiosInstance.get(`/locations/?start=${start}&end=${end}`);
  return res.data;
};

// DASHBOARD STATS
export const getDashboardStats = async () => {
  const res = await axiosInstance.get("/locations/");
  const data = res.data;
  return {
    total: data.length,
    lastUpdated: data[0]?.created_at || null,
  };
};
