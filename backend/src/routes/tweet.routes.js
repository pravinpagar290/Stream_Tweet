import { Router } from "express";
import { deleteTweet } from "../controllers/tweet.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Delete a tweet (protected)
router.delete("/:tweetId", verifyToken, deleteTweet);

export default router;
