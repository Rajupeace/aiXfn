# MongoDB Atlas Configuration Guide

## Issue Fixed
✅ **401 Unauthorized Error** when uploading materials in Advanced Learning section
✅ **Authentication middleware** now properly validates admin tokens
✅ **MongoDB Atlas support** with better error handling

## What Was Fixed

### 1. Authentication Middleware (`backend/index.js`)
- Enhanced `requireAuthMongo` middleware to properly fall back from MongoDB to file-based authentication
- Added detailed logging to track authentication flow
- Fixed admin token validation for material uploads

### 2. Material Upload Handler (`AdminDashboard.jsx`)
- Improved error handling with specific messages for different error types
- Added automatic data refresh after successful upload
- Enhanced logging for debugging upload issues

### 3. MongoDB Connection (`backend/config/db.js`)
- Added MongoDB Atlas support with proper validation
- Improved error messages for common connection issues
- Better handling of connection strings

## MongoDB Atlas Setup (Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free tier is sufficient)

### Step 2: Configure Database Access
1. In Atlas Dashboard, go to **Database Access**
2. Click **Add New Database User**
3. Create a user with username and password
4. Grant **Read and Write** permissions
5. **Important**: Remember your username and password

### Step 3: Configure Network Access
1. Go to **Network Access**
2. Click **Add IP Address**
3. Choose **Allow Access from Anywhere** (0.0.0.0/0) for development
4. For production, add specific IP addresses

### Step 4: Get Connection String
1. Go to **Database** → **Connect**
2. Choose **Connect your application**
3. Select **Node.js** driver
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### Step 5: Update .env File
1. Open `backend/.env` file
2. Replace `<username>`, `<password>`, and `<database>` in the connection string
3. Add to .env:
   ```env
   MONGO_URI=mongodb+srv://yourUsername:yourPassword@cluster0.xxxxx.mongodb.net/friendly_notebook?retryWrites=true&w=majority
   ```

**Important Notes:**
- Replace `yourUsername` with your actual MongoDB username
- Replace `yourPassword` with your actual password (URL encode special characters)
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- The database name is `friendly_notebook` (you can change this)

### URL Encoding Special Characters
If your password contains special characters, encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `&` → `%26`

Example:
- Password: `MyP@ss:word!`
- Encoded: `MyP%40ss%3Aword!`

## Alternative: Local MongoDB

If you prefer to use local MongoDB instead of Atlas:

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Update `backend/.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/friendly_notebook
   ```

## Testing the Fix

### 1. Start the Application
```bash
# From the project root
run_unified_app.bat
```

### 2. Login as Admin
- Use your admin credentials to log in

### 3. Test Material Upload
1. Go to **Advanced Learning** section
2. Click **Add Advanced Content**
3. Fill in the form:
   - Select a subject (e.g., Python, React, etc.)
   - Add a title
   - Upload a file or provide a URL
4. Click **Save**

### 4. Check Console Logs
Open browser DevTools (F12) and check the Console for:
- `[Auth] Admin authenticated via MongoDB` or `[Auth] Admin authenticated via File DB`
- `[Material Upload] Upload successful`
- `[Material Upload] Materials refreshed from server`

## Troubleshooting

### Error: "Authentication failed"
**Solution**: Check your MongoDB username and password in MONGO_URI

### Error: "Cannot resolve MongoDB host"
**Solution**: 
- Check your internet connection
- Verify the cluster URL in MONGO_URI
- Ensure Network Access is configured in Atlas

### Error: "401 Unauthorized"
**Solution**:
1. Log out and log in again
2. Check browser console for admin token
3. Verify `localStorage.getItem('adminToken')` exists

### Error: "Local MongoDB is not running"
**Solution**:
- Start MongoDB service: `net start MongoDB` (Windows)
- Or switch to MongoDB Atlas

### Materials not showing after upload
**Solution**:
- Check browser console for errors
- Refresh the page
- Verify the material was saved in MongoDB Atlas dashboard

## Automatic Data Sync

The system now automatically:
1. ✅ Validates admin authentication before uploads
2. ✅ Saves materials to MongoDB
3. ✅ Refreshes the materials list from server
4. ✅ Updates the UI immediately

## Support

If you encounter issues:
1. Check the browser console (F12)
2. Check the backend terminal for error messages
3. Verify your MongoDB connection string
4. Ensure you're logged in as admin

## Summary of Changes

### Files Modified:
1. `backend/index.js` - Enhanced authentication middleware
2. `backend/config/db.js` - Improved MongoDB connection handling
3. `src/Components/AdminDashboard/AdminDashboard.jsx` - Better error handling and auto-refresh

### Key Improvements:
- ✅ Fixed 401 authentication errors
- ✅ Added MongoDB Atlas support
- ✅ Automatic data synchronization
- ✅ Better error messages
- ✅ Detailed logging for debugging
