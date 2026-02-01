import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useState } from "react";
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
                 hover:ring-2 hover:ring-blue-400/50
                 transition-all duration-500 hover:-translate-y-2
                 hover:shadow-2xl hover:shadow-blue-500/20
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
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 text-white bg-linear-to-b from-transparent to-gray-900/50">
        <h3
          className="font-semibold text-base line-clamp-2 mb-2
                     group-hover:text-blue-300 transition-colors duration-300"
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

const LikedVideos = () => {
  const [likedVideo, setLikedVideo] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/user/likedvideos");
        if (!response?.data?.data) {
          console.error("failed to get liked video");
        }
        setLikedVideo(
          Number(response.data.data.length) > 0 ? response.data.data : [],
        );
      } catch (error) {
        console.error("error while fetching the liked videos", error);
        setError(
          error.normalizedMessage ||
            error.response?.data?.message ||
            "Failed to load liked video. Please log in.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-pink-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-8 h-8"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
          Liked Videos
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <div className="text-red-400 text-lg font-semibold mb-2">
          Oops! Something went wrong
        </div>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!likedVideo?.length) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          No Liked Videos Yet
        </h2>
        <p className="text-gray-400 max-w-md">
          Videos you like will appear here. Go explore and find something cool!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-pink-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-8 h-8"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
        Liked Videos
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {likedVideo.map((v) =>
          v ? <VideoCard key={v._id} video={v} /> : null,
        )}
      </div>
    </div>
  );
};

export default LikedVideos;
