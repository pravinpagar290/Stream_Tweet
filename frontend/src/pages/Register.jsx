import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !avatar) {
      setError("Username, email, password, and avatar are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("avatar", avatar);

    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    try {
      const response = await api.post("/user/register", formData);

      console.log("Registration successful:", response.data);
      navigate("/login");
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.data?.message ??
        err?.response?.data?.error ??
        err?.normalizedMessage;
      if (status === 409) {
        setError("An account with that email/username already exists.");
      } else if (status === 400) {
        setError(serverMsg || "Invalid registration data.");
      } else {
        setError(
          serverMsg || "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-primary)",
    color: "var(--text-primary)",
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center p-4 animate-fade-in">
      <div
        className="max-w-md w-full p-8 rounded-xl animate-slideUp"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
        }}
      >
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Username <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-lg py-2.5 px-3.5 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Full Name <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-lg py-2.5 px-3.5 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Email <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg py-2.5 px-3.5 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Password <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg py-2.5 px-3.5 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="avatar" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Avatar <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white file:transition-colors disabled:opacity-50"
              style={{ color: "var(--text-secondary)" }}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Cover Image (Optional)
            </label>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white file:transition-colors disabled:opacity-50"
              style={{ color: "var(--text-secondary)" }}
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="text-sm text-center p-3 rounded-lg animate-scale-in"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium transition-colors" style={{ color: "var(--accent)" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
