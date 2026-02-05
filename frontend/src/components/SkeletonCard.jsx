import React from "react";

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

export default SkeletonCard;
