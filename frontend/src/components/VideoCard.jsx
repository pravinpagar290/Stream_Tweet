import React, { useState } from "react";
import { Link } from "react-router-dom";
import { placeholderDataUrl } from "../utils/placeholder";

const VideoCard = ({ video }) => {
  const [thumbLoaded, setThumbLoaded] = useState(false);

  const title =
    typeof video.title === "string" ? video.title : "Untitled Video";
  const thumb = video.thumbnail || placeholderDataUrl(320, 180, "No Image");
  const author = video.owner?.username || "Unknown Uploader";
  const views = Intl.NumberFormat("en", { notation: "compact" }).format(
    video.views || 0,
  );

  return (
    <Link
      to={`/video/${video._id}`}
      className="video-card group block rounded-xl overflow-hidden animate-scale-in no-underline transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        boxShadow: "var(--shadow-sm)",
        color: "var(--text-primary)",
      }}
    >
      <div className="relative w-full pt-[56.25%] overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        {!thumbLoaded && (
          <div className="absolute inset-0 animate-shimmer" />
        )}
        <img
          src={thumb}
          alt={title}
          onLoad={() => setThumbLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.03] ${thumbLoaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <div className="p-3.5">
        <h3
          className="font-medium text-sm line-clamp-2 mb-1.5"
          title={title}
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>

        <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>
          {author}
        </p>

        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {views} views
        </p>
      </div>
    </Link>
  );
};

export default VideoCard;
