import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser, logout } from "./store/Slices/authSlice";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Upload from "./pages/Upload";
import WatchHistory from "./pages/WatchHistory";
import ProtectedRoute from "./Auth/ProtectedRoute";
import Register from "./pages/Register";
import VideoDetail from "./pages/VideoDetail";
import Profile from "./pages/Profile";
import Tweet from "./pages/Tweet";
import Subscriptions from "./pages/Subscriptions";
import LikedVideos from "./pages/LikedVideos";

function App() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (isLoggedIn && (!token || !user)) {
        dispatch(logout());
      }
    };

    window.addEventListener("storage", syncAuthState);

    const interval = setInterval(syncAuthState, 1000);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      clearInterval(interval);
    };
  }, [dispatch, isLoggedIn]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="video/:videoId" element={<VideoDetail />} />
          <Route path="c/:username" element={<Profile />} />
          <Route element={<ProtectedRoute />}>
            <Route path="upload" element={<Upload />} />
            <Route path="history" element={<WatchHistory />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="tweets" element={<Tweet />} />
            <Route path="likedvideos" element={<LikedVideos />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
