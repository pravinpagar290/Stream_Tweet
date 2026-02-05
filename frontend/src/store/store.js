import { configureStore } from "@reduxjs/toolkit";
import uploadReducer from "./Slices/uploadSlice";
import authReducer from "./Slices/authSlice";

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
    auth: authReducer,
  },
});
