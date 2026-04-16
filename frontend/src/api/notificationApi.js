// FIX: use shared axiosInstance (Bearer prefix, reads "access" key from localStorage)
import axiosInstance from "./axios";

export const getNotifications = async () => {
  const res = await axiosInstance.get("/notifications/");
  return res.data;
};
