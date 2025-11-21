import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Layout from './components/Layout';
import Upload from './pages/Upload';
import WatchHistory from './pages/WatchHistory';
import ProtectedRoute from './Auth/ProtectedRoute';
import Register from './pages/Register';
import VideoDetail from './pages/VideoDetail';
// ... import other pages

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="video/:videoId" element={<VideoDetail />} />
          <Route element={<ProtectedRoute />}>
            <Route path ="upload" element={<Upload />} />
            <Route path="history" element={<WatchHistory />} />
          </Route>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;