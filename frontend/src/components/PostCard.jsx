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
    <div className="bg-gray-800 p-4 rounded-md text-white">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-semibold">
            {post.owner?.username || "Unknown"}
          </div>
          <div className="text-sm text-gray-300 mt-1">{post.content}</div>
          <div className="text-xs text-gray-500 mt-2">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>

        {isOwner && (
          <div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
