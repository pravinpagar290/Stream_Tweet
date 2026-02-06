import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const subscribeToChannel = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user?._id;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channelUser = await User.findOne({ username: username.toLowerCase() });
  if (!channelUser) {
    throw new ApiError(404, "Channel not found");
  }

  if (channelUser._id.equals(currentUserId)) {
    throw new ApiError(400, "Cannot subscribe to your own channel");
  }

  const existing = await Subscription.findOne({
    subscriber: currentUserId,
    channel: channelUser._id,
  });

  if (existing) {
    const count = await Subscription.countDocuments({
      channel: channelUser._id,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscriberCount: count, isSubscribed: true },
          "Already subscribed"
        )
      );
  }

  await Subscription.create({
    subscriber: currentUserId,
    channel: channelUser._id,
  });

  const subscriberCount = await Subscription.countDocuments({
    channel: channelUser._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriberCount, isSubscribed: true },
        "Subscribed successfully"
      )
    );
});

const unsubscribeFromChannel = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user?._id;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channelUser = await User.findOne({ username: username.toLowerCase() });
  if (!channelUser) {
    throw new ApiError(404, "Channel not found");
  }

  const deleted = await Subscription.findOneAndDelete({
    subscriber: currentUserId,
    channel: channelUser._id,
  });

  const subscriberCount = await Subscription.countDocuments({
    channel: channelUser._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriberCount, isSubscribed: false },
        "Unsubscribed successfully"
      )
    );
});

const getChannelInfo = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user?._id || null;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channelUser = await User.findOne({
    username: username.toLowerCase(),
  }).select("-password -refreshToken");

  if (!channelUser) {
    throw new ApiError(404, "Channel not found");
  }

  const subscriberCount = await Subscription.countDocuments({
    channel: channelUser._id,
  });

  let isSubscribed = false;
  if (currentUserId) {
    const found = await Subscription.findOne({
      subscriber: currentUserId,
      channel: channelUser._id,
    });
    isSubscribed = !!found;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { channel: channelUser, subscriberCount, isSubscribed },
        "Channel info fetched"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  if (!req?.user) {
    throw new ApiError(401, "Authentication required");
  }

  try {
    const user = req.user._id;
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    console.debug(`[subscriptions] fetching for user: ${user}`);

    const subscriptions = await Subscription.find({
      subscriber: user,
    }).populate("channel", "username avatar");

    console.debug(`[subscriptions] found ${subscriptions.length} records`);

    const channels = subscriptions.map((sub) => sub.channel);

    return res
      .status(200)
      .json(new ApiResponse(200, channels, "Subscribed channels fetched"));
  } catch (error) {
    console.error("[subscriptions] error", error);
    throw new ApiError(500, "Failed to fetch subscriptions");
  }
});

export {
  subscribeToChannel,
  unsubscribeFromChannel,
  getChannelInfo,
  getSubscribedChannels,
};
