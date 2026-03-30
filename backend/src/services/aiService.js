import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_BASE = "https://api.mistral.ai/v1";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_BASE = "https://api.groq.com/openai/v1";

if (!MISTRAL_API_KEY) {
  console.warn(
    "⚠️  MISTRAL_API_KEY not configured. AI features will not work. Add MISTRAL_API_KEY to .env"
  );
}

if (!GROQ_API_KEY) {
  console.warn(
    "⚠️  GROQ_API_KEY not configured. Transcription features will not work. Add GROQ_API_KEY to .env"
  );
}

/**
 * Transcribe video audio using Groq Whisper API
 * @param {string} videoUrl - URL of video file (Cloudinary HLS)
 * @returns {Promise<string>} - Transcription text
 */
export const transcribeVideo = async (videoUrl) => {
  try {
    if (!GROQ_API_KEY) {
      console.warn(
        "⚠️  GROQ_API_KEY not configured. Returning empty transcription."
      );
      return "";
    }

    if (!videoUrl) {
      console.warn("⚠️  No video URL provided. Skipping transcription.");
      return "";
    }

    console.log("🎙️  Starting transcription with Groq Whisper...");

    // Download the video file from Cloudinary
    console.log("📥 Downloading video from Cloudinary...");
    let videoBuffer;
    try {
      const response = await axios.get(videoUrl, {
        responseType: "arraybuffer",
        timeout: 120000, // 2 minute timeout for download
      });
      videoBuffer = Buffer.from(response.data);
      console.log(
        `✅ Downloaded video (${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB)`
      );
    } catch (downloadErr) {
      console.warn(
        "⚠️  Could not download video for transcription:",
        downloadErr.message
      );
      return "";
    }

    // Send to Groq Whisper API
    console.log("🚀 Sending to Groq Whisper API...");

    const formData = new FormData();
    formData.append("file", new Blob([videoBuffer]), "video.mp4");
    formData.append("model", "whisper-large-v3");
    formData.append("temperature", "0");

    const transcriptionResponse = await axios.post(
      `${GROQ_API_BASE}/audio/transcriptions`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          ...formData.getHeaders?.(),
        },
        timeout: 300000, // 5 minute timeout for transcription
      }
    );

    const transcription = transcriptionResponse.data?.text || "";

    if (!transcription || transcription.trim().length === 0) {
      console.log("ℹ️  No speech detected in video");
      return "";
    }

    console.log(
      `✅ Transcription complete (${transcription.split(" ").length} words)`
    );
    return transcription;
  } catch (error) {
    console.error("❌ Transcription error:", error.message);

    // Log detailed error info for debugging
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error(
        "   Data:",
        JSON.stringify(error.response.data).substring(0, 200)
      );
    }

    // Return empty string instead of throwing - let the system fall back to title/description
    console.log(
      "ℹ️  Transcription skipped - will use video title & description only"
    );
    return "";
  }
};

/**
 * Ask AI question about video using Mistral AI REST API
 * @param {Object} context - Video context { title, description, transcription }
 * @param {string} question - User's question
 * @returns {Promise<string>} - AI response
 */
export const askAIAboutVideo = async (context, question) => {
  try {
    if (!MISTRAL_API_KEY) {
      throw new ApiError(
        500,
        "AI service not configured. Please set MISTRAL_API_KEY in environment variables."
      );
    }

    const { title, description, transcription } = context;

    if (!title || !description) {
      throw new ApiError(
        400,
        "Video context incomplete (title/description missing)"
      );
    }

    console.log(
      "🤖 Using Mistral AI to answer:",
      question.substring(0, 50) + "..."
    );

    // Build context for Mistral
    let videoContext = `**Video Title:** ${title}\n\n**Video Description:** ${description}`;

    if (transcription && transcription.trim().length > 0) {
      videoContext += `\n\n**Video Transcript:**\n${transcription}`;
    }

    // Create the prompt
    const userMessage = `You are a helpful video analysis assistant. Answer the user's question about the provided video.

${videoContext}

---

**User Question:** ${question}

Please provide a clear, concise answer based on the video information above. If the information is not available, say so clearly.`;

    console.log("📨 Sending request to Mistral AI...");

    // Try Mistral models (from most capable to quickest)
    const models = [
      "mistral-large-latest",
      "mistral-medium-latest",
      "mistral-small-latest",
      "mistral-tiny",
    ];

    let response;
    let lastError;

    for (const model of models) {
      try {
        console.log(`   Trying model: ${model}...`);

        response = await axios.post(
          `${MISTRAL_API_BASE}/chat/completions`,
          {
            model: model,
            messages: [
              {
                role: "user",
                content: userMessage,
              },
            ],
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.95,
          },
          {
            headers: {
              Authorization: `Bearer ${MISTRAL_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );

        console.log(`   ✅ Success with model: ${model}`);
        break; // Success with this model
      } catch (err) {
        lastError = err;

        // Check if model exists
        if (
          err.response?.status === 404 ||
          err.response?.data?.error?.message?.includes("not found")
        ) {
          console.log(`   ⚠️  Model ${model} not available, trying next...`);
          continue;
        }

        // For other errors, throw immediately
        throw err;
      }
    }

    // If no model worked, throw the last error
    if (!response) {
      throw lastError || new Error("Could not connect to any Mistral model");
    }

    // Extract the response text
    const text =
      response.data?.choices?.[0]?.message?.content ||
      response.data?.choices?.[0]?.text ||
      "";

    if (!text || text.toString().trim().length === 0) {
      throw new ApiError(500, "Empty response from Mistral");
    }

    console.log(
      "✅ Mistral response generated:",
      text.toString().substring(0, 60) + "..."
    );
    return text.toString();
  } catch (error) {
    console.error("❌ Mistral error:", error.message);

    // Log detailed error info for debugging
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error(
        "   Data:",
        JSON.stringify(error.response.data).substring(0, 200)
      );
    }

    // Handle specific errors
    if (error.response?.status === 400) {
      const errorDetail = error.response?.data?.error?.message || error.message;
      throw new ApiError(400, `Mistral API error: ${errorDetail}`);
    }

    if (error.response?.status === 401 || error.message?.includes("API key")) {
      throw new ApiError(
        401,
        "Invalid Mistral API key. Please check your MISTRAL_API_KEY in .env"
      );
    }

    if (error.response?.status === 404) {
      throw new ApiError(
        404,
        "Mistral model not found. Please check available models."
      );
    }

    if (error.response?.status === 429) {
      throw new ApiError(
        429,
        "Mistral API quota exceeded. Please try again later."
      );
    }

    if (error.response?.status === 503) {
      throw new ApiError(
        503,
        "Mistral API temporarily unavailable. Try again later."
      );
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      error.message || "Failed to get response from Mistral AI"
    );
  }
};

/**
 * Simple helper to test Mistral connection
 */
export const testMistralConnection = async () => {
  try {
    if (!MISTRAL_API_KEY) {
      console.warn("❌ Mistral not initialized - MISTRAL_API_KEY missing");
      return false;
    }

    console.log("🧪 Testing Mistral AI connection...");

    // Try Mistral models
    const models = [
      "mistral-large-latest",
      "mistral-medium-latest",
      "mistral-small-latest",
      "mistral-tiny",
    ];

    let response;

    for (const model of models) {
      try {
        console.log(`   Testing model: ${model}...`);

        response = await axios.post(
          `${MISTRAL_API_BASE}/chat/completions`,
          {
            model: model,
            messages: [
              {
                role: "user",
                content: "Say 'Hello'",
              },
            ],
            temperature: 0.7,
            max_tokens: 100,
          },
          {
            headers: {
              Authorization: `Bearer ${MISTRAL_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        if (response.data?.choices?.[0]?.message?.content) {
          console.log(`✅ Mistral API connection successful! (Using ${model})`);
          return true;
        }
      } catch (err) {
        if (err.response?.status === 404) {
          console.log(`   ⚠️  Model ${model} not available`);
          continue;
        }
        throw err;
      }
    }

    console.error("❌ Could not connect to any Mistral model");
    return false;
  } catch (error) {
    console.error("❌ Mistral connection failed:", error.message);
    if (error.response?.status === 401) {
      console.error("   💡 Tip: Invalid API key. Check your MISTRAL_API_KEY");
    }
    if (error.response?.status === 429) {
      console.error("   💡 Tip: Rate limited. Wait a moment and try again.");
    }
    return false;
  }
};

/**
 * Simple helper to test Groq connection
 */
export const testGroqConnection = async () => {
  try {
    if (!GROQ_API_KEY) {
      console.warn("❌ Groq not initialized - GROQ_API_KEY missing");
      return false;
    }

    console.log("🧪 Testing Groq Whisper connection...");

    // Test with a simple request to Groq API
    console.log("   Testing Groq API endpoint...");

    const response = await axios.post(
      `${GROQ_API_BASE}/chat/completions`,
      {
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "user",
            content: "Say 'Hello'",
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      console.log("✅ Groq Whisper API connection successful!");
      return true;
    }
  } catch (error) {
    console.error("❌ Groq connection failed:", error.message);
    if (error.response?.status === 401) {
      console.error("   💡 Tip: Invalid API key. Check your GROQ_API_KEY");
    }
    if (error.response?.status === 429) {
      console.error("   💡 Tip: Rate limited. Wait a moment and try again.");
    }
    return false;
  }
};
