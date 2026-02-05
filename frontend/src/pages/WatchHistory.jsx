import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { placeholderDataUrl } from "../utils/placeholder";

function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/user/history");

        if (response.data && response.data.data) {
          const sorted = response.data.data.sort(
            (a, b) => new Date(b.watchedAt) - new Date(a.watchedAt),
          );
          setHistory(sorted);
        }
      } catch (err) {
        console.error("Error fetching watch history:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load history. Please log in.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-red-400 p-4">
        <p className="text-xl mb-4">{error}</p>
        <Link
          to="/"
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-400 p-4">
        <p className="text-xl mb-4">Your watch history is empty.</p>
        <Link
          to="/"
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Go explore videos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4 bg-gradient-to-r from-white to-gray-700 bg-clip-text text-transparent inline-block">
          Watch History
        </h1>
        <div className="space-y-4">
          {history.map((video) => (
            <HistoryVideoCard
              key={`${video._id}-${video.watchedAt}`}
              video={video}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryVideoCard({ video }) {
  if (!video) return null;

  const watchedDate = video.watchedAt
    ? new Date(video.watchedAt).toLocaleString()
    : "Unknown";

  return (
    <Link
      to={`/video/${video._id}`}
      className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl glass-effect border border-transparent hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group animate-slideUp"
    >
      <div className="relative w-full sm:w-48 h-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
        <img
          src={video.thumbnail || placeholderDataUrl(160, 90, "No Image")}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
          {video.title || "Untitled Video"}
        </h3>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          {video.owner?.username || "Unknown Uploader"}
        </p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {video.description || "No description."}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span>{video.views || 0} views</span>
          <span>•</span>
          <span>Watched: {watchedDate}</span>
        </div>
      </div>
    </Link>
  );
}

export default WatchHistory;
