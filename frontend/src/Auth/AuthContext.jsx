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
      // Call backend to clear cookies/session
      await api.post("/user/logout");
    } catch (err) {
      console.warn("Logout API error", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoggedIn, setIsLoggedIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
