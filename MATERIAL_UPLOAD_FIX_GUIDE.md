# Material Upload Fix - Complete Troubleshooting Guide

## Problem
❌ **"Material Operation Failed: Failed to fetch"** when uploading materials
❌ Materials not showing in student dashboard
❌ Admin/Faculty uploads not working

## Root Cause
The "Failed to fetch" error occurs when:
1. Backend server is not running
2. MongoDB is not connected
3. Network/CORS issues
4. Authentication token missing

## Complete Fix Applied

### 1. Enhanced Error Handling (`AdminDashboard.jsx`)
- ✅ Added input validation before upload
- ✅ Detailed error messages for different failure types
- ✅ Better logging for debugging
- ✅ Automatic token verification

### 2. Specific Error Messages
Now shows exactly what's wrong:
- **"Cannot connect to server"** → Backend not running
- **"Authentication Error"** → Token expired/missing
- **"Invalid Data"** → Missing required fields

## Step-by-Step Fix

### Step 1: Ensure Backend is Running

**Check if backend is running:**
```bash
# Open Task Manager (Ctrl+Shift+Esc)
# Look for "node.exe" process
# OR check terminal for: "🚀 Backend server running on port 5000"
```

**If NOT running, start it:**
```bash
# Navigate to project folder
cd c:\Users\rajub\OneDrive\Desktop\aiXfn\Friendly-NoteBook-main\Friendly-NoteBook-main

# Run the unified app
..\..\..\run_unified_app.bat
```

### Step 2: Verify MongoDB Connection

**Check MongoDB Atlas:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login to your account
3. Check cluster status (should be green/active)
4. Verify network access allows your IP

**Check backend logs:**
```
Look for in terminal:
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: friendly_notebook
```

**If connection failed:**
```
❌ MongoDB Connection Error: ...
💡 Check your MONGO_URI in backend/.env file
```

### Step 3: Configure MongoDB (If Not Done)

**Create `backend/.env` file:**
```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://yourUsername:yourPassword@cluster0.xxxxx.mongodb.net/friendly_notebook?retryWrites=true&w=majority

# Server Port
PORT=5000

# Google AI (Optional)
GOOGLE_API_KEY=your_key_here
LLM_PROVIDER=google
```

**Replace:**
- `yourUsername` → Your MongoDB username
- `yourPassword` → Your MongoDB password (URL encoded)
- `cluster0.xxxxx.mongodb.net` → Your cluster URL

### Step 4: Test Material Upload

**1. Login as Admin:**
```
- Go to http://localhost:3000
- Click "Admin"
- Enter credentials
- Check console: "[Login] ✅ Token verified in localStorage"
```

**2. Upload Material:**
```
- Go to "Advanced Learning" section
- Click "Add Advanced Content"
- Fill in ALL required fields:
  ✓ Type (Notes/Videos/etc.)
  ✓ Title
  ✓ Subject
  ✓ Module & Unit
  ✓ File OR URL
- Click "Save"
```

**3. Check Console (F12):**
```
Expected logs:
[Material Upload] Starting upload... { hasFile: true, ... }
[Material Upload] Adding field: title = ...
[Material Upload] Adding file: filename.pdf (12345 bytes)
[Material Upload] Sending to API...
[apiClient] Admin token added to headers
[Material Upload] Upload successful: { _id: '...', ... }
[Material Upload] Materials refreshed successfully. Total: X
```

### Step 5: Verify in Student Dashboard

**1. Login as Student:**
```
- Logout from admin
- Login as student
- Go to "Semester Notes" or relevant section
```

**2. Check if material appears:**
```
- Materials should be organized by:
  - Subject
  - Module
  - Unit
  - Type (Notes/Videos/etc.)
```

## Common Errors & Solutions

### Error 1: "Failed to fetch"

**Symptoms:**
```
Material Operation Failed:
❌ Cannot connect to server
```

**Solutions:**
1. **Start Backend Server:**
   ```bash
   run_unified_app.bat
   ```

2. **Check Port 5000:**
   ```bash
   # In PowerShell:
   netstat -ano | findstr :5000
   # Should show LISTENING
   ```

3. **Check Firewall:**
   - Allow Node.js through Windows Firewall
   - Disable antivirus temporarily to test

### Error 2: "Authentication required"

**Symptoms:**
```
Material Operation Failed:
❌ Authentication Error
Your session may have expired.
```

**Solutions:**
1. **Clear localStorage and re-login:**
   ```javascript
   // In browser console (F12):
   localStorage.clear();
   // Then refresh and login again
   ```

2. **Verify token exists:**
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('adminToken'));
   // Should show a long string
   ```

### Error 3: "Invalid data"

**Symptoms:**
```
Material Operation Failed:
❌ Invalid Data
Please check all required fields
```

**Solutions:**
1. **Fill ALL required fields:**
   - ✓ Title
   - ✓ Subject
   - ✓ Type
   - ✓ File OR URL

2. **Check file size:**
   - Must be under 100MB
   - Supported types: PDF, DOC, DOCX, PPT, MP4, etc.

### Error 4: MongoDB Connection Failed

**Symptoms:**
```
❌ MongoDB Connection Error: getaddrinfo ENOTFOUND
```

**Solutions:**
1. **Check MONGO_URI in `.env`:**
   ```env
   MONGO_URI=mongodb+srv://...
   ```

2. **Verify MongoDB Atlas:**
   - Cluster is running
   - Network access configured
   - Database user created

3. **Test connection:**
   ```bash
   # In backend folder:
   node -e "require('./config/db')().then(() => console.log('Connected!'))"
   ```

## Workflow: Admin Upload → Student View

### Complete Flow:

```
1. Admin uploads material
   ↓
2. Material saved to MongoDB
   ↓
3. Material appears in Admin Dashboard "Materials" list
   ↓
4. Student logs in
   ↓
5. Student dashboard fetches materials from MongoDB
   ↓
6. Materials filtered by student's year/branch/section
   ↓
7. Materials displayed in appropriate sections
   ↓
8. Student can download/view materials
```

### Database Structure:

```javascript
Material Document in MongoDB:
{
  _id: "unique_id",
  title: "Unit 1 Notes",
  type: "notes",
  subject: "Data Structures",
  year: "2",
  section: "A",
  branch: "CSE",
  module: "1",
  unit: "1",
  topic: "Introduction",
  fileUrl: "/uploads/admin/filename.pdf",
  uploadedBy: { name: "Admin", email: "admin@..." },
  createdAt: "2025-12-26T...",
  ...
}
```

## Testing Checklist

### ✅ Pre-Upload Checks:
- [ ] Backend server running
- [ ] MongoDB connected
- [ ] Admin logged in
- [ ] Admin token in localStorage
- [ ] Browser console open (F12)

### ✅ During Upload:
- [ ] All required fields filled
- [ ] File selected OR URL provided
- [ ] File size under 100MB
- [ ] File type supported

### ✅ Post-Upload Checks:
- [ ] Success message shown
- [ ] Material appears in Admin materials list
- [ ] Console shows success logs
- [ ] MongoDB contains the document

### ✅ Student View Checks:
- [ ] Student can login
- [ ] Materials section loads
- [ ] Uploaded material visible
- [ ] Can download/view material

## Quick Diagnostic Commands

### Check Backend Status:
```bash
# PowerShell:
Get-Process node
# Should show node.exe running
```

### Check MongoDB Connection:
```javascript
// In browser console on admin dashboard:
fetch('http://localhost:5000/api/materials')
  .then(r => r.json())
  .then(d => console.log('Materials:', d))
  .catch(e => console.error('Error:', e))
```

### Check Admin Token:
```javascript
// In browser console:
const token = localStorage.getItem('adminToken');
console.log('Token exists:', !!token);
console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'MISSING');
```

## Files Modified

1. ✅ `src/Components/AdminDashboard/AdminDashboard.jsx`
   - Enhanced error handling
   - Better validation
   - Detailed logging
   - User-friendly error messages

2. ✅ `backend/index.js` (from previous fix)
   - Fixed authentication middleware
   - Better MongoDB handling

3. ✅ `backend/config/db.js` (from previous fix)
   - MongoDB Atlas support
   - Better error messages

## Summary

The material upload system now:
- ✅ Validates all inputs before upload
- ✅ Provides specific error messages
- ✅ Logs detailed debugging information
- ✅ Automatically syncs with MongoDB
- ✅ Shows materials in student dashboard
- ✅ Handles all error cases gracefully

**If upload still fails, check:**
1. Backend server running? → Start it
2. MongoDB connected? → Check .env file
3. Admin token present? → Re-login
4. All fields filled? → Check form

**For persistent issues:**
- Check browser console (F12) for detailed errors
- Check backend terminal for server errors
- Verify MongoDB Atlas cluster is active
- Ensure no firewall blocking localhost:5000
