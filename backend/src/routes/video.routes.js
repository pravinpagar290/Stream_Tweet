import { Router } from "express";
import {
  getAllVideos,
  getVideoByID,
  toUploadVideo,
  updateVideoDetails,
  videoDelete
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// PUBLIC ROUTES
router.get("/", getAllVideos);                     // GET all published videos
router.get("/:videoId", getVideoByID);             // GET single video by ID


// PROTECTED ROUTES
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

router.delete(
  "/:videoId",
  verifyToken,
  videoDelete
);

export default router;
