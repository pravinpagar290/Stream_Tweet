import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "../store/Slices/authSlice";
import api from "../api/axios";
import { FiX, FiUpload, FiImage } from "react-icons/fi";

const AvatarImageChange = ({ isOpen, onClose, currentAvatar }) => {
  const [preview, setPreview] = useState(currentAvatar);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await api.patch("/user/change-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await dispatch(getCurrentUser()).unwrap();
      onClose();
      // Optional: Show success message/toast
    } catch (err) {
      console.error("Avatar upload failed", err);
      setError(err?.response?.data?.message || "Failed to update avatar");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Change Avatar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center gap-6">
          <div className="relative group w-40 h-40">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img
              src={preview}
              alt="Avatar Preview"
              className="w-full h-full rounded-full object-cover border-4 border-gray-800 relative z-10 bg-gray-800"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-full cursor-pointer backdrop-blur-sm"
            >
              <FiImage className="text-white w-8 h-8" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              Click the image to select a new file
            </p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all ${
                !file || uploading
                  ? "bg-gray-800 cursor-not-allowed text-gray-500"
                  : "bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FiUpload />
                  Update Avatar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarImageChange;
