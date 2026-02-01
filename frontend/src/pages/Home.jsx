import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { placeholderDataUrl } from "../utils/placeholder";

const SkeletonCard = () => (
  <div className="w-full rounded-xl overflow-hidden glass-effect animate-pulse">
    <div className="w-full h-40 bg-gray-700/50 animate-shimmer" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-700/50 rounded-lg animate-shimmer" />
      <div className="h-3 bg-gray-700/50 rounded-lg w-2/3 animate-shimmer" />
      <div className="h-3 bg-gray-700/50 rounded-lg w-1/3 animate-shimmer" />
    </div>
  </div>
);

function VideoCard({ video }) {
  const [thumbLoaded, setThumbLoaded] = useState(false);

  const title = video.title || "Untitled Video";
  const thumb = video.thumbnail || placeholderDataUrl(320, 180, "No Image");
  const author = video.owner?.username || "Unknown Uploader";
  const views = Intl.NumberFormat("en", { notation: "compact" }).format(
    video.views || 0,
  );

  return (
    <Link
      to={`/video/${video._id}`}
      className="group block rounded-xl overflow-hidden shadow-lg
                 glass-effect ring-1 ring-white/5
                 hover:ring-2 hover:ring-cyan-400/50
                 transition-all duration-500 hover:-translate-y-2
                 hover:shadow-2xl hover:shadow-cyan-500/20
                 animate-scale-in"
    >
      <div className="relative w-full pt-[56.25%] bg-gray-900 overflow-hidden">
        {!thumbLoaded && (
          <div className="absolute inset-0 bg-gray-700 animate-shimmer" />
        )}
        <img
          src={thumb}
          alt={title}
          onLoad={() => setThumbLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover
                     transition-all duration-500
                     group-hover:scale-110
                     ${thumbLoaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 text-white bg-gradient-to-b from-transparent to-gray-900/50">
        <h3
          className="font-semibold text-base line-clamp-2 mb-2
                     group-hover:text-cyan-300 transition-colors duration-300"
          title={title}
        >
          {title}
        </h3>

        <p className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">
          {author}
        </p>

        <p className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">
          {views} views
        </p>
      </div>
    </Link>
  );
}

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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {videos.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </div>
    </div>
  );
}
