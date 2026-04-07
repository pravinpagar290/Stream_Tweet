import React from "react";
import { useSelector } from "react-redux";
import api from "../api/axios";

export default function PostCard({ post, onDelete }) {
  const { user } = useSelector((state) => state.auth);
  const [deleting, setDeleting] = React.useState(false);
  const isOwner =
    user && post.owner && user._id && post.owner._id
      ? user._id === post.owner._id
      : user && post.owner
        ? user._id === post.owner.toString()
        : false;

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      setDeleting(true);
      await api.delete(`/tweet/${post._id}`);
      if (typeof onDelete === "function") onDelete(post._id);
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert(err?.response?.data?.message || "Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="p-5 rounded-xl transition-colors animate-scale-in"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {(post.owner?.username || "U")[0].toUpperCase()}
            </div>
            <div className="font-medium" style={{ color: "var(--text-primary)" }}>
              {post.owner?.username || "Unknown"}
            </div>
          </div>
          <div className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {post.content}
          </div>
          <div className="text-xs mt-3 flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>

        {isOwner && (
          <div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--danger)",
                color: "#fff",
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
