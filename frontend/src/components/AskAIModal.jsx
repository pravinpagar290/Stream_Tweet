import React, { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const AskAIModal = ({ isOpen, onClose, videoId, videoTitle }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcriptionGenerating, setTranscriptionGenerating] = useState(false);
  const [quota, setQuota] = useState(null);
  const [fetchingQuota, setFetchingQuota] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch quota when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserQuota();
    }
  }, [isOpen]);

  const fetchUserQuota = async () => {
    try {
      setFetchingQuota(true);
      const response = await api.get("/video/quota/info");
      setQuota(response.data?.data);
    } catch (err) {
      console.warn("Failed to fetch quota:", err);
    } finally {
      setFetchingQuota(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setError(null);

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);

    setLoading(true);
    setTranscriptionGenerating(messages.length === 0); // First message triggers transcription

    try {
      const response = await api.post(`/video/${videoId}/ask-ai`, {
        question: userMessage,
      });

      const aiMessage = response.data?.data?.answer;
      const updatedQuota = response.data?.data?.quota;

      if (!aiMessage) {
        throw new Error("No response from AI");
      }

      // Update quota from response
      if (updatedQuota) {
        setQuota(updatedQuota);
      }

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiMessage, timestamp: new Date() },
      ]);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to get response from AI";

      setError(errorMessage);

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: `❌ ${errorMessage}`,
          timestamp: new Date(),
        },
      ]);

      console.error("AI Error:", err);
    } finally {
      setLoading(false);
      setTranscriptionGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-xl max-w-2xl w-full h-[90vh] max-h-[600px] flex flex-col"
        style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <div className="flex-1">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Ask AI</h2>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>{videoTitle}</p>
            {quota && (
              <div className="mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--text-tertiary)" }}>Quota: {quota.used}/{quota.limit}</span>
                  <div className="w-24 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${quota.percentageUsed}%`,
                        backgroundColor: quota.percentageUsed > 80 ? "var(--danger)" : quota.percentageUsed > 50 ? "#eab308" : "#22c55e",
                      }}
                    />
                  </div>
                  <span style={{ color: quota.remaining === 0 ? "var(--danger)" : quota.remaining <= 2 ? "#eab308" : "#22c55e" }}>
                    {quota.remaining} left
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  Resets: {new Date(quota.resetsAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }} aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <p className="mb-2" style={{ color: "var(--text-secondary)" }}>Welcome!</p>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Ask me anything about this video—summary, concepts, tools used, key points, etc.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg"
                style={
                  msg.role === "user"
                    ? { backgroundColor: "var(--accent)", color: "#fff" }
                    : msg.role === "error"
                      ? { backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--danger)" }
                      : { backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }
                }
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {transcriptionGenerating && (
            <div className="flex justify-center py-3">
              <div className="flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid var(--border-primary)", borderTopColor: "var(--accent)" }} />
                <span className="text-sm">Generating video transcription...</span>
              </div>
            </div>
          )}

          {loading && !transcriptionGenerating && (
            <div className="flex justify-center py-3">
              <div className="flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid var(--border-primary)", borderTopColor: "var(--accent)" }} />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
          {error && (
            <div className="mb-3 p-2 rounded text-sm" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--danger)" }}>
              {error}
            </div>
          )}

          {quota && quota.remaining === 0 && (
            <div className="mb-3 p-3 rounded text-sm" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--danger)" }}>
              <p className="font-semibold">Quota Exceeded</p>
              <p className="text-xs mt-1">Your daily quota has been used. Please try again tomorrow or upgrade your account.</p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={loading ? "Waiting for response..." : quota && quota.remaining === 0 ? "Quota exceeded" : "Ask about this video..."}
              disabled={loading || (quota && quota.remaining === 0)}
              className="flex-1 px-3.5 py-2 rounded-lg focus:outline-none disabled:opacity-50 text-sm"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim() || (quota && quota.remaining === 0)}
              className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              <span className="hidden sm:inline text-sm">Send</span>
            </button>
          </form>

          <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
            First question may take 10-30s (transcription generation)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AskAIModal;
