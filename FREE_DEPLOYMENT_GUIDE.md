# 🚀 FREE DEPLOYMENT GUIDE: Frontend, Backend & Database

This guide outlines how to publish your full-stack application for **FREE** using industry-standard services.

## 🏗️ THE FREE STACK

| Component | Service | Description |
|-----------|---------|-------------|
| **Database** | **MongoDB Atlas** | Cloud NoSQL Database (Free Tier) |
| **Backend** | **Render** | Cloud Hosting for Node.js (Free Web Service) |
| **Frontend** | **Vercel** | Static & React Hosting (Free Hobby Plan) |

---

## 📦 STEP 1: DATABASE (MongoDB Atlas)

1. **Sign Up:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create Cluster:** Select **Shared** (Free) → Create.
3. **Security:**
   - **Database Access:** Create a user (e.g., `admin`) and password. **Save this password.**
   - **Network Access:** Add IP Address `0.0.0.0/0` (Allow access from anywhere).
4. **Connect:**
   - Click **Connect** → **Drivers**.
   - Copy the connection string:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`

---

## ⚙️ STEP 2: BACKEND (Render)

1. **Push Code:** Ensure your backend code is on GitHub.
2. **Sign Up:** Go to Render.
3. **New Service:** Click **New +** → **Web Service**.
4. **Connect Repo:** Select your GitHub repository.
5. **Settings:**
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js` (or whatever your start script is)
6. **Environment Variables:**
   - Add `MONGO_URI`: Paste the string from Step 1 (replace `<password>`).
   - Add `JWT_SECRET`: Your secret key for tokens.
   - **Crucial:** Ensure any admin secrets used in `FIX_ADMIN_TOKEN_MISSING.md` are added here.
7. **Deploy:** Click **Create Web Service**.
   - Copy the **Service URL** (e.g., `https://api-backend.onrender.com`).

---

## 🎨 STEP 3: FRONTEND (Vercel)

1. **Update API URL:**
   - In your frontend code, ensure API calls point to the Render URL, not `localhost:3000`.
   - Best practice: Use `process.env.REACT_APP_API_URL`.
2. **Push Code:** Push frontend code to GitHub.
3. **Sign Up:** Go to Vercel.
4. **New Project:** Click **Add New** → **Project** → Import Repo.
5. **Environment Variables:**
   - Add `REACT_APP_API_URL` (or `VITE_API_URL`).
   - Value: `https://api-backend.onrender.com` (Your Render URL).
6. **Deploy:** Click **Deploy**.

### **React Router Fix (Important)**
If you use React Router, create a file named `vercel.json` in your frontend root:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
This prevents "404 Not Found" errors when refreshing pages.

---

## 🐛 COMMON DEPLOYMENT ISSUES

### **1. Admin Token Missing in Production**
If you see the "Admin Token Missing" error after deploying:
- **Check HTTPS & CORS:** Vercel forces HTTPS. Ensure your backend allows the Vercel domain.
  ```javascript
  // In your backend index.js
  app.use(cors({
    origin: ["https://your-frontend-app.vercel.app", "http://localhost:3000"],
    credentials: true
  }));
  ```
- **Check Secrets:** Did you add the `JWT_SECRET` to Render Environment Variables?
- **Login Again:** LocalStorage is not shared between localhost and the live site. You must login again on the live site.

---

**🎉 Your app is now live!**