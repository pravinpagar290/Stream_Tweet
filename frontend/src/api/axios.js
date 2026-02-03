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

    if (status === 401) {
      localStorage.removeItem("token");
    }

    error.normalizedMessage = serverMessage || "An error occurred";

    return Promise.reject(error);
  },
);

export default api;
