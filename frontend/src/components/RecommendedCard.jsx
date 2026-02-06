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
      className="relative flex gap-3 p-2 rounded-lg glass-effect hover:bg-white/5 border border-transparent hover:border-cyan-500/30 transition-all duration-300 opacity-0 animate-slideUp group overflow-hidden"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-900 shadow-md">
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
        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{uploader}</p>
        <p className="text-xs text-gray-500">{views} views</p>
      </div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-full 
                   transition-all duration-500 ease-out origin-center"
        style={{
          background:
            "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)",
          backgroundSize: "200% 100%",
          animation: "rgb-gradient 3s linear infinite",
          boxShadow:
            "0 0 6px rgba(255, 0, 255, 0.7), 0 0 12px rgba(0, 255, 255, 0.5), 0 0 20px rgba(138, 43, 226, 0.4)",
          filter: "brightness(1.2)",
        }}
      />
    </Link>
  );
};

export default RecommendedCard;
