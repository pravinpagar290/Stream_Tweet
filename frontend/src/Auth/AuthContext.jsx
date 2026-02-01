import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token) {
        setIsLoggedIn(true);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn("Auth init error", e);
    }
  }, []);

  // Persist user when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Expose logout helper
  const logout = async () => {
    try {
      await api.post("/user/logout");
    } catch (err) {
      console.warn("Logout API error", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Expose login helper
  const login = (userData, accessToken) => {
    localStorage.setItem("token", accessToken);
    setUser(userData);
    setIsLoggedIn(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoggedIn, setIsLoggedIn, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
