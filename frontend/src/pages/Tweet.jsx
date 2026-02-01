import React from "react";
import api from "../api/axios";
import { useAuth } from "../Auth/AuthContext";

const Tweet = () => {
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // new state
  const [tweets, setTweets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const { user: currentUser } = useAuth();

  // fetch tweets on mount
  React.useEffect(() => {
    const fetchTweets = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/tweet"); // backend path: /api/v1/tweet
        const data = res.data?.data ?? []; // ApiResponse -> data field
        // If logged in, annotate 'liked' by checking likedBy array
        const processed = Array.isArray(data)
          ? data.map((t) => ({
              ...t,
              liked: currentUser
                ? (t.likedBy ?? []).some(
                    (id) =>
                      id === currentUser._id ||
                      id === currentUser._id?.toString(),
                  )
                : false,
            }))
          : [];
        setTweets(processed);
      } catch {
        setError("Failed to load tweets");
      } finally {
        setLoading(false);
      }
    };
    fetchTweets();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/tweet", { content: content.trim() });
      let created = res.data?.data;
      // ensure created tweet has liked flag
      if (created)
        created = { ...created, liked: false, likedBy: created.likedBy ?? [] };
      if (created) setTweets((prev) => [created, ...prev]);
      setContent("");
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.normalizedMessage;
      if (status === 401) {
        setError("Unauthorized. Please log in to post a tweet.");
      } else if (status === 409) {
        setError(serverMsg || "Conflict: could not create tweet.");
      } else {
        setError(serverMsg || "Failed to post tweet");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (tweetId) => {
    try {
      const res = await api.post(`/tweet/${tweetId}/like`);
      const updated = res.data?.data;
      if (updated) {
        // updated now contains liked and updated likedBy/likesCount
        setTweets((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t)),
        );
      } else {
        // fallback (should rarely happen now)
        setTweets((prev) =>
          prev.map((t) => {
            if (t._id !== tweetId) return t;
            const liked = !t.liked;
            const likes = (t.likesCount ?? t.likes ?? 0) + (liked ? 1 : -1);
            return { ...t, liked, likesCount: likes };
          }),
        );
      }
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message ?? err?.normalizedMessage;
      if (status === 401) {
        setError("Unauthorized. Please log in to like tweets.");
      } else if (status === 409) {
        setError(serverMsg || "Conflict while liking tweet.");
      } else {
        setError(serverMsg || "Failed to like tweet");
      }
    }
  };

  const handleDelete = async (tweetId) => {
    if (!window.confirm("Delete this tweet?")) return;
    try {
      await api.delete(`/tweet/${tweetId}`);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message ?? err?.normalizedMessage;
      if (status === 401) {
        setError("Unauthorized. Please log in to delete this tweet.");
      } else if (status === 409) {
        setError(serverMsg || "Conflict while deleting tweet.");
      } else {
        setError(serverMsg || "Failed to delete tweet");
      }
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          Tweets
        </h2>

        <div className="glass-effect rounded-xl p-4 border border-gray-700 shadow-lg">
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              maxLength={280}
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
              <span
                className={`text-sm ${content.length > 260 ? "text-red-400" : "text-gray-400"}`}
              >
                {content.length}/280
              </span>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="px-6 py-2 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/30"
              >
                {submitting ? "Posting..." : "Tweet"}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-center animate-scale-in">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="glass-effect p-4 rounded-xl border border-gray-700 animate-pulse h-32"
              ></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No tweets yet. Be the first to post!
              </div>
            ) : (
              tweets.map((tweet) => (
                <div
                  key={tweet._id}
                  className="glass-effect p-4 rounded-xl border border-gray-700/50 shadow-md hover:border-cyan-500/30 transition-all duration-300 animate-slideUp"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                        {(tweet.owner?.username?.[0] || "U").toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white hover:text-cyan-400 transition-colors cursor-pointer">
                          {tweet.owner?.username ?? tweet.owner ?? "Unknown"}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {formatTime(tweet.createdAt ?? tweet.created_at)}
                        </p>
                      </div>
                    </div>

                    {(tweet.canDelete || tweet.isOwner || tweet.own) && (
                      <button
                        onClick={() => handleDelete(tweet._id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="Delete tweet"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  <p className="text-gray-200 whitespace-pre-wrap ml-13 pl-13 mb-4 text-sm md:text-base leading-relaxed">
                    {tweet.content}
                  </p>

                  <div className="flex items-center gap-6 text-gray-400 text-sm">
                    <button
                      onClick={() => handleLike(tweet._id)}
                      className={`flex items-center gap-2 group transition-all ${tweet.liked ? "text-red-500" : "hover:text-red-400"}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform group-hover:scale-125 ${tweet.liked ? "fill-current" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{tweet.likesCount ?? tweet.likes ?? 0}</span>
                    </button>

                    <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>0</span>
                    </button>

                    <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
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
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Tweet;
