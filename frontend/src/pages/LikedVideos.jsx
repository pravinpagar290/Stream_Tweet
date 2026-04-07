import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { placeholderDataUrl } from "../utils/placeholder";

const SkeletonCard = () => (
  <div className="w-full rounded-xl overflow-hidden animate-pulse" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
    <div className="w-full h-40 animate-shimmer" style={{ backgroundColor: "var(--bg-tertiary)" }} />
    <div className="p-3.5 space-y-2.5">
      <div className="h-4 rounded-lg animate-shimmer" style={{ backgroundColor: "var(--bg-tertiary)" }} />
      <div className="h-3 rounded-lg w-2/3 animate-shimmer" style={{ backgroundColor: "var(--bg-tertiary)" }} />
      <div className="h-3 rounded-lg w-1/3 animate-shimmer" style={{ backgroundColor: "var(--bg-tertiary)" }} />
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
      className="group block rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 animate-scale-in"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="relative w-full pt-[56.25%] overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        {!thumbLoaded && (
          <div className="absolute inset-0 animate-shimmer" style={{ backgroundColor: "var(--bg-tertiary)" }} />
        )}
        <img
          src={thumb}
          alt={title}
          onLoad={() => setThumbLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${thumbLoaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <div className="p-3.5">
        <h3 className="font-medium text-sm line-clamp-2 mb-1.5" title={title} style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p className="text-sm mb-0.5" style={{ color: "var(--text-secondary)" }}>{author}</p>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{views} views</p>
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
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Liked Videos</h1>
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
        <div className="text-lg font-semibold mb-2" style={{ color: "var(--danger)" }}>Oops! Something went wrong</div>
        <p style={{ color: "var(--text-tertiary)" }}>{error}</p>
      </div>
    );
  }

  if (!likedVideo?.length) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>No Liked Videos Yet</h2>
        <p className="text-sm max-w-md" style={{ color: "var(--text-tertiary)" }}>
          Videos you like will appear here. Go explore and find something cool!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Liked Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {likedVideo.map((v) =>
          v ? <VideoCard key={v._id} video={v} /> : null,
        )}
      </div>
    </div>
  );
};

export default LikedVideos;
