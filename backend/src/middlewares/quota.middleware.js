import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to check AI quota before allowing requests
 * Resets quota if 24 hours have passed since last reset
 */
export const checkAIQuota = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  // Fetch user with quota fields
  const user = await User.findById(userId).select(
    "aiQuotaLimit aiQuotaUsed aiQuotaResetAt"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const now = new Date();

  // Check if quota reset time has passed (reset every 24 hours)
  if (user.aiQuotaResetAt < now) {
    console.log(`🔄 Resetting quota for user ${userId}`);
    user.aiQuotaUsed = 0;
    user.aiQuotaResetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    await user.save();
  }

  // Check if quota exceeded
  if (user.aiQuotaUsed >= user.aiQuotaLimit) {
    const resetTime = new Date(user.aiQuotaResetAt).toLocaleString();
    throw new ApiError(
      429,
      `Quota exceeded. You've used ${user.aiQuotaUsed}/${user.aiQuotaLimit} requests. Resets on: ${resetTime}`
    );
  }

  // Attach quota info to request for later use
  req.userQuota = {
    limit: user.aiQuotaLimit,
    used: user.aiQuotaUsed,
    remaining: user.aiQuotaLimit - user.aiQuotaUsed,
    resetsAt: user.aiQuotaResetAt,
  };

  next();
});

/**
 * Increment user's quota after successful AI request
 */
export const incrementAIQuota = asyncHandler(async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { aiQuotaUsed: 1 } },
    { new: true }
  ).select("aiQuotaLimit aiQuotaUsed aiQuotaResetAt");

  return {
    limit: user.aiQuotaLimit,
    used: user.aiQuotaUsed,
    remaining: user.aiQuotaLimit - user.aiQuotaUsed,
    resetsAt: user.aiQuotaResetAt,
  };
});
