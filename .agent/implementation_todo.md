# Implementation TODO List - Unused Features

## 📋 Overview

This document provides a step-by-step implementation plan for all unused backend features in StreamTweet.

---

## 🚀 Feature 1: Token Refresh Mechanism

### Priority: **HIGH** 🔴

### Estimated Time: 2-3 hours

### Backend (Already Done ✅)

- [x] Route exists: `POST /api/v1/user/refresh-token`
- [x] Controller exists: `refreshAccessToken`

### Frontend Implementation

#### Step 1.1: Create Token Refresh Utility

**File**: `frontend/src/utils/tokenRefresh.js`

```javascript
import api from "../api/axios";
import store from "../store/store";
import { login, logout } from "../store/Slices/authSlice";

export const refreshAccessToken = async () => {
  try {
    const response = await api.post("/user/refresh-token");
    const { accessToken, refreshToken, user } = response.data.data;

    // Update localStorage
    localStorage.setItem("token", accessToken);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    // Update Redux store
    store.dispatch(login({ user, accessToken }));

    return accessToken;
  } catch (error) {
    // Refresh failed, logout user
    store.dispatch(logout());
    throw error;
  }
};
```

#### Step 1.2: Update Axios Interceptor

**File**: `frontend/src/api/axios.js`

**Modify response interceptor to retry failed requests after token refresh:**

```javascript
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // If 401 and we haven't tried to refresh yet
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For 403 or other errors, just clear auth
    if (status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
    }

    error.normalizedMessage =
      error?.response?.data?.message || error?.message || "An error occurred";

    return Promise.reject(error);
  },
);
```

#### Step 1.3: Optional - Automatic Background Refresh

**File**: `frontend/src/App.jsx`

**Add useEffect to refresh token before expiry:**

```javascript
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  // Refresh token every 14 minutes (assuming 15 min token expiry)
  const refreshInterval = setInterval(
    () => {
      refreshAccessToken().catch(() => {
        // Silent fail - will be caught by axios interceptor
      });
    },
    14 * 60 * 1000,
  );

  return () => clearInterval(refreshInterval);
}, []);
```

**Tasks:**

- [ ] Create `frontend/src/utils/tokenRefresh.js`
- [ ] Update `frontend/src/api/axios.js` with refresh logic
- [ ] (Optional) Add background refresh in `App.jsx`
- [ ] Test token expiration scenario
- [ ] Test refresh failure scenario

---

## 🔐 Feature 2: Password Change

### Priority: **HIGH** 🔴

### Estimated Time: 3-4 hours

### Backend (Already Done ✅)

- [x] Route exists: `POST /api/v1/user/change-password`
- [x] Controller exists: `changeCurrentPassword`

### Frontend Implementation

#### Step 2.1: Create Password Change Component

**File**: `frontend/src/components/ChangePassword.jsx`

```javascript
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import toast from "react-hot-toast";

function ChangePassword({ onClose }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/user/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        email: data.email || undefined,
        username: data.username || undefined,
      });
      toast.success("Password changed successfully!");
      onClose?.();
    } catch (error) {
      toast.error(error.normalizedMessage || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Password
          </label>
          <input
            type="password"
            className="w-full glass-effect border border-gray-600 rounded-lg py-3 px-4 text-white"
            {...register("currentPassword", {
              required: "Current password is required",
            })}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-400">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <input
            type="password"
            className="w-full glass-effect border border-gray-600 rounded-lg py-3 px-4 text-white"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-400">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            className="w-full glass-effect border border-gray-600 rounded-lg py-3 px-4 text-white"
            {...register("confirmPassword", {
              required: "Please confirm password",
              validate: (value) =>
                value === watch("newPassword") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 
                     hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg
                     disabled:opacity-50 transition-all"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 
                       text-white rounded-lg transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ChangePassword;
```

#### Step 2.2: Create Settings Page

**File**: `frontend/src/pages/Settings.jsx`

```javascript
import React, { useState } from "react";
import ChangePassword from "../components/ChangePassword";
import AvatarImageChange from "../components/AvatarImageChange";

function Settings() {
  const [activeTab, setActiveTab] = useState("password");

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("password")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "password"
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab("avatar")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "avatar"
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Avatar
          </button>
        </div>

        {/* Content */}
        {activeTab === "password" && <ChangePassword />}
        {activeTab === "avatar" && <AvatarImageChange />}
      </div>
    </div>
  );
}

export default Settings;
```

#### Step 2.3: Add Route

**File**: `frontend/src/App.jsx`

```javascript
import Settings from "./pages/Settings";

// Add inside <Route element={<ProtectedRoute />}>
<Route path="settings" element={<Settings />} />;
```

#### Step 2.4: Add Settings Link to Navigation

**File**: `frontend/src/components/SideBar.jsx` or Navigation component

Add a settings link that navigates to `/settings`

**Tasks:**

- [ ] Create `ChangePassword.jsx` component
- [ ] Create `Settings.jsx` page
- [ ] Add route in `App.jsx`
- [ ] Add navigation link to Settings
- [ ] Test password change functionality
- [ ] Add email/username fields to settings if needed

---

## 👤 Feature 3: Update Account Details

### Priority: **MEDIUM** 🟡

### Estimated Time: 2-3 hours

### Backend (Already Done ✅)

- [x] Route exists: `PATCH /api/v1/user/update-account-details`
- [x] Controller exists: `updateAccountDetails`

### Frontend Implementation

#### Step 3.1: Create Edit Profile Component

**File**: `frontend/src/components/EditProfile.jsx`

```javascript
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import { getCurrentUser } from "../store/Slices/authSlice";

function EditProfile({ onClose }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.patch("/user/update-account-details", {
        fullName: data.fullName,
        email: data.email,
      });

      toast.success("Profile updated successfully!");

      // Refresh user data
      dispatch(getCurrentUser());
      onClose?.();
    } catch (error) {
      toast.error(error.normalizedMessage || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white">Edit Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            className="w-full glass-effect border border-gray-600 rounded-lg py-3 px-4 text-white"
            {...register("fullName", { required: "Full name is required" })}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-400">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full glass-effect border border-gray-600 rounded-lg py-3 px-4 text-white"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 
                     hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg
                     disabled:opacity-50 transition-all"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 
                       text-white rounded-lg transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
```

#### Step 3.2: Add to Settings Page

**File**: `frontend/src/pages/Settings.jsx`

```javascript
import EditProfile from "../components/EditProfile";

// Add new tab
<button
  onClick={() => setActiveTab("profile")}
  className={`pb-3 px-4 font-medium transition-colors ${
    activeTab === "profile"
      ? "text-cyan-500 border-b-2 border-cyan-500"
      : "text-gray-400 hover:text-white"
  }`}
>
  Profile
</button>;

// Add content
{
  activeTab === "profile" && <EditProfile />;
}
```

**Tasks:**

- [ ] Create `EditProfile.jsx` component
- [ ] Add to Settings page
- [ ] Test update functionality
- [ ] Ensure user data refreshes after update

---

## 🎬 Feature 4: Video Edit Functionality

### Priority: **MEDIUM** 🟡

### Estimated Time: 3-4 hours

### Backend (Already Done ✅)

- [x] Route exists: `PATCH /api/v1/video/:videoId`
- [x] Controller exists: `updateVideoDetails`

### Frontend Implementation

#### Step 4.1: Create Edit Video Component

**File**: `frontend/src/components/EditVideo.jsx`

```javascript
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import toast from "react-hot-toast";

function EditVideo({ video, onClose, onUpdate }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: video?.title || "",
      description: video?.description || "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(
    video?.thumbnail || "",
  );

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      const response = await api.patch(`/video/${video._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Video updated successfully!");
      onUpdate?.(response.data.data);
      onClose?.();
    } catch (error) {
      toast.error(error.normalizedMessage || "Failed to update video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white">Edit Video</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Thumbnail Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail
            </label>
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 
                       file:rounded-lg file:border-0 file:text-sm file:font-semibold
                       file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              className="w-full glass-effect border border-gray-600 rounded-lg py-3 px-4 text-white"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full glass-effect border border-gray-600 rounded-lg py-3 px-4 text-white"
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 
                       hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg
                       disabled:opacity-50 transition-all"
            >
              {loading ? "Updating..." : "Update Video"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 
                       text-white rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVideo;
```

#### Step 4.2: Add Edit Button to VideoDetail Page

**File**: `frontend/src/pages/VideoDetail.jsx`

```javascript
import EditVideo from "../components/EditVideo";
import { useState } from "react";

function VideoDetail() {
  const [showEditModal, setShowEditModal] = useState(false);
  const user = useSelector((state) => state.auth.user);

  // ... existing code ...

  const isOwner = user?._id === video?.owner?._id;

  const handleVideoUpdate = (updatedVideo) => {
    setVideo(updatedVideo);
  };

  return (
    <>
      {/* Add Edit button near delete button (only show if owner) */}
      {isOwner && (
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
        >
          Edit Video
        </button>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditVideo
          video={video}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleVideoUpdate}
        />
      )}
    </>
  );
}
```

**Tasks:**

- [ ] Create `EditVideo.jsx` component
- [ ] Add edit button to VideoDetail page
- [ ] Add owner check (only show edit to video owner)
- [ ] Test video update with thumbnail
- [ ] Test video update without thumbnail
- [ ] Add loading states and error handling

---

## 🎯 Implementation Priority Order

### Week 1: Security & Core Features

1. ✅ **Token Refresh Mechanism** (2-3 hours)
2. ✅ **Password Change** (3-4 hours)

### Week 2: User Experience

3. ✅ **Update Account Details** (2-3 hours)
4. ✅ **Video Edit Functionality** (3-4 hours)

---

## ✨ Bonus Features (Optional)

### 5. Email Verification

- Implement email verification on registration
- Add "Resend verification email" feature

### 6. Two-Factor Authentication

- Add 2FA setup in settings
- Implement OTP verification

### 7. Session Management

- Show active sessions
- Add "Logout all devices" feature

### 8. Profile Customization

- Add cover image update
- Add bio/description field
- Add social media links

---

## 🧪 Testing Checklist

### For Each Feature:

- [ ] Test happy path (normal flow)
- [ ] Test error scenarios
- [ ] Test with invalid data
- [ ] Test loading states
- [ ] Test mobile responsiveness
- [ ] Test with slow network
- [ ] Test logout during operation
- [ ] Test concurrent operations

---

## 📝 Notes

1. **Backend is Ready**: All backend endpoints already exist and work
2. **UI Consistency**: Use existing design patterns from Login/Register pages
3. **Error Handling**: Use react-hot-toast for user feedback
4. **State Management**: Update Redux store after changes
5. **Validation**: Use react-hook-form for all forms

---

_Created: 2026-02-06_
_Total Estimated Time: 10-14 hours_
