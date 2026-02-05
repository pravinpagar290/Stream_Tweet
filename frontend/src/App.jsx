import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./store/Slices/authSlice";
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

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

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
