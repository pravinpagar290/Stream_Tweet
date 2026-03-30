import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { transcribeVideo, askAIAboutVideo } from "../services/aiService.js";
import { incrementAIQuota } from "../middlewares/quota.middleware.js";
import mongoose from "mongoose";

/**
 * POST /video/:videoId/ask-ai
 * Ask AI a question about a video
 * Body: { question: string }
 */
export const askAboutVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { question } = req.body;

  // Validate inputs
  if (!question?.trim()) {
    throw new ApiError(400, "Question is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Fetch video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  try {
    // Handle transcription: generate and cache if not exists
    let transcription = video.transcription;

    if (!transcription) {
      console.log("🎙️  No transcription found, generating...");
      // Generate transcription from video file
      transcription = await transcribeVideo(video.videoFile);

      // Cache transcription in database
      video.transcription = transcription;
      await video.save();
      console.log("💾 Transcription cached in database");
    } else {
      console.log("♻️  Using cached transcription");
    }

    // Prepare context for AI
    const context = {
      title: video.title,
      description: video.description,
      transcription: transcription,
    };

    // Get AI response
    const answer = await askAIAboutVideo(context, question);

    // Increment quota after successful response
    const updatedQuota = await incrementAIQuota(req.user._id);

    // Return response with quota info
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          question,
          answer,
          quota: updatedQuota,
        },
        "Successfully answered your question"
      )
    );
  } catch (error) {
    // Re-throw API errors (from aiService)
    if (error instanceof ApiError) {
      throw error;
    }
    // Catch unexpected errors
    throw new ApiError(500, error.message || "Failed to process your question");
  }
});

/**
 * POST /video/:videoId/transcription
 * (Optional) Manually trigger transcription generation/refresh
 * Only available to authenticated users (owner can refresh their video)
 */
export const generateTranscription = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Only owner can trigger transcription
  if (video.owner.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "You can only generate transcriptions for your videos"
    );
  }

  try {
    console.log("🎙️  Generating fresh transcription for video:", videoId);
    const transcription = await transcribeVideo(video.videoFile);
    video.transcription = transcription;
    await video.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { transcription },
          "Transcription generated and cached"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      error.message || "Failed to generate transcription"
    );
  }
});

/**
 * GET /user/quota
 * Get user's current AI quota status
 */
export const getUserQuota = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId).select(
    "aiQuotaLimit aiQuotaUsed aiQuotaResetAt"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const now = new Date();

  // Check if quota reset time has passed and reset if needed
  if (user.aiQuotaResetAt < now) {
    user.aiQuotaUsed = 0;
    user.aiQuotaResetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await user.save();
  }

  const quotaData = {
    limit: user.aiQuotaLimit,
    used: user.aiQuotaUsed,
    remaining: user.aiQuotaLimit - user.aiQuotaUsed,
    resetsAt: user.aiQuotaResetAt,
    percentageUsed: Math.round((user.aiQuotaUsed / user.aiQuotaLimit) * 100),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, quotaData, "Quota information retrieved"));
});
