import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import api from "../api/axios";

const SubscribedChannels = () => {
  const [subscribedChannels,setSubscribedChannel]=useState([])
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null)

  useEffect(()=>{
    (async()=>{
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/user/subscriptions');
        const channels = response?.data?.data ?? response?.data ?? [];
        setSubscribedChannel(channels)
      } catch (error) {
        console.error('error while fetching the subscribed data', error)
        setError(
          error.normalizedMessage ||
          error.response?.data?.message ||
          "Failed to load subscribed channels. Please log in."
        );
      }finally{
        setLoading(false);
      }
    })();
  },[])

 if (loading) {
    return (
      <div className="text-white text-center p-10">Loading channels...</div>
    );
  }

 if (error) {
    return <div className="text-red-500 text-center p-10">{error}</div>;
 }

  return (
    <div className="max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Subscribed Channels</h1>
      <div className="space-y-3">
        {subscribedChannels.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-gray-400 mb-4">You are not subscribed to any channels yet.</div>
            <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Browse channels
            </Link>
          </div>
        ) : (
          subscribedChannels.map((ch) => (
            <div key={ch._id || ch.username} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
              <img src={ch.avatar || ''} alt={ch.username} className="w-10 h-10 rounded-full object-cover" />
              <div>{ch.username}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SubscribedChannels