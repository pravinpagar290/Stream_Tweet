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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: "3px solid var(--border-primary)", borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <p className="text-xl mb-4" style={{ color: "var(--danger)" }}>{error}</p>
        <Link to="/" className="transition-colors" style={{ color: "var(--accent)" }}>Go Home</Link>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4" style={{ color: "var(--text-tertiary)" }}>
        <p className="text-xl mb-4">Your watch history is empty.</p>
        <Link to="/" className="transition-colors" style={{ color: "var(--accent)" }}>Go explore videos</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 pb-4" style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--border-primary)" }}>
          Watch History
        </h1>
        <div className="space-y-3">
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
      className="flex flex-col sm:flex-row items-start gap-4 p-3.5 rounded-xl transition-colors group animate-slideUp"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="relative w-full sm:w-44 h-26 flex-shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        <img
          src={video.thumbnail || placeholderDataUrl(160, 90, "No Image")}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="font-medium line-clamp-1" style={{ color: "var(--text-primary)" }}>
          {video.title || "Untitled Video"}
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {video.owner?.username || "Unknown Uploader"}
        </p>
        <p className="text-sm mt-1.5 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>
          {video.description || "No description."}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <span>{video.views || 0} views</span>
          <span>·</span>
          <span>Watched: {watchedDate}</span>
        </div>
      </div>
    </Link>
  );
}

export default WatchHistory;
