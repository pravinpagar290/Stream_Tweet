import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  // We'll add auth state (isLoggedIn) here later
  const isLoggedIn = true; // Hardcoded for now

  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-500">
          StreamTweet
        </Link>

        {/* Search Bar (Placeholder) */}
        <div className="hidden sm:block w-full max-w-xs">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Auth & Upload Links */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link
                to="/upload"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Upload
              </Link>
              <Link to="/profile" className="text-sm font-medium hover:text-blue-400">
                Profile
              </Link>
              <button className="text-sm font-medium hover:text-blue-400">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden sm:block text-sm font-medium hover:text-blue-400"
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