import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video ID is required");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate("owner", "username avatar")
    .lean();

  return res
    .status(201)
    .json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});

export const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video ID is required");
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "owner.password": 0,
        "owner.refreshToken": 0,
        "owner.watchHistory": 0,
        "owner.likedVideos": 0,
        "owner.subscribers": 0,
        "owner.subscribedTo": 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limitNum,
    },
  ]);

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        totalComments,
        page: pageNum,
        totalPages: Math.ceil(totalComments / limitNum),
      },
      "Comments fetched successfully"
    )
  );
});

export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Valid comment ID is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if user is the owner of the comment
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this comment");
  }

  comment.content = content.trim();
  await comment.save();

  const populatedComment = await Comment.findById(comment._id)
    .populate("owner", "username avatar")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, populatedComment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Valid comment ID is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if user is the owner of the comment or the video owner
  const video = await import("../models/video.model.js").then(m => m.Video);
  const videoDoc = await video.findById(comment.video);
  
  const isCommentOwner = comment.owner.toString() === req.user._id.toString();
  const isVideoOwner = videoDoc?.owner.toString() === req.user._id.toString();

  if (!isCommentOwner && !isVideoOwner) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await comment.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});