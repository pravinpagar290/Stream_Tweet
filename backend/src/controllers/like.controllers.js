import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const user = req.user?._id;

  if (!videoId) {
    throw new ApiError(400, "Video Id required");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(402, "Video Not Found");
  }

  const existUser = await Like.findOne({ video: videoId, likedBy: user });

  if (existUser) {
    await existUser.deleteOne();

    // ensure numeric likesCount
    video.likesCount =
      typeof video.likesCount === "number"
        ? Math.max(0, video.likesCount - 1)
        : 0;
    await video.save();
  } else {
    await Like.create({
      video: videoId,
      likedBy: user,
    });
    video.likesCount =
      typeof video.likesCount === "number" ? video.likesCount + 1 : 1;
    await video.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video like toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
