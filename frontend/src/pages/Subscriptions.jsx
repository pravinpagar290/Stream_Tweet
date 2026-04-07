import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { placeholderDataUrl } from "../utils/placeholder";

const SubscribedChannels = () => {
  const [subscribedChannels, setSubscribedChannel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/user/subscriptions");
        const channels = response?.data?.data ?? response?.data ?? [];
        setSubscribedChannel(channels);
      } catch (error) {
        console.error("error while fetching the subscribed data", error);
        setError(
          error.normalizedMessage ||
            error.response?.data?.message ||
            "Failed to load subscribed channels. Please log in.",
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

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 pb-4" style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--border-primary)" }}>
          Subscribed Channels
        </h1>
        <div className="space-y-4">
          {subscribedChannels.length === 0 ? (
            <div className="text-center py-16 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <div className="mb-5" style={{ color: "var(--text-tertiary)" }}>
                You are not subscribed to any channels yet.
              </div>
              <Link
                to="/"
                className="inline-block text-white px-6 py-2 rounded-full font-medium text-sm transition-colors"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Browse channels
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {subscribedChannels.map((ch) => (
                <Link
                  to={`/c/${ch.username}`}
                  key={ch._id || ch.username}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl transition-colors group"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                >
                  <img
                    src={ch.avatar || placeholderDataUrl(60, 60, ch.username?.[0] || "U")}
                    alt={ch.username}
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ border: "2px solid var(--border-primary)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {ch.fullName || ch.username}
                    </h3>
                    <p className="text-sm truncate" style={{ color: "var(--text-tertiary)" }}>
                      @{ch.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribedChannels;
