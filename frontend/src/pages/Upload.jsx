import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { upload } from "../store/Slices/uploadSlice";
import { useDispatch } from "react-redux";

function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !videoFile) {
      setError("Title, description, and a video file are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    dispatch(upload({ title, description, videoFile, thumbnail }));
    navigate("/");
  };

  const inputStyle = {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-primary)",
    color: "var(--text-primary)",
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center p-4 animate-fade-in">
      <div
        className="max-w-2xl w-full p-8 rounded-xl animate-scale-in"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
        }}
      >
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          Upload Video
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg py-2.5 px-3.5 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              disabled={loading}
              placeholder="Enter video title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg py-2.5 px-3.5 text-sm focus:outline-none transition-colors resize-none"
              style={inputStyle}
              disabled={loading}
              placeholder="Enter video description"
            />
          </div>

          <div>
            <label htmlFor="videoFile" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Video File <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="file"
              id="videoFile"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white file:transition-colors disabled:opacity-50"
              style={{ color: "var(--text-secondary)" }}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Thumbnail (Optional)
            </label>
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white file:transition-colors disabled:opacity-50"
              style={{ color: "var(--text-secondary)" }}
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="text-sm text-center p-3 rounded-lg animate-scale-in"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="text-sm text-center p-3 rounded-lg animate-scale-in"
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#22c55e",
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: "var(--accent)" }}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </div>
            ) : (
              "Upload Video"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Upload;
