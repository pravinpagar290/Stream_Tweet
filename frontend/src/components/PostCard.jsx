import React from "react";
import api from "../api/axios";
import { useAuth } from "../Auth/AuthContext";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
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
    <div className="glass-effect p-5 rounded-xl text-white border border-gray-700 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg animate-scale-in">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-sm font-bold">
              {(post.owner?.username || "U")[0].toUpperCase()}
            </div>
            <div className="font-semibold text-gray-200">
              {post.owner?.username || "Unknown"}
            </div>
          </div>
          <div className="text-base text-gray-300 mt-2 leading-relaxed">
            {post.content}
          </div>
          <div className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>

        {isOwner && (
          <div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 
                         rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 
                         disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
