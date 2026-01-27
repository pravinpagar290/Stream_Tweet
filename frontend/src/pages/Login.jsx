import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import api from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, setIsLoggedIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/user/login", { email, password });

      if (response.data && response.data.data && response.data.data.user) {
        const returnedUser = response.data.data.user;
        const accessToken = response.data.data.accessToken;
        if (accessToken) {
          localStorage.setItem("token", accessToken);
        }
        setUser(returnedUser);
        setIsLoggedIn(true);
        navigate("/");
      } else {
        throw new Error("Invalid login response from server.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        console.error("Login error:", err.response.data.message);
        setError(err.response.data.message);
      } else {
        console.error("Unexpected error:", err.message);
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-4 animate-fade-in">
      <div className="max-w-md w-full glass-effect p-8 rounded-2xl shadow-2xl border border-gray-700 animate-scale-in">
        <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full glass-effect border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-300 hover:border-blue-500/50"
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full glass-effect border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-300 hover:border-blue-500/50"
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/30 p-3 rounded-lg border border-red-500/30 animate-scale-in">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white 
                         bg-gradient-to-r from-blue-600 to-blue-500 
                         hover:from-blue-500 hover:to-blue-400 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300 hover:shadow-blue-500/50 hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-500 hover:text-blue-400 transition-colors duration-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
