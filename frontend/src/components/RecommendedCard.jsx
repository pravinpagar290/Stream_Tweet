import React from "react";
import { Link } from "react-router-dom";
import { placeholderDataUrl } from "../utils/placeholder";

const RecommendedCard = ({ video, delay }) => {
  const title = typeof video.title === "string" ? video.title : "Untitled";
  const thumb = video.thumbnail || placeholderDataUrl(168, 94, "No Image");
  const uploader = video.owner?.userName || "Unknown";
  const views = Intl.NumberFormat("en", { notation: "compact" }).format(
    video.views || 0,
  );

  return (
    <Link
      to={`/video/${video._id}`}
      className="flex gap-3 p-2 rounded-lg transition-colors opacity-0 animate-slideUp group"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        color: "var(--text-primary)",
      }}
    >
      <div
        className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      >
        <video
          src={video.videoFile}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden group-hover:block"
          onMouseOver={(e) => e.target.play()}
          onMouseOut={(e) => e.target.pause()}
        />
        <img
          src={thumb}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3
          className="text-sm font-medium line-clamp-2 transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {uploader}
        </p>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {views} views
        </p>
      </div>
    </Link>
  );
};

export default RecommendedCard;
