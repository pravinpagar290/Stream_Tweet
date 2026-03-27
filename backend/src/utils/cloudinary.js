import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, type = "image") => {
  try {
    if (!localFilePath) return null;
    const options = {
      resource_type: type === "video" ? "video" : "auto",
      folder: type === "video" ? "videos" : "images",
    };
    if (type === "video") {
      options.eager = [
        {
          streaming_profile: "full_hd",
          format: "m3u8",
        },
      ];
      options.eager_async = true;
    }
    const response = await cloudinary.uploader.upload(localFilePath, options);

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

export { uploadOnCloudinary };
