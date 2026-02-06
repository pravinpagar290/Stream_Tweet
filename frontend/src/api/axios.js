import axios from "axios";

const backend =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://streamtweet.onrender.com");
const baseURL = backend.replace(/\/\/+$/, "") + "/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const serverMessage =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.response?.data?.data?.message ??
      error?.message;

    // Clear auth data when access token is expired or invalid (401/403)
    // The app will detect this and update the auth state accordingly
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Trigger a storage event to notify other tabs/windows
      window.dispatchEvent(new Event("storage"));
    }

    error.normalizedMessage = serverMessage || "An error occurred";

    return Promise.reject(error);
  },
);

export default api;
