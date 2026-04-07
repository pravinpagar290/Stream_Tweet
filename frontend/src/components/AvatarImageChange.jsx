import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "../store/Slices/authSlice";
import api from "../api/axios";

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
    } catch (err) {
      console.error("Avatar upload failed", err);
      setError(err?.response?.data?.message || "Failed to update avatar");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
      <div
        className="rounded-xl w-full max-w-md relative overflow-hidden animate-scale-in"
        style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Change Avatar</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">
          <div className="relative group w-36 h-36">
            <img
              src={preview}
              alt="Avatar Preview"
              className="w-full h-full rounded-full object-cover"
              style={{ border: "3px solid var(--border-primary)", backgroundColor: "var(--bg-tertiary)" }}
            />
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-full cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="text-center">
            <p className="text-sm mb-2" style={{ color: "var(--text-tertiary)" }}>Click the image to select a new file</p>
            {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: !file || uploading ? "var(--bg-tertiary)" : "var(--accent)", color: !file || uploading ? "var(--text-tertiary)" : "#fff" }}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Avatar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarImageChange;
