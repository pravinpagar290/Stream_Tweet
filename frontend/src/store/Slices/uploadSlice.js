import { createSlice, nanoid } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    uploads: [],
  },
  reducers: {
    addUpload(state, action) {
      state.uploads.push(action.payload);
    },
    updateProgress(state, action) {
      const { id, progress } = action.payload;
      const item = state.uploads.find((u) => u.id === id);
      if (item) {
        item.progress = progress;
        item.status = "uploading";
      }
    },
    uploadCompleted(state, action) {
      const { id, videoId } = action.payload;
      const item = state.uploads.find((u) => u.id === id);
      if (item) {
        item.progress = 100;
        item.status = "completed";
        item.videoId = videoId;
      }
    },
    uploadFailed(state, action) {
      const { id, error } = action.payload;
      const item = state.uploads.find((u) => u.id === id);
      if (item) {
        item.status = "failed";
        item.error = error;
      }
    },
    removeUpload(state, action) {
      const id = action.payload;
      state.uploads = state.uploads.filter((u) => u.id !== id);
    },
  },
});

export const upload =
  ({ title, description, videoFile, thumbnail }) =>
  async (dispatch) => {
    const id = nanoid();
    dispatch(
      uploadSlice.actions.addUpload({
        id,
        fileName: videoFile.name,
        progress: 0,
        status: "queued",
        videoId: null,
        error: null,
      }),
    );

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      const response = await api.post("/video/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          dispatch(uploadSlice.actions.updateProgress({ id, progress }));
        },
      });

      dispatch(
        uploadSlice.actions.uploadCompleted({
          id,
          videoId: response.data?.data?._id || response.data?._id,
        }),
      );
      toast.success("Upload completed");
    } catch (error) {
      let errorMessage = error.response?.data?.message || "Upload failed";
      if (typeof errorMessage !== "string") {
        errorMessage = JSON.stringify(errorMessage);
      }
      dispatch(uploadSlice.actions.uploadFailed({ id, error: errorMessage }));
      toast.error(errorMessage);
    }
  };

export const {
  addUpload,
  updateProgress,
  uploadCompleted,
  uploadFailed,
  removeUpload,
} = uploadSlice.actions;

export default uploadSlice.reducer;
