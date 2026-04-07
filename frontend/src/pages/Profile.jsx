import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { placeholderDataUrl } from "../utils/placeholder";
import AvatarImageChange from "../components/AvatarImageChange";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isLoggedIn } = useSelector((state) => state.auth);

  const [channel, setChannel] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
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
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
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

  if (!channel) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4" style={{ color: "var(--text-tertiary)" }}>
        <p className="text-xl mb-4">Channel not found.</p>
        <Link to="/" className="transition-colors" style={{ color: "var(--accent)" }}>Go Home</Link>
      </div>
    );
  }

  const isOwner = currentUser?._id === channel._id;

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="h-48 md:h-64 overflow-hidden relative rounded-xl" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "var(--bg-tertiary)" }} />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <div className="relative group">
            {isOwner ? (
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="block rounded-full transition-transform hover:scale-105 focus:outline-none"
              >
                <img
                  src={channel.avatar || placeholderDataUrl(150, 150, channel.username[0])}
                  alt={channel.username}
                  className="w-28 h-28 rounded-full object-cover"
                  style={{ border: "4px solid var(--bg-primary)", backgroundColor: "var(--bg-tertiary)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Change</span>
                </div>
              </button>
            ) : (
              <Link to={"/"}>
                <img
                  src={channel.avatar || placeholderDataUrl(150, 150, channel.username[0])}
                  alt={channel.username}
                  className="w-28 h-28 rounded-full object-cover"
                  style={{ border: "4px solid var(--bg-primary)", backgroundColor: "var(--bg-tertiary)" }}
                />
              </Link>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
              {channel.fullName || channel.username}
            </h1>
            <p className="font-medium text-sm" style={{ color: "var(--text-secondary)" }}>@{channel.username}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              {subscriberCount} subscribers · {videos.length} videos
            </p>
          </div>

          <div className="flex-shrink-0">
            {!isOwner && (
              <button
                onClick={handleToggleSubscribe}
                disabled={subLoading}
                className="px-5 py-1.5 rounded-full font-medium text-sm transition-colors"
                style={
                  isSubscribed
                    ? { backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }
                    : { backgroundColor: "var(--accent)", color: "#fff" }
                }
              >
                {subLoading ? "..." : isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
            {isOwner && (
              <Link
                to="/settings"
                className="px-5 py-1.5 rounded-full font-medium text-sm transition-colors"
                style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}
              >
                Customize Channel
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Videos</h2>

          {videos.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-tertiary)" }}
            >
              <p>No videos uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map((v) => (
                <Link
                  key={v._id}
                  to={`/video/${v._id}`}
                  className="group block rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                >
                  <div className="aspect-video relative overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <img
                      src={v.thumbnail || placeholderDataUrl(320, 180, "No Thumbnail")}
                      alt={v.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1" style={{ color: "var(--text-primary)" }}>
                      {v.title}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {v.views || 0} views · {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {channel && (
        <AvatarImageChange
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentAvatar={channel.avatar || placeholderDataUrl(150, 150, channel.username[0])}
        />
      )}
    </div>
  );
}
