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

  return (
    <div className="min-h-screen text-white p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent inline-block">
          Subscribed Channels
        </h1>
        <div className="space-y-4">
          {subscribedChannels.length === 0 ? (
            <div className="text-center py-20 glass-effect rounded-xl border border-gray-800">
              <div className="text-gray-400 mb-6 text-lg">
                You are not subscribed to any channels yet.
              </div>
              <Link
                to="/"
                className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
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
                  className="flex items-center gap-4 p-4 glass-effect rounded-xl hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 border border-transparent hover:border-cyan-500/30 group shadow-md"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <img
                      src={
                        ch.avatar ||
                        placeholderDataUrl(60, 60, ch.username?.[0] || "U")
                      }
                      alt={ch.username}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-800 relative z-10"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors truncate">
                      {ch.fullName || ch.username}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      @{ch.username}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {ch.subscribersCount || 0} subscribers
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
