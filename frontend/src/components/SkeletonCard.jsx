import React from "react";

const SkeletonCard = () => (
  <div
    className="w-full rounded-xl overflow-hidden animate-pulse"
    style={{
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border-primary)",
    }}
  >
    <div className="w-full h-40 animate-shimmer" />
    <div className="p-3.5 space-y-2.5">
      <div className="h-3.5 rounded animate-shimmer" />
      <div className="h-3 rounded w-2/3 animate-shimmer" />
      <div className="h-3 rounded w-1/3 animate-shimmer" />
    </div>
  </div>
);

export default SkeletonCard;
