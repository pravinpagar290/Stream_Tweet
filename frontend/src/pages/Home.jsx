import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; 

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    (async () => {
      try {
        setLoading(true);
        setError(null);
        

        const response = await api.get('/video/');

      
        if (response.data && response.data.data) {
          setVideos(response.data.data);
        } else {
          
          setVideos([]);
        }

      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to fetch videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    })(); 

  }, []); 

  
  if (loading) {
    return (
      <div className="text-white text-center text-lg p-10">
        Loading videos...
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="text-red-500 text-center text-lg p-10">
        {error}
      </div>
    );
  }

  // 3. Handle No Videos Found
  if (videos.length === 0) {
    return (
      <div className="text-gray-400 text-center text-lg p-10">
        No videos found.
      </div>
    );
  }

  
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}

// It's good practice to make the card its own component.
function VideoCard({ video }) {
  // We need to gracefully handle missing data.
  const videoTitle = video.title || "Untitled Video";
  const thumbnailUrl = video.thumbnail || "https://via.placeholder.com/300x200?text=No+Image";
  
  
  const ownerUsername = video.owner?.username || "Unknown Uploader";
  const videoViews = video.views || 0;

  return (
    <Link to={`/video/${video._id}`} className="block group">
      <div className="w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
        
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={videoTitle}
          className="w-full h-40 object-cover"
        />

        {/* Video Info */}
        <div className="p-4 text-white">
          <h3 className="font-bold text-lg mb-2 truncate" title={videoTitle}>
            {videoTitle}
          </h3>
          
          <p className="text-gray-400 text-sm mb-2">
            {ownerUsername}
          </p>

          <div className="text-gray-500 text-xs">
            <span>{videoViews} views</span>
            {/* You could add a date here if your API provides it */}
            {/* <span> • {new Date(video.createdAt).toLocaleDateString()}</span> */}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Home;