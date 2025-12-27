# Quick Startup & Upload Checklist

## 🚀 Before You Start

### 1. Start the Application
```bash
# Double-click or run:
run_unified_app.bat
```

### 2. Wait for Success Messages
```
✅ Backend server running on port 5000
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Database: friendly_notebook
```

### 3. Open Browser
```
http://localhost:3000
```

## 📤 Upload Material (Admin/Faculty)

### Step 1: Login
- [ ] Click "Admin" or "Faculty"
- [ ] Enter credentials
- [ ] Wait for dashboard to load

### Step 2: Navigate to Upload
**Admin:**
- [ ] Click "Advanced Learning" (for programming materials)
- [ ] OR "Materials" (for course materials)

**Faculty:**
- [ ] Click "Upload Materials"

### Step 3: Fill Form
**Required Fields:**
- [ ] Type (Notes/Videos/Interview/etc.)
- [ ] Title (e.g., "Unit 1 Notes")
- [ ] Subject (select from dropdown)
- [ ] Module (1-5)
- [ ] Unit (1-5)
- [ ] File OR URL (at least one)

**Optional:**
- [ ] Section (default: All)
- [ ] Topic name
- [ ] Description

### Step 4: Upload
- [ ] Click "Save" or "Upload"
- [ ] Wait for success message
- [ ] Check material appears in list

## ✅ Verify Upload Success

### Check 1: Admin Dashboard
- [ ] Material appears in "Materials" list
- [ ] Shows correct title, subject, type

### Check 2: Student Dashboard
- [ ] Logout from admin/faculty
- [ ] Login as student
- [ ] Go to relevant section (Semester Notes/Videos/etc.)
- [ ] Material should be visible
- [ ] Can download/view material

## ❌ If Upload Fails

### Error: "Failed to fetch"
**Fix:**
1. Check backend is running (look for node.exe in Task Manager)
2. Restart: `run_unified_app.bat`
3. Wait for MongoDB connection message

### Error: "Authentication required"
**Fix:**
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh page
4. Login again

### Error: "Invalid data"
**Fix:**
1. Check ALL required fields are filled
2. Ensure file is under 100MB
3. Verify file type is supported (PDF, DOC, MP4, etc.)

## 🔍 Quick Diagnostics

### Is Backend Running?
```bash
# PowerShell:
Get-Process node
# Should show node.exe
```

### Is MongoDB Connected?
```
Check terminal for:
✅ MongoDB Connected: ...
```

### Is Token Present?
```javascript
// Browser console (F12):
localStorage.getItem('adminToken')
// Should return a long string
```

## 📊 Expected Console Logs (Success)

```
[Material Upload] Starting upload... { hasFile: true, ... }
[Material Upload] Adding field: title = Unit 1 Notes
[Material Upload] Adding file: notes.pdf (12345 bytes)
[apiClient] Admin token added to headers
[Material Upload] Upload successful: { _id: '...', ... }
[Material Upload] Materials refreshed successfully. Total: 5
✅ Material uploaded successfully!
```

## 🎯 Quick Reference

| Issue | Solution |
|-------|----------|
| Backend not running | Run `run_unified_app.bat` |
| MongoDB not connected | Check `.env` file, verify Atlas cluster |
| Token missing | Logout and login again |
| Upload fails | Check all required fields |
| Material not visible | Refresh student dashboard |

## 📞 Need Help?

1. **Check browser console (F12)** for detailed errors
2. **Check backend terminal** for server errors
3. **Verify MongoDB Atlas** cluster is active
4. **See full guide:** `MATERIAL_UPLOAD_FIX_GUIDE.md`

---

**Remember:** Backend must be running + MongoDB must be connected = Uploads work! ✅
