import React, { useState, useEffect } from "react";
import api from "../api/axios";
import VideoCard from "../components/VideoCard";
import SkeletonCard from "../components/SkeletonCard";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/video/");
        if (!cancelled) setVideos(data?.data || []);
      } catch {
        if (!cancelled) setError("Failed to load videos. Try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, []);

  if (loading)
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );

  if (!videos.length)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        No videos yet.
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="video-card-container grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {videos.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </div>
    </div>
  );
}
