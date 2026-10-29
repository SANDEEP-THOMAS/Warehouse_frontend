import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

// Automatically attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    } catch (e) {
      // Invalid JSON in localStorage
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized errors to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If user was logged in and token expired, wipe auth state
      if (localStorage.getItem("auth")) {
        localStorage.removeItem("auth");
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;