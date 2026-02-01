import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ReactPlayer from "react-player";
import { useAuth } from "../Auth/AuthContext";
import { placeholderDataUrl } from "../utils/placeholder";

const HeartPop = ({ show }) => (
  <span
    className={`absolute -top-2 -right-2 text-red-500 text-xl transition-all duration-500 \
                ${show ? "opacity-100 scale-125" : "opacity-0 scale-0"}`}
  >
    ❤
  </span>
);

const CopiedBadge = ({ show }) => (
  <div
    className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded \
                bg-green-500 text-white text-xs transition-all \
                ${
                  show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
  >
    Copied!
  </div>
);

const PlayerSkeleton = () => (
  <div className="w-full aspect-video bg-gray-800 rounded-xl overflow-hidden animate-pulse" />
);

const RecSkeleton = () => (
  <div className="flex gap-3 animate-pulse">
    <div className="w-40 h-24 bg-gray-800 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-800 rounded" />
      <div className="h-3 bg-gray-800 rounded w-2/3" />
    </div>
  </div>
);

export default function VideoDetail() {
  const { videoId } = useParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const observerRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [playing, setPlaying] = useState(false);
  const [playerError, setPlayerError] = useState(null);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  const [hasRecordedView, setHasRecordedView] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/video/${videoId}`);
        if (!cancelled && data?.data) {
          setVideo(data.data);
          setLiked(data.data.liked);
        }
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch video.");
      } finally {
        setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [videoId]);

  useEffect(() => {
    (async () => {
      setRecLoading(true);
      try {
        const { data } = await api.get("/video/");
        const list = (data?.data || [])
          .filter((v) => v._id !== videoId)
          .slice(0, 12);
        setRecommendedVideos(list);
      } catch {
        setRecommendedVideos([]);
      } finally {
        setRecLoading(false);
      }
    })();
  }, [videoId]);

  useEffect(() => {
    if (!video?.owner?.username) return;
    (async () => {
      try {
        const { data } = await api.get(`/user/channel/${video.owner.username}`);
        setIsSubscribed(!!data?.data?.isSubscribed);
        setSubscriberCount(data?.data?.subscriberCount || 0);
      } catch {
        // Ignore errors fetching channel info
      }
    })();
  }, [video]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.code === "KeyM") {
        playerRef.current?.getInternalPlayer()?.muted
          ? (playerRef.current.getInternalPlayer().muted = false)
          : (playerRef.current.getInternalPlayer().muted = true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleLike = async () => {
    if (!isLoggedIn || !localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    setLikeLoading(true);
    try {
      const { data } = await api.post(`/video/${videoId}/like`);
      setVideo(data.data);
      setLiked(data.data.liked);
    } catch (err) {
      console.error("Like toggle failed", err);
      if (err.response?.status !== 401) {
        alert(err.response?.data?.message || "Failed to like video");
      } else {
        // If 401, redirect to login
        navigate("/login");
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const toggleSubscribe = async () => {
    if (!isLoggedIn) return navigate("/login");
    const un = video.owner.username;
    setSubLoading(true);
    try {
      if (isSubscribed) {
        const { data } = await api.post(`/user/unsubscribe/${un}`);
        setIsSubscribed(false);
        setSubscriberCount(data?.data?.subscriberCount ?? 0);
      } else {
        const { data } = await api.post(`/user/subscribe/${un}`);
        setIsSubscribed(true);
        setSubscriberCount(data?.data?.subscriberCount ?? 0);
      }
    } finally {
      setSubLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleStart = () => {
    if (!hasRecordedView && isLoggedIn) {
      setHasRecordedView(true);
    }
  };

  useEffect(() => {
    if (!observerRef.current) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => en.isIntersecting && en.target.play()),
      { threshold: 0.6 },
    );
    const els = observerRef.current.querySelectorAll("video");
    els.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [recommendedVideos]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-4">
            <PlayerSkeleton />
            <div className="h-6 bg-gray-800 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse" />
          </div>
          <aside className="w-full lg:w-96 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecSkeleton key={i} />
            ))}
          </aside>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        <div className="text-center">
          <p className="text-xl mb-4">{error}</p>
          <Link to="/" className="text-cyan-400 hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );

  if (!video || !video.videoFile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Video unavailable
      </div>
    );

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl animate-fadeIn border border-gray-800">
              <ReactPlayer
                ref={playerRef}
                url={video.videoFile}
                playing={playing}
                controls
                width="100%"
                height="100%"
                light={video.thumbnail}
                onStart={handleStart}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={(e) => {
                  console.error(e);
                  setPlayerError("Playback failed.");
                }}
                config={{
                  file: { attributes: { controlsList: "nodownload" } },
                }}
              />
              {playerError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-red-400">
                  {playerError}
                </div>
              )}
            </div>

            <div className="space-y-4 animate-slideUp">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {video.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span>{video.views || 0} views</span>
                <span>•</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                <div className="relative">
                  <button
                    onClick={toggleLike}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border border-transparent ${
                      liked
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "glass-effect hover:border-cyan-500/50 hover:text-cyan-400"
                    }`}
                  >
                    {likeLoading ? "…" : "👍"} Like
                  </button>
                  <HeartPop show={liked} />
                </div>
                <button
                  onClick={copyLink}
                  className="relative px-4 py-2 rounded-full glass-effect hover:border-cyan-500/50 hover:text-cyan-400 transition-all border border-transparent"
                >
                  Share
                  <CopiedBadge show={copied} />
                </button>
              </div>

              <div className="flex items-center justify-between glass-effect rounded-xl p-4 border border-gray-700/50 shadow-lg">
                <Link
                  to={`/c/${video.owner.username}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <img
                      src={
                        video.owner.avatar ||
                        placeholderDataUrl(50, 50, video.owner.username[0])
                      }
                      alt=""
                      className="w-12 h-12 rounded-full object-cover relative z-10 border-2 border-gray-800"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-lg group-hover:text-cyan-400 transition-colors">
                      {video.owner.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      {subscriberCount} subscribers
                    </p>
                  </div>
                </Link>
                <button
                  onClick={toggleSubscribe}
                  disabled={subLoading}
                  className={`px-6 py-2 rounded-full font-semibold transition-all shadow-lg ${
                    isSubscribed
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-red-600 text-white hover:bg-red-700 hover:shadow-red-600/30 hover:scale-105"
                  }`}
                >
                  {subLoading ? "…" : isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              <details className="glass-effect rounded-xl p-4 border border-gray-700/50">
                <summary className="cursor-pointer font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                  Description
                </summary>
                <p className="text-gray-300 mt-2 whitespace-pre-wrap leading-relaxed">
                  {video.description || "No description provided."}
                </p>
              </details>
            </div>
          </div>

          <aside className="space-y-3 animate-slideUp" ref={observerRef}>
            <h2 className="text-lg font-semibold mb-4">Up next</h2>
            {recLoading ? (
              Array.from({ length: 6 }).map((_, i) => <RecSkeleton key={i} />)
            ) : recommendedVideos.length ? (
              recommendedVideos.map((v, idx) => (
                <RecommendedCard key={v._id} video={v} delay={idx * 80} />
              ))
            ) : (
              <p className="text-gray-400 text-sm glass-effect p-4 rounded-lg text-center">
                No recommendations
              </p>
            )}
          </aside>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

function RecommendedCard({ video, delay }) {
  const title = video.title || "Untitled";
  const thumb = video.thumbnail || placeholderDataUrl(168, 94, "No Image");
  const uploader = video.owner?.username || "Unknown";
  const views = Intl.NumberFormat("en", { notation: "compact" }).format(
    video.views || 0,
  );

  return (
    <Link
      to={`/video/${video._id}`}
      className="flex gap-3 p-2 rounded-lg glass-effect hover:bg-white/5 border border-transparent hover:border-cyan-500/30 transition-all duration-300 opacity-0 animate-slideUp group"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-900 shadow-md">
        <video
          src={video.videoFile}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden group-hover:block"
          onMouseOver={(e) => e.target.play()}
          onMouseOut={(e) => e.target.pause()}
        />
        <img
          src={thumb}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{uploader}</p>
        <p className="text-xs text-gray-500">{views} views</p>
      </div>
    </Link>
  );
}
