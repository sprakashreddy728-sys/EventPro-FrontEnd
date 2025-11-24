import axios from "axios";

// Use environment variable if available, otherwise fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loggedInUser");
      // Dispatch event to notify app of logout
      window.dispatchEvent(new Event("userLoggedOut"));
    }
    return Promise.reject(error);
  }
);

export default api;
