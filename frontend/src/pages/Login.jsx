import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/Slices/authSlice";
import api from "../api/axios";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    try {
      const response = await api.post("/user/login", {
        email: data.email,
        password: data.password,
      });

      const { accessToken, user } = response.data.data;
      if (!accessToken || !user) {
        throw new Error("Invalid response from server");
      }

      dispatch(login({ user, accessToken }));
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 sm:px-6 lg:px-8 text-white animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r bg-white bg-clip-text text-transparent">
          Welcome Back
        </h2>

        <div className="relative bg-gray-800/ backdrop-blur py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700 overflow-hidden group">
          {serverError && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
              {serverError}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="mt-1 block w-full glass-effect border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white 
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all duration-300 hover:border-cyan-500/50"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="mt-1 block w-full glass-effect border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white 
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all duration-300 hover:border-cyan-500/50"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-cyan-500 hover:text-cyan-400 transition-colors duration-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white 
                         bg-gradient-to-r from-cyan-600 to-blue-600 
                         hover:from-cyan-500 hover:to-blue-500 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105"
              >
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : null}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  New to StreamTweet?
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center text-sm">
              <Link
                to="/register"
                className="font-medium text-cyan-500 hover:text-cyan-400 transition-colors duration-300"
              >
                Sign up for an account
              </Link>
            </div>
          </div>

          {/* RGB Animated Underline - Expands from Center */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-0 group-hover:w-full 
                       transition-all duration-700 ease-out origin-center"
            style={{
              background:
                "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)",
              backgroundSize: "200% 100%",
              animation: "rgb-gradient 3s linear infinite",
              boxShadow:
                "0 0 10px rgba(255, 0, 255, 0.9), 0 0 20px rgba(0, 255, 255, 0.7), 0 0 30px rgba(138, 43, 226, 0.6)",
              filter: "brightness(1.3)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
