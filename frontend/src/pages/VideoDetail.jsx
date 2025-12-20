import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import ReactPlayer from "react-player";
import { useAuth } from "../Auth/AuthContext";
import { placeholderDataUrl } from "../utils/placeholder";

function VideoDetail() {
  const { videoId } = useParams(); // 1. Get ID from URL
  const { user, isLoggedIn } = useAuth();
  const playerRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New: control playback from UI
  const [playing, setPlaying] = useState(false);
  const [playerError, setPlayerError] = useState(null);

  // New: channel subscription state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  // New: recommended videos state
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // New: Record view when video starts playing
  const [hasRecordedView, setHasRecordedView] = useState(false);

  useEffect(() => {
    // 3. useEffect to fetch data
    (async () => {
      if (!videoId) return; // Don't fetch if videoId is not present

      try {
        setLoading(true);
        setError(null);

        // Use GET /video/:videoId (backend defines GET "/:videoId")
        const response = await api.get(`/video/${videoId}`);

        if (response?.data?.data) {
          setVideo(response.data.data); // 4. Store video details in state
        } else {
          setError("Video not found.");
        }
      } catch (err) {
        console.error("Error fetching video:", err);
        setError(err.response?.data?.message || "Failed to fetch video.");
      } finally {
        setLoading(false);
      }
    })();
  }, [videoId]); // Dependency array: re-run if videoId changes

  // New: fetch recommended videos
  useEffect(() => {
    (async () => {
      try {
        setRecLoading(true);
        const response = await api.get("/video/");

        if (response?.data?.data) {
          // Filter out current video and limit to 10
          const filtered = response.data.data
            .filter((v) => v._id !== videoId)
            .slice(0, 10);
          setRecommendedVideos(filtered);
        }
      } catch (err) {
        console.warn("Failed to fetch recommended videos:", err);
        setRecommendedVideos([]);
      } finally {
        setRecLoading(false);
      }
    })();
  }, [videoId]);

  useEffect(() => {
    if (!video) return;
    // fetch channel info
    (async () => {
      try {
        const username = video.owner?.username;
        if (!username) return;
        const res = await api.get(`/user/channel/${username}`);
        if (res?.data?.data) {
          setIsSubscribed(!!res.data.data.isSubscribed);
          setSubscriberCount(res.data.data.subscriberCount || 0);
        }
      } catch (err) {
        // ignore silently
        console.warn("channel info fetch failed", err);
      }
    })();
  }, [video]);

  const handleToggleSubscribe = async () => {
    if (!isLoggedIn) {
      // redirect to login or show message
      return;
    }
    const username = video.owner?.username;
    if (!username) return;
    try {
      setSubLoading(true);
      if (isSubscribed) {
        const res = await api.post(`/user/unsubscribe/${username}`);
        setIsSubscribed(false);
        setSubscriberCount(
          res?.data?.data?.subscriberCount ?? Math.max(0, subscriberCount - 1)
        );
      } else {
        const res = await api.post(`/user/subscribe/${username}`);
        setIsSubscribed(true);
        setSubscriberCount(
          res?.data?.data?.subscriberCount ?? subscriberCount + 1
        );
      }
    } catch (err) {
      console.error("Subscribe action failed", err);
    } finally {
      setSubLoading(false);
    }
  };

  // New: Record view when video starts playing
  const handleVideoStart = async () => {
    if (!isLoggedIn || !video || hasRecordedView) return;

    try {
      // Just trigger the view by accessing the video endpoint with auth
      // The backend will handle incrementing views and recording history
      setHasRecordedView(true);
      console.log("View recorded for video:", video._id);
    } catch (err) {
      console.warn("Failed to record view:", err);
    }
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">Loading video...</div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-500">
        <div className="text-2xl text-center">
          <p>Error: {error}</p>
          <Link to="/" className="text-blue-500 hover:underline mt-4 block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // --- Render Video Not Found or missing URL ---
  if (!video) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">Video not found.</div>
      </div>
    );
  }

  // If URL missing, show helpful message
  if (!video.videoFile) {
    console.error("Missing videoFile for video:", video);
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">Video unavailable</h2>
          <p className="text-gray-400 mb-4">
            The video URL is missing or invalid. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // --- Render Success State ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto gap-8">
        {/* Main Content: Player and Details */}
        <div className="flex-grow">
          {/* Player Container - Fixed sizing */}
          <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
              ref={playerRef}
              url={video.videoFile}
              className="react-player"
              playing={playing}
              controls={true}
              width="100%"
              height="100%"
              light={video.thumbnail}
              progressInterval={1000}
              playsinline={true}
              pip={true}
              stopOnUnmount={true}
              config={{
                file: {
                  attributes: {
                    controlsList: "nodownload",
                    crossOrigin: "anonymous",
                    preload: "metadata",
                  },
                },
                youtube: { playerVars: { showinfo: 1 } },
              }}
              onError={(e) => {
                console.error("ReactPlayer error:", e);
                console.error("Video URL:", video.videoFile);
                setPlayerError(
                  "Playback failed. The video file may be unavailable or there's a network issue."
                );
                setPlaying(false);
              }}
              onStart={() => {
                handleVideoStart();
                setPlayerError(null);
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onReady={() => {
                console.log("Player ready for URL:", video.videoFile);
                setPlayerError(null);
              }}
            />
          </div>

          {playerError && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-600 rounded text-red-400">
              {playerError}
            </div>
          )}

          {/* Video Info */}
          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {video.title || "Untitled Video"}
            </h1>
            <div className="text-gray-400 text-sm mb-4">
              <span>{video.views || 0} views</span>
              <span className="mx-2">•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Uploader/Channel Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-t border-b border-gray-700">
            <Link
              to={`/c/${video.owner?.username}`}
              className="flex items-center gap-4 group mb-4 sm:mb-0"
            >
              <img
                src={
                  video.owner?.avatar ||
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="%231f2937"/><text x="50%" y="50%" fill="%239ca3af" font-family="Arial" font-size="10" dominant-baseline="middle" text-anchor="middle">User</text></svg>'
                }
                alt={video.owner?.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold text-lg text-white group-hover:text-blue-400">
                  {video.owner?.username || "Unknown Uploader"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {subscriberCount} subscribers
                </p>
              </div>
            </Link>
            <button
              onClick={handleToggleSubscribe}
              disabled={subLoading}
              className={`px-5 py-2 rounded-full font-semibold ${
                isSubscribed
                  ? "bg-gray-700 text-white"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {subLoading
                ? "Please wait..."
                : isSubscribed
                ? "Subscribed"
                : "Subscribe"}
            </button>
          </div>

          {/* Description */}
          <div className="mt-4 bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {video.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Sidebar: Recommended Videos */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4">Up Next</h2>

          {recLoading ? (
            <div className="text-gray-400 text-center py-8">
              Loading recommendations...
            </div>
          ) : recommendedVideos.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No recommended videos available.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedVideos.map((recVideo) => (
                <RecommendedVideoCard key={recVideo._id} video={recVideo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Recommended video card component
function RecommendedVideoCard({ video }) {
  const title = video.title || "Untitled Video";
  const thumbnail = video.thumbnail || placeholderDataUrl(168, 94, "No Image");
  const uploader = video.owner?.username || "Unknown";

  return (
    <Link to={`/video/${video._id}`} className="block group">
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-400">
            {title}
          </h3>
          <p className="text-gray-400 text-xs mt-1">{uploader}</p>
          <p className="text-gray-500 text-xs mt-1">{video.views || 0} views</p>
        </div>
      </div>
    </Link>
  );
}

export default VideoDetail;
