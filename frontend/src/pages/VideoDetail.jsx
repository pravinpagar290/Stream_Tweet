import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import VideoPlayer from "../components/VideoPlayer";
import { useSelector } from "react-redux";
import { placeholderDataUrl } from "../utils/placeholder";
import RecommendedCard from "../components/RecommendedCard";
import AskAIModal from "../components/AskAIModal";
import { SlLike } from "react-icons/sl";
import { BiMessageAltDetail } from "react-icons/bi";

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
  <div className="w-full aspect-video rounded-xl overflow-hidden animate-pulse" style={{ backgroundColor: "var(--bg-tertiary)" }} />
);

const RecSkeleton = () => (
  <div className="flex gap-3 animate-pulse">
    <div className="w-40 h-24 rounded-lg shrink-0" style={{ backgroundColor: "var(--bg-tertiary)" }} />
    <div className="flex-1 space-y-2">
      <div className="h-4 rounded" style={{ backgroundColor: "var(--bg-tertiary)" }} />
      <div className="h-3 rounded w-2/3" style={{ backgroundColor: "var(--bg-tertiary)" }} />
    </div>
  </div>
);

export default function VideoDetail() {
  const { videoId } = useParams();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const playerRef = useRef(null);
  const observerRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [playerError, setPlayerError] = useState(null);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  const [hasRecordedView, setHasRecordedView] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [askAIModalOpen, setAskAIModalOpen] = useState(false);

  const isOwner = user?._id === video?.owner?._id;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want delete the this video ?"))
      return;
    try {
      setLoading(true);
      await api.delete(`video/${videoId}`);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "failed to delete the video");
      setLoading(false);
    }
  };

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
    const ownerUsername = video?.owner?.userName || video?.owner?.username;
    if (!ownerUsername) return;
    (async () => {
      try {
        const { data } = await api.get(`/user/channel/${ownerUsername}`);
        setIsSubscribed(!!data?.data?.isSubscribed);
        setSubscriberCount(data?.data?.subscriberCount || 0);
      } catch {}
    })();
  }, [video]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        const player = playerRef.current;
        if (player) {
          player.paused() ? player.play() : player.pause();
        }
      }
      if (e.code === "KeyM") {
        const player = playerRef.current;
        if (player) {
          player.muted(!player.muted());
        }
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
        navigate("/login");
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const toggleSubscribe = async () => {
    if (!isLoggedIn) return navigate("/login");
    const un = video.owner.userName || video.owner.username;
    if (!un) return;
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

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    player.on("play", () => {
      if (!hasRecordedView && isLoggedIn) {
        setHasRecordedView(true);
      }
    });

    player.on("error", () => {
      setPlayerError("Playback failed.");
    });
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
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-4">
            <PlayerSkeleton />
            <div className="h-6 rounded w-2/3 animate-pulse" style={{ backgroundColor: "var(--bg-tertiary)" }} />
            <div className="h-4 rounded w-1/3 animate-pulse" style={{ backgroundColor: "var(--bg-tertiary)" }} />
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4" style={{ color: "var(--danger)" }}>{error}</p>
          <Link to="/" className="transition-colors" style={{ color: "var(--accent)" }}>
            Go home
          </Link>
        </div>
      </div>
    );

  if (!video || !video.videoFile)
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ color: "var(--text-tertiary)" }}>
        Video unavailable
      </div>
    );

  const btnStyle = {
    backgroundColor: "var(--bg-tertiary)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-primary)",
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div
              className="relative w-full aspect-video bg-black rounded-xl overflow-hidden animate-fadeIn"
              style={{ border: "1px solid var(--border-primary)" }}
            >
              <VideoPlayer
                src={video.videoFile}
                poster={video.thumbnail}
                onReady={handlePlayerReady}
              />
              {playerError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70" style={{ color: "var(--danger)" }}>
                  {playerError}
                </div>
              )}
            </div>

            <div className="space-y-4 animate-slideUp">
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {video.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>{video.views || 0} views</span>
                <span>·</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                <div className="relative">
                  <button
                    onClick={toggleLike}
                    disabled={likeLoading}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors text-sm"
                    style={liked ? { backgroundColor: "var(--danger)", color: "#fff" } : btnStyle}
                  >
                    {likeLoading ? "…" : <SlLike />} Like
                  </button>
                  <HeartPop show={liked} />
                </div>
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors text-sm"
                    style={btnStyle}
                    title="Delete Video"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={copyLink}
                  className="relative px-4 py-1.5 rounded-full transition-colors text-sm"
                  style={btnStyle}
                >
                  Share
                  <CopiedBadge show={copied} />
                </button>
                <button
                  onClick={() => setAskAIModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors text-sm"
                  style={btnStyle}
                  title="Ask AI about this video"
                >
                  <BiMessageAltDetail /> Ask AI
                </button>
              </div>

              <div
                className="flex items-center justify-between rounded-xl p-4"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <Link
                  to={`/c/${video.owner.userName || video.owner.username}`}
                  className="flex items-center gap-3 group"
                >
                  <img
                    src={
                      video.owner.avatar ||
                      placeholderDataUrl(
                        50,
                        50,
                        (video.owner.userName ||
                          video.owner.username ||
                          "U")[0],
                      )
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                    style={{ border: "2px solid var(--border-primary)" }}
                  />
                  <div>
                    <p className="font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>
                      {video.owner.userName || video.owner.username}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {subscriberCount} subscribers
                    </p>
                  </div>
                </Link>
                <button
                  onClick={toggleSubscribe}
                  disabled={subLoading}
                  className="px-5 py-1.5 rounded-full font-medium text-sm transition-colors"
                  style={
                    isSubscribed
                      ? { backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }
                      : { backgroundColor: "var(--accent)", color: "#fff" }
                  }
                >
                  {subLoading ? "…" : isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              <details
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <summary className="cursor-pointer font-semibold transition-colors" style={{ color: "var(--accent)" }}>
                  Description
                </summary>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-sm" style={{ color: "var(--text-secondary)" }}>
                  {video.description || "No description provided."}
                </p>
              </details>
            </div>
          </div>

          <aside className="space-y-3 animate-slideUp" ref={observerRef}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Up next</h2>
            {recLoading ? (
              Array.from({ length: 6 }).map((_, i) => <RecSkeleton key={i} />)
            ) : recommendedVideos.length ? (
              recommendedVideos.map((v, idx) => (
                <RecommendedCard key={v._id} video={v} delay={idx * 80} />
              ))
            ) : (
              <p
                className="text-sm p-4 rounded-lg text-center"
                style={{ color: "var(--text-tertiary)", backgroundColor: "var(--bg-secondary)" }}
              >
                No recommendations
              </p>
            )}
          </aside>
        </div>
      </div>
      <AskAIModal
        isOpen={askAIModalOpen}
        onClose={() => setAskAIModalOpen(false)}
        videoId={videoId}
        videoTitle={video?.title || "Video"}
      />
    </div>
  );
}
