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
      className="video-card group relative block rounded-xl overflow-hidden shadow-lg
                 glass-effect border border-gray-200 dark:border-gray-800
                 transition-all duration-500 
                 animate-scale-in no-underline
                 hover:scale-105 hover:z-10"
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
                     ${thumbLoaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <div className="p-4">
        <h3
          className="font-semibold text-base uppercase line-clamp-2 mb-2 transition-colors font-light duration-300"
          title={title}
        >
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors">
          {author}
        </p>

        <p className="text-gray-500 text-sm transition-colors">{views} views</p>
      </div>
      {/* Animated RGB Border Bottom Line - Expands from Center with Beat Effect */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-0 group-hover:w-full 
                   transition-all duration-700 ease-out origin-center"
        style={{
          background:
            "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)",
          backgroundSize: "200% 100%",
          animation: "rgb-gradient 3s linear infinite",
          boxShadow:
            "0 0 15px rgba(255, 0, 255, 1), 0 0 30px rgba(255, 0, 255, 0.9), 0 0 50px rgba(0, 255, 255, 0.8), 0 0 70px rgba(255, 0, 0, 0.7), 0 0 100px rgba(0, 255, 0, 0.6), 0 -150px 200px rgba(138, 43, 226, 0.4), 0 -100px 150px rgba(255, 0, 255, 0.3), 0 -50px 100px rgba(0, 255, 255, 0.5)",
          filter: "brightness(1.9)",
        }}
      />
    </Link>
  );
};

export default VideoCard;
