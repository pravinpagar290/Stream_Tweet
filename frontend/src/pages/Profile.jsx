import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../Auth/AuthContext";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isLoggedIn } = useAuth();

  const [channel, setChannel] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/user/channel/${username}`);
        if (res?.data?.data) {
          setChannel(res.data.data.channel);
          setSubscriberCount(res.data.data.subscriberCount || 0);
          setIsSubscribed(!!res.data.data.isSubscribed);
        }
      } catch (err) {
        console.error("Failed to load channel", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

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
          res?.data?.data?.subscriberCount ?? Math.max(0, subscriberCount - 1)
        );
      } else {
        const res = await api.post(`/user/subscribe/${channel.username}`);
        setIsSubscribed(true);
        setSubscriberCount(
          res?.data?.data?.subscriberCount ?? subscriberCount + 1
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
      <div className="text-white text-center p-10">Loading channel...</div>
    );
  }

  if (!channel) {
    return (
      <div className="text-gray-400 text-center p-10">Channel not found.</div>
    );
  }

  const isOwner = currentUser?._id === channel._id;

  return (
    <div className="max-w-3xl mx-auto text-white p-6">
      <div className="flex items-center gap-6">
        <img
          src={channel.avatar || "/vite.svg"}
          alt={channel.username}
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">
            {channel.fullName || channel.username}
          </h1>
          <div className="text-gray-400">@{channel.username}</div>
          <div className="text-gray-400 mt-2">
            {subscriberCount} subscribers
          </div>
        </div>

        <div className="ml-auto">
          {!isOwner && (
            <button
              onClick={handleToggleSubscribe}
              disabled={subLoading}
              className={`px-4 py-2 rounded-md font-semibold ${
                isSubscribed ? "bg-gray-700" : "bg-red-600 hover:bg-red-700"
              } `}
            >
              {subLoading
                ? "Please wait..."
                : isSubscribed
                ? "Subscribed"
                : "Subscribe"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded-md">
        <h2 className="font-semibold mb-2">About</h2>
        <p className="text-gray-300">
          {channel.coverImage ? "Has cover image" : "No cover image"}
        </p>
      </div>
    </div>
  );
}
