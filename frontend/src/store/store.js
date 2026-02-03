import { configureStore } from "@reduxjs/toolkit";
import uploadReducer from "./Slices/uploadSlice";

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
  },
});
