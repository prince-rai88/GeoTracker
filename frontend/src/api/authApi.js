import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/auth/",
});

// Register user
export const registerUser = async (data) => {
  const response = await API.post("register/", data);
  return response.data;
};

// Login user
export const loginUser = async (data) => {
  const response = await API.post("login/", data);
  return response.data;
};
