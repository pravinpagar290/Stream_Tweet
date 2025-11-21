import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ReactPlayer from 'react-player';

function VideoDetail() {
  const { videoId } = useParams(); // 1. Get ID from URL
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 3. useEffect to fetch data
    (async () => {
      if (!videoId) return; // Don't fetch if videoId is not present
      
      try {
        setLoading(true);
        setError(null);

        // 2. Call the API using POST as specified
        const response = await api.post('/video/get-video-by-id', { videoId });

        if (response.data && response.data.data) {
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

  // --- Render Video Not Found ---
  if (!video) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">Video not found.</div>
      </div>
    );
  }

  // --- Render Success State ---
  // Use optional chaining (?.) everywhere in case data is incomplete
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto gap-8">
        
        {/* Main Content: Player and Details */}
        <div className="flex-grow">
          {/* Player Wrapper: This trick maintains a 16:9 aspect ratio */}
          <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
              url={video.videoFile}
              className="absolute top-0 left-0"
              controls={true}
              width="100%"
              height="100%"
              playing={true} // Optional: auto-play
            />
          </div>

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
                src={video.owner?.avatar || 'https://via.placeholder.com/48'}
                alt={video.owner?.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold text-lg text-white group-hover:text-blue-400">
                  {video.owner?.username || "Unknown Uploader"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {video.owner?.followersCount || 0} subscribers
                </p>
              </div>
            </Link>
            <button className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-full font-semibold">
              Subscribe
            </button>
          </div>
          
          {/* Description */}
          <div className="mt-4 bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {video.description || "No description provided."}
            </p>
          </div>
          
          {/* TODO: Comments Section would go here */}

        </div>
        
        {/* Sidebar: Recommended Videos (Placeholder) */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4">Up Next</h2>
          <div className="space-y-4">
            {/* Placeholder for recommended videos */}
            <div className="bg-gray-800 p-3 rounded-lg text-center">Recommended videos...</div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">Recommended videos...</div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">Recommended videos...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoDetail;