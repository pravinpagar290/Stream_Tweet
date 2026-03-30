import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { BiSend } from "react-icons/bi";
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full h-[90vh] max-h-[600px] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Ask AI</h2>
            <p className="text-sm text-gray-400">{videoTitle}</p>
            {quota && (
              <div className="mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">
                    Quota: {quota.used}/{quota.limit}
                  </span>
                  <div className="w-24 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        quota.percentageUsed > 80
                          ? "bg-red-500"
                          : quota.percentageUsed > 50
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${quota.percentageUsed}%` }}
                    />
                  </div>
                  <span
                    className={`${
                      quota.remaining === 0
                        ? "text-red-400"
                        : quota.remaining <= 2
                          ? "text-yellow-400"
                          : "text-green-400"
                    }`}
                  >
                    {quota.remaining} left
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Resets: {new Date(quota.resetsAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition"
            aria-label="Close modal"
          >
            <IoClose size={24} className="text-white" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <p className="text-gray-400 mb-2">Welcome! 👋</p>
                <p className="text-gray-500 text-sm">
                  Ask me anything about this video—summary, concepts, tools
                  used, key points, etc.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : msg.role === "error"
                      ? "bg-red-900/60 text-red-100 border border-red-700"
                      : "bg-gray-800 text-gray-100"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {transcriptionGenerating && (
            <div className="flex justify-center py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-spin">⏳</div>
                <span className="text-sm">
                  Generating video transcription...
                </span>
              </div>
            </div>
          )}

          {loading && !transcriptionGenerating && (
            <div className="flex justify-center py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-spin">✨</div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          {error && (
            <div className="mb-3 p-2 bg-red-900/40 border border-red-700 rounded text-red-100 text-sm">
              {error}
            </div>
          )}

          {quota && quota.remaining === 0 && (
            <div className="mb-3 p-3 bg-red-900/50 border border-red-700 rounded text-red-100 text-sm">
              <p className="font-semibold">⚠️ Quota Exceeded</p>
              <p className="text-xs mt-1">
                Your daily quota has been used. Please try again tomorrow or
                upgrade your account.
              </p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                loading
                  ? "Waiting for response..."
                  : quota && quota.remaining === 0
                    ? "Quota exceeded"
                    : "Ask about this video..."
              }
              disabled={loading || (quota && quota.remaining === 0)}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
            />
            <button
              type="submit"
              disabled={
                loading ||
                !inputValue.trim() ||
                (quota && quota.remaining === 0)
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <BiSend size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-2">
            ⚠️ First question may take 10-30s (transcription generation)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AskAIModal;
