# Unused Backend Features Analysis

## Overview

This document lists all backend API endpoints that are **NOT currently being used** by the frontend application.

---

## 🔴 UNUSED Backend Endpoints

### **User Routes** (`/api/v1/user`)

#### 1. **Refresh Access Token**

- **Endpoint**: `POST /api/v1/user/refresh-token`
- **Controller**: `refreshAccessToken`
- **Purpose**: Refresh expired access tokens using refresh token
- **Authentication**: None required
- **Why Unused**: Frontend doesn't implement token refresh mechanism
- **Potential Use**: Could be used to refresh tokens automatically before they expire

#### 2. **Change Password**

- **Endpoint**: `POST /api/v1/user/change-password`
- **Endpoint**: `POST /api/v1/user/change-current-password` (duplicate)
- **Controller**: `changeCurrentPassword`
- **Purpose**: Allow users to change their password
- **Authentication**: Required (`verifyToken`)
- **Why Unused**: No password settings page in frontend
- **Potential Use**: Add a "Settings" or "Account" page with password change form

#### 3. **Update Account Details**

- **Endpoint**: `PATCH /api/v1/user/update-account-details`
- **Controller**: `updateAccountDetails`
- **Purpose**: Update user's full name and email
- **Authentication**: Required (`verifyToken`)
- **Why Unused**: No profile editing functionality for name/email
- **Potential Use**: Add edit profile feature for users to update their name and email

#### 4. **Get Current User** (Missing Route)

- **Frontend Call**: `GET /api/v1/user/current-user`
- **Backend**: **This endpoint doesn't exist in routes!**
- **Status**: ⚠️ **This is likely causing errors!**
- **Why Issue**: `authSlice.js` calls this endpoint but it's not defined in backend
- **Fix Needed**: Add this route or change frontend to use existing endpoint

---

### **Video Routes** (`/api/v1/video`)

#### 5. **Update Video Details**

- **Endpoint**: `PATCH /api/v1/video/:videoId`
- **Controller**: `updateVideoDetails`
- **Purpose**: Update video title, description, thumbnail
- **Authentication**: Required (`verifyToken`)
- **Why Unused**: No video edit functionality in frontend
- **Potential Use**: Add "Edit Video" button on VideoDetail page for video owners

---

### **Tweet Routes** (`/api/v1/tweet`)

All tweet routes appear to be used ✅

---

## ✅ USED Backend Endpoints

### **User Routes** (Used)

- ✅ `POST /api/v1/user/register` - User registration
- ✅ `POST /api/v1/user/login` - User login
- ✅ `POST /api/v1/user/logout` - User logout
- ✅ `PATCH /api/v1/user/change-avatar` - Change profile avatar
- ✅ `GET /api/v1/user/c/:username` - Get public user profile
- ✅ `GET /api/v1/user/channel/:username` - Get channel info (protected)
- ✅ `GET /api/v1/user/history` - Get watch history
- ✅ `POST /api/v1/user/subscribe/:username` - Subscribe to channel
- ✅ `POST /api/v1/user/unsubscribe/:username` - Unsubscribe from channel
- ✅ `GET /api/v1/user/subscriptions` - Get subscribed channels
- ✅ `GET /api/v1/user/likedvideos` - Get liked videos

### **Video Routes** (Used)

- ✅ `GET /api/v1/video/` - Get all videos
- ✅ `GET /api/v1/video/:videoId` - Get video by ID
- ✅ `POST /api/v1/video/upload` - Upload new video
- ✅ `DELETE /api/v1/video/:videoId` - Delete video
- ✅ `POST /api/v1/video/:videoId/like` - Like/unlike video

### **Tweet Routes** (Used)

- ✅ `POST /api/v1/tweet/` - Create tweet
- ✅ `GET /api/v1/tweet/` - Get all tweets
- ✅ `POST /api/v1/tweet/:tweetId/like` - Like/unlike tweet
- ✅ `DELETE /api/v1/tweet/:tweetId` - Delete tweet

---

## 🚨 Critical Issues Found

### 1. **Missing Endpoint: `/user/current-user`**

**Problem**: Frontend calls `GET /api/v1/user/current-user` but backend doesn't have this route

**Location**: `frontend/src/store/Slices/authSlice.js:22`

```javascript
const response = await api.get("/user/current-user");
```

**Solution Options**:

1. **Add the endpoint to backend** (Recommended):
   ```javascript
   // In user.routes.js
   router.route("/current-user").get(verifyToken, getCurrentUser);
   ```
2. **Change frontend to use existing endpoint**:
   - Use `/user/c/:username` or create a proper `/user/me` endpoint

---

## 📊 Usage Summary

| Category     | Total Endpoints | Used   | Unused | Usage % |
| ------------ | --------------- | ------ | ------ | ------- |
| User Routes  | 14              | 10     | 4      | 71%     |
| Video Routes | 5               | 4      | 1      | 80%     |
| Tweet Routes | 4               | 4      | 0      | 100%    |
| **TOTAL**    | **23**          | **18** | **5**  | **78%** |

---

## 💡 Recommendations

### High Priority

1. **Fix `/user/current-user` endpoint** - This is likely causing errors
2. **Implement token refresh mechanism** - Improves security and UX
3. **Add video edit functionality** - Allows creators to update their content

### Medium Priority

4. **Add password change feature** - Important for account security
5. **Add profile edit page** - Let users update name and email

### Low Priority

6. **Remove duplicate route** - `/change-current-password` is duplicate of `/change-password`

---

## 🔧 Suggested New Features

Based on unused backend capabilities:

1. **Profile Settings Page**
   - Change password
   - Update name/email
   - Change avatar (already exists but could be improved)

2. **Video Management**
   - Edit video details after upload
   - Update thumbnail
   - Edit title/description

3. **Token Management**
   - Auto-refresh tokens before expiry
   - Silent token refresh in background
   - Better session management

---

_Generated on: 2026-02-06_
