import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/Slices/authSlice";
import { useTheme } from "../Theme/ThemeContext.jsx";
import LogoLight from "../assets/light-theme-logo.png";
import LogoDark from "../assets/Dark-theme-logo.png";

import SideBar from "./SideBar";

function Header() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 animate-fade-in"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <img
            className="h-7 w-auto sm:h-8 md:h-9 object-contain"
            src={theme === "light" ? LogoLight : LogoDark}
            alt="StreamTweet Logo"
          />
        </Link>

        <SideBar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
            aria-label="Open Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {isLoggedIn ? (
            <>
              <NavLink
                to="/profile"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Profile
              </NavLink>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: "var(--danger)",
                  color: "#fff",
                }}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden sm:block text-sm font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
