import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/Slices/authSlice";
import { useTheme } from "../Theme/ThemeContext.jsx";
import LogoLight from "../assets/light-theme-logo.png";
import LogoDark from "../assets/Dark-theme-logo.png";
import { MdNightlight } from "react-icons/md";
import { CiLight } from "react-icons/ci";

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
    <header className=" text-white shadow-lg sticky top-0 z-50 border-b  border-gray-800 animate-slide-in-left">
      <nav className="container mx-auto  py-4 flex items-center justify-between">
        <div className="flex items-center gap-9">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-white to-gray-700 bg-clip-text text-transparent hover:from-cyan-300 hover:to-blue-500 transition-all duration-300"
          >
            <img
              className="h-7 w-auto sm:h-8 md:h-10 object-contain"
              src={theme === "light" ? LogoLight : LogoDark}
              alt="StreamTweet Logo"
            />
          </Link>
        </div>

        <SideBar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-full hover:bg-gray-800 text-white-300 hover:text-white transition-colors order-last md:order-none"
            aria-label="Open Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="px-3 py-2 rounded-lg border border-gray-700 hover:border-cyan-500 hover:bg-gray-700/50 transition-all duration-300 text-xl hover:scale-110"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <MdNightlight /> : <CiLight />}
          </button>

          {isLoggedIn ? (
            <>
              <NavLink
                to="/profile"
                className="hidden sm:inline px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
              >
                Profile
              </NavLink>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden sm:block text-sm font-medium text-gray-300 hover:text-cyan-400 transition-all duration-300"
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
