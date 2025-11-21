import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // This hits your GET /api/v1/user/history route
        // The verifyToken middleware will check the user's cookie
        const response = await api.get('/user/history');
        
        if (response.data && response.data.data) {
          // Assuming the API returns an array of video objects
          setHistory(response.data.data); 
        }
      } catch (err) {
        console.error("Error fetching watch history:", err);
        setError(err.response?.data?.message || "Failed to load history. Please log in.");
      } finally {
        setLoading(false);
      }
    })();
  }, []); // Empty array runs this once on component mount

  // 1. Handle Loading
  if (loading) {
    return <div className="text-white text-center p-10">Loading history...</div>;
  }

  // 2. Handle Error
  if (error) {
    return <div className="text-red-500 text-center p-10">{error}</div>;
  }

  // 3. Handle No History
  if (history.length === 0) {
    return <div className="text-gray-400 text-center p-10">Your watch history is empty.</div>;
  }

  // 4. Show History
  return (
    <div className="max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">
        Watch History
      </h1>
      <div className="space-y-4">
        {history.map((video) => (
          <HistoryVideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}

// A new component specific for this list view
function HistoryVideoCard({ video }) {
  if (!video) return null; // Safety check

  return (
    <Link 
      to={`/video/${video._id}`} 
      className="flex items-start gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
    >
      {/* Thumbnail */}
      <img
        src={video.thumbnail || 'https://via.placeholder.com/160x90'}
        alt={video.title}
        className="w-40 rounded-md object-cover flex-shrink-0"
      />
      
      {/* Video Details */}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold line-clamp-2">
          {video.title || "Untitled Video"}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {video.owner?.username || "Unknown Uploader"}
        </p>
        <p className="text-sm text-gray-400 mt-2 line-clamp-2">
          {video.description || "No description."}
        </p>
      </div>
    </Link>
  );
}

export default WatchHistory;