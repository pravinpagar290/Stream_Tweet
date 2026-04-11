import { Router } from "express";
import {
  getAllVideos,
  getVideoByID,
  toUploadVideo,
  updateVideoDetails,
  videoDelete,
  likeVideo,
} from "../controllers/video.controllers.js";
import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controllers.js";
import {
  askAboutVideo,
  generateTranscription,
  getUserQuota,
} from "../controllers/ai.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkAIQuota } from "../middlewares/quota.middleware.js";

const router = Router();

router.get("/", getAllVideos);
router.get("/:videoId", getVideoByID);

// Comment routes
router.get("/:videoId/comments", getVideoComments);
router.post("/:videoId/comments", verifyToken, addComment);
router.patch("/comments/:commentId", verifyToken, updateComment);
router.delete("/comments/:commentId", verifyToken, deleteComment);

router.post(
  "/upload",
  verifyToken,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  toUploadVideo
);

router.patch(
  "/:videoId",
  verifyToken,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updateVideoDetails
);

router.delete("/:videoId", verifyToken, videoDelete);

router.post("/:videoId/like", verifyToken, likeVideo);

router.post("/:videoId/ask-ai", verifyToken, checkAIQuota, askAboutVideo);
router.post("/:videoId/transcription", verifyToken, generateTranscription);
router.get("/quota/info", verifyToken, getUserQuota);

export default router;
