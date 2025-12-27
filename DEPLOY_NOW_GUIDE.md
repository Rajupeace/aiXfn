# 🚀 DEPLOY YOUR WEBSITE - STEP BY STEP

**GitHub Repo:** https://github.com/Rajupeace/aiXfn.git  
**Render Dashboard:** https://dashboard.render.com/  
**Status:** Ready to deploy!

---

## 🎯 DEPLOYMENT PLAN

```
1. Deploy Backend to Render
2. Deploy Frontend to Vercel
3. Connect everything
4. Test and go live!
```

---

## STEP 1: DEPLOY BACKEND TO RENDER

### **1.1 Go to Render Dashboard**
```
https://dashboard.render.com/
```

### **1.2 Create New Web Service**
```
1. Click: "New +" button (top right)
2. Select: "Web Service"
```

### **1.3 Connect GitHub Repository**
```
1. Click: "Connect account" (if not connected)
2. Authorize Render to access GitHub
3. Find and select: Rajupeace/aiXfn
4. Click: "Connect"
```

### **1.4 Configure Backend Service**
```
Name: friendly-notebook-backend

Region: Singapore (or closest to you)

Branch: main

Root Directory: Friendly-NoteBook-main/Friendly-NoteBook-main/backend

Runtime: Node

Build Command: npm install

Start Command: npm start

Instance Type: Free
```

### **1.5 Add Environment Variables**

Click "Advanced" → "Add Environment Variable"

Add these one by one:

```
Key: MONGO_URI
Value: mongodb+srv://your-username:your-password@cluster.mongodb.net/friendly_notebook?retryWrites=true&w=majority

Key: PORT
Value: 5000

Key: GOOGLE_API_KEY
Value: your_google_api_key_here

Key: LLM_PROVIDER
Value: google

Key: SESSION_SECRET
Value: friendly-notebook-secret-2025

Key: NODE_ENV
Value: production
```

**IMPORTANT:** Replace these with your actual values:
- `your-username` and `your-password` in MONGO_URI
- `your_google_api_key_here` with your actual Google API key

### **1.6 Create Web Service**
```
1. Click: "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Watch the logs for any errors
```

### **1.7 Get Backend URL**
```
Once deployed, you'll see:
https://friendly-notebook-backend.onrender.com

Or similar URL - COPY THIS!
```

---

## STEP 2: DEPLOY FRONTEND TO VERCEL

### **2.1 Go to Vercel**
```
https://vercel.com/login
```

### **2.2 Sign Up/Login**
```
1. Click: "Continue with GitHub"
2. Authorize Vercel
```

### **2.3 Import Project**
```
1. Click: "Add New..." → "Project"
2. Find: Rajupeace/aiXfn
3. Click: "Import"
```

### **2.4 Configure Project**
```
Framework Preset: Vite

Root Directory: Friendly-NoteBook-main/Friendly-NoteBook-main

Build Command: npm run build

Output Directory: dist

Install Command: npm install
```

### **2.5 Add Environment Variable**
```
Click: "Environment Variables"

Add:
Key: REACT_APP_API_URL
Value: https://friendly-notebook-backend.onrender.com
(Use the URL from Step 1.7)
```

### **2.6 Deploy**
```
1. Click: "Deploy"
2. Wait 2-3 minutes
3. You'll get a URL like:
   https://ai-xfn.vercel.app
```

---

## STEP 3: UPDATE CORS IN BACKEND

### **3.1 Go Back to Render**
```
https://dashboard.render.com/
```

### **3.2 Select Your Backend Service**
```
Click on: friendly-notebook-backend
```

### **3.3 Add Frontend URL**
```
1. Click: "Environment" (left sidebar)
2. Click: "Add Environment Variable"
3. Add:
   Key: FRONTEND_URL
   Value: https://ai-xfn.vercel.app
   (Use your actual Vercel URL)
4. Click: "Save Changes"
```

### **3.4 Wait for Redeploy**
```
Service will automatically redeploy (2-3 minutes)
```

---

## STEP 4: TEST YOUR WEBSITE

### **4.1 Open Your Website**
```
https://ai-xfn.vercel.app
(Your actual Vercel URL)
```

### **4.2 Test Login**
```
1. Click: "Admin Login"
2. Admin ID: ReddyFBN@1228
3. Password: ReddyFBN
4. Click: Login
```

### **4.3 Test Features**
```
✅ Can you see the dashboard?
✅ Can you add a student?
✅ Can you upload a material?
✅ Does AI agent work?
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] Frontend deployed to Vercel
- [ ] Frontend URL copied
- [ ] Environment variables added to both
- [ ] CORS updated in backend
- [ ] Website opens
- [ ] Can login
- [ ] Features work

---

## 🎉 YOUR WEBSITE IS LIVE!

### **URLs:**
```
Frontend: https://ai-xfn.vercel.app
Backend: https://friendly-notebook-backend.onrender.com
Database: MongoDB Atlas (already setup)
```

### **Share with Students:**
```
Send them: https://ai-xfn.vercel.app

They can:
✅ Register accounts
✅ Login
✅ View materials
✅ Download files
✅ Use AI agent
```

---

## 🐛 TROUBLESHOOTING

### **Problem 1: Backend deployment fails**
```
Check Render logs:
1. Go to your service
2. Click: "Logs"
3. Look for errors

Common issues:
- Wrong root directory
- Missing dependencies
- MongoDB connection error
```

**Solution:**
```
1. Verify root directory is correct:
   Friendly-NoteBook-main/Friendly-NoteBook-main/backend

2. Check MONGO_URI is correct

3. Make sure all environment variables are set
```

### **Problem 2: Frontend shows blank page**
```
Check Vercel logs:
1. Go to your project
2. Click: "Deployments"
3. Click on latest deployment
4. Check logs
```

**Solution:**
```
1. Verify root directory:
   Friendly-NoteBook-main/Friendly-NoteBook-main

2. Check REACT_APP_API_URL is set

3. Make sure build command is: npm run build
```

### **Problem 3: CORS errors**
```
Error: "Access to fetch blocked by CORS policy"
```

**Solution:**
```
1. Go to Render backend service
2. Add FRONTEND_URL environment variable
3. Value should be your Vercel URL
4. Save and wait for redeploy
```

### **Problem 4: Backend sleeps (free tier)**
```
First request after 15 min takes ~30 seconds
```

**Solution:**
```
This is normal for free tier
Options:
1. Wait 30 seconds for wake up
2. Upgrade to paid tier ($7/month)
3. Use a ping service to keep it awake
```

---

## 📊 MONITORING

### **Vercel Dashboard:**
```
https://vercel.com/dashboard

Check:
- Deployments
- Analytics
- Logs
- Performance
```

### **Render Dashboard:**
```
https://dashboard.render.com/

Check:
- Service status
- Logs
- Metrics
- Events
```

### **MongoDB Atlas:**
```
https://cloud.mongodb.com/

Check:
- Database size
- Queries
- Connections
- Backups
```

---

## 🔄 UPDATING YOUR WEBSITE

### **To Update Code:**

```bash
# Make changes to your code
# Then push to GitHub:

git add .
git commit -m "Update: description of changes"
git push origin main

# Vercel and Render will auto-deploy! ✅
```

---

## 💰 COSTS

```
Frontend (Vercel):     $0/month
Backend (Render):      $0/month
Database (MongoDB):    $0/month
─────────────────────────────
TOTAL:                 $0/month
```

**Free tier is enough for:**
- 100+ students
- 10+ faculty
- 1000s of materials
- Unlimited page views

---

## 🎯 NEXT STEPS

### **1. Test Everything**
```
✅ Login as admin
✅ Add students
✅ Add faculty
✅ Upload materials
✅ Test AI agent
```

### **2. Share with Users**
```
Send URL to:
- Students
- Faculty
- Admin staff
```

### **3. Monitor Usage**
```
Check dashboards daily:
- Vercel analytics
- Render logs
- MongoDB metrics
```

### **4. Optional: Custom Domain**
```
Buy domain: friendlynotebook.com
Add to Vercel and Render
Professional URL!
```

---

## 📝 IMPORTANT NOTES

### **Render Free Tier:**
```
⚠️ Service sleeps after 15 min of inactivity
✅ Wakes up on first request (~30 sec)
✅ Enough for development/testing
✅ Upgrade to paid for production
```

### **Vercel Free Tier:**
```
✅ Always on
✅ Fast global CDN
✅ Automatic HTTPS
✅ Perfect for production
```

### **MongoDB Atlas:**
```
✅ 512 MB storage free
✅ Automatic backups
✅ Enough for 1000s of users
```

---

## 🎉 SUMMARY

### **What We Did:**
```
1. ✅ Deployed backend to Render
2. ✅ Deployed frontend to Vercel
3. ✅ Connected to MongoDB Atlas
4. ✅ Configured CORS
5. ✅ Tested everything
```

### **What You Get:**
```
✅ Live website online
✅ Students can access
✅ Faculty can upload
✅ Admin can manage
✅ AI agent works
✅ Data in cloud
✅ FREE hosting
```

---

**Status:** ✅ READY TO GO LIVE  
**Time:** 30 minutes  
**Cost:** $0/month

**Follow these steps and your website will be live!** 🚀🌐✨
