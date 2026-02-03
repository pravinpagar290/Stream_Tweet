import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../Auth/AuthContext";
import { placeholderDataUrl } from "../utils/placeholder";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isLoggedIn } = useAuth();

  const [channel, setChannel] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const targetUsername =
        username ?? currentUser?.userName ?? currentUser?.username;
      if (!targetUsername) {
        if (!isLoggedIn) {
          setLoading(false);
          setError(
            "No channel specified. Please login or visit a channel URL.",
          );
          return;
        }
        setLoading(false);
        setError(
          <>
            Unable to determine channel username. Try{" "}
            <Link to="/login" className="text-cyan-400 underline">
              logging in again
            </Link>
            .
          </>,
        );
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const resPublic = await api.get(`/user/c/${targetUsername}`);
        if (resPublic?.data?.data) {
          setChannel(resPublic.data.data.channel);
          setSubscriberCount(resPublic.data.data.subscriberCount ?? 0);
        } else {
          setChannel(null);
          setError("Channel not found.");
        }

        if (isLoggedIn) {
          try {
            const resProtected = await api.get(
              `/user/channel/${targetUsername}`,
            );
            if (resProtected?.data?.data) {
              setIsSubscribed(!!resProtected.data.data.isSubscribed);
              setSubscriberCount(
                resProtected.data.data.subscriberCount ?? subscriberCount,
              );
            }
          } catch {
            // ignore protected fetch errors silently
          }
        }

        try {
          const vidRes = await api.get("/video/");
          const allVideos = vidRes?.data?.data ?? [];
          const channelVideos = allVideos.filter(
            (v) => v.owner?.username === targetUsername,
          );
          setVideos(channelVideos);
        } catch {
          setVideos([]);
        }
      } catch (err) {
        console.error("Failed to load channel", err);
        setChannel(null);
        setError(err?.response?.data?.message || "Failed to load channel");
      } finally {
        setLoading(false);
      }
    })();
  }, [username, currentUser, isLoggedIn]);

  const handleToggleSubscribe = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (!channel) return;
    try {
      setSubLoading(true);
      if (isSubscribed) {
        const res = await api.post(`/user/unsubscribe/${channel.username}`);
        setIsSubscribed(false);
        setSubscriberCount(
          res?.data?.data?.subscriberCount ?? Math.max(0, subscriberCount - 1),
        );
      } else {
        const res = await api.post(`/user/subscribe/${channel.username}`);
        setIsSubscribed(true);
        setSubscriberCount(
          res?.data?.data?.subscriberCount ?? subscriberCount + 1,
        );
      }
    } catch (err) {
      console.error("Subscribe action failed", err);
    } finally {
      setSubLoading(false);
    }
  };

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

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-400 p-4">
        <p className="text-xl mb-4">Channel not found.</p>
        <Link
          to="/"
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?._id === channel._id;

  return (
    <div className="min-h-screen text-white p-4 md:p-8 animate-fade-in">
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gray-800 overflow-hidden relative">
        {channel.coverImage ? (
          <img
            src={channel.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-cyan-900 to-blue-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-gray-800">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <img
              src={
                channel.avatar ||
                placeholderDataUrl(150, 150, channel.username[0])
              }
              alt={channel.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-900 relative z-10 bg-gray-800"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
              {channel.fullName || channel.username}
            </h1>
            <p className="text-gray-400 font-medium">@{channel.username}</p>
            <p className="text-gray-500 text-sm mt-1">
              {subscriberCount} subscribers • {videos.length} videos
            </p>
          </div>

          <div className="flex-shrink-0">
            {!isOwner && (
              <button
                onClick={handleToggleSubscribe}
                disabled={subLoading}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg ${
                  isSubscribed
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-red-600 text-white hover:bg-red-700 hover:shadow-red-600/30 hover:scale-105"
                }`}
              >
                {subLoading ? "..." : isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
            {isOwner && (
              <Link
                to="/settings"
                className="px-6 py-2 rounded-full font-semibold bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all"
              >
                Customize Channel
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></span>
            Videos
          </h2>

          {videos.length === 0 ? (
            <div className="text-center py-20 text-gray-500 glass-effect rounded-xl border border-gray-800">
              <p className="text-lg">No videos uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((v) => (
                <Link
                  key={v._id}
                  to={`/video/${v._id}`}
                  className="group block rounded-xl overflow-hidden glass-effect border border-transparent hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  <div className="aspect-video bg-gray-800 relative overflow-hidden">
                    <img
                      src={
                        v.thumbnail ||
                        placeholderDataUrl(320, 180, "No Thumbnail")
                      }
                      alt={v.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-100 line-clamp-2 group-hover:text-cyan-400 transition-colors mb-1">
                      {v.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {v.views || 0} views •{" "}
                      {new Date(v.createdAt).toLocaleDateString()}
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
}
