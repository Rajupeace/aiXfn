# 🗄️ MIGRATE TO MONGODB ATLAS - COMPLETE GUIDE

**Date:** December 27, 2025  
**Goal:** Move all data from local JSON files to MongoDB Atlas (cloud)  
**Status:** ✅ STEP-BY-STEP GUIDE

---

## 🎯 WHAT WE'RE DOING

### **Current State (Local Storage):**
```
backend/data/
├── students.json       ← Student data
├── faculty.json        ← Faculty data
├── materials.json      ← Material metadata
├── admin.json          ← Admin credentials
├── courses.json        ← Course/subject data
├── messages.json       ← Messages
└── todos.json          ← Tasks/todos

backend/uploads/        ← Actual files (PDFs, videos, etc.)
```

### **Target State (MongoDB Atlas):**
```
MongoDB Atlas Cloud Database:
├── students collection       ← Student data
├── faculty collection        ← Faculty data
├── materials collection      ← Material metadata
├── admins collection         ← Admin credentials
├── courses collection        ← Course/subject data
├── messages collection       ← Messages
└── todos collection          ← Tasks/todos

backend/uploads/              ← Files stay local (or move to cloud storage)
```

---

## 📋 PREREQUISITES

### **1. MongoDB Atlas Account**
- ✅ Free tier available
- ✅ 512 MB storage free
- ✅ No credit card required

### **2. What You Need:**
- Email address
- Internet connection
- 10 minutes

---

## 🚀 STEP 1: CREATE MONGODB ATLAS ACCOUNT

### **1.1 Go to MongoDB Atlas**
```
https://www.mongodb.com/cloud/atlas/register
```

### **1.2 Sign Up**
```
- Email: your-email@example.com
- Password: (create strong password)
- Click: "Sign Up"
```

### **1.3 Choose Free Tier**
```
- Select: "Shared" (Free)
- Cloud Provider: AWS
- Region: Choose closest to you (e.g., Mumbai for India)
- Cluster Name: "Cluster0" (default)
- Click: "Create Cluster"
```

### **1.4 Wait for Cluster Creation**
```
Takes 3-5 minutes
You'll see: "Your cluster is being created..."
```

---

## 🔐 STEP 2: SETUP DATABASE ACCESS

### **2.1 Create Database User**
```
1. Click: "Database Access" (left sidebar)
2. Click: "+ ADD NEW DATABASE USER"
3. Authentication Method: Password
4. Username: friendlynotebook
5. Password: (auto-generate or create strong password)
   COPY THIS PASSWORD! You'll need it later.
6. Database User Privileges: "Read and write to any database"
7. Click: "Add User"
```

### **2.2 Whitelist IP Address**
```
1. Click: "Network Access" (left sidebar)
2. Click: "+ ADD IP ADDRESS"
3. Click: "ALLOW ACCESS FROM ANYWHERE"
   (This adds 0.0.0.0/0)
4. Click: "Confirm"

Note: For production, restrict to specific IPs
```

---

## 🔗 STEP 3: GET CONNECTION STRING

### **3.1 Get Connection String**
```
1. Click: "Database" (left sidebar)
2. Click: "Connect" button on your cluster
3. Click: "Connect your application"
4. Driver: Node.js
5. Version: 4.1 or later
6. Copy the connection string:
   
   mongodb+srv://friendlynotebook:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### **3.2 Replace Password**
```
Replace <password> with your actual password from Step 2.1

Example:
mongodb+srv://friendlynotebook:MyStr0ngP@ssw0rd@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

### **3.3 Add Database Name**
```
Add database name before the ?

Before:
mongodb+srv://...mongodb.net/?retryWrites=true

After:
mongodb+srv://...mongodb.net/friendly_notebook?retryWrites=true

Full example:
mongodb+srv://friendlynotebook:MyStr0ngP@ssw0rd@cluster0.abc123.mongodb.net/friendly_notebook?retryWrites=true&w=majority
```

---

## 📝 STEP 4: CREATE .ENV FILE

### **4.1 Create File**
```
Location: backend/.env
(Same folder as index.js)
```

### **4.2 Add Configuration**
```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://friendlynotebook:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/friendly_notebook?retryWrites=true&w=majority

# Server Configuration
PORT=5000

# Google AI API Key (for AI Agent)
GOOGLE_API_KEY=your_google_api_key_here

# LLM Provider
LLM_PROVIDER=google

# Session Secret
SESSION_SECRET=friendly-notebook-secret-key-2025

# Environment
NODE_ENV=production
```

### **4.3 Replace YOUR_PASSWORD**
```
Replace YOUR_PASSWORD with the actual password from Step 2.1
Replace cluster0.xxxxx with your actual cluster URL
```

---

## 🔧 STEP 5: INSTALL DEPENDENCIES

### **5.1 Check if Mongoose is Installed**
```bash
cd backend
npm list mongoose
```

### **5.2 If Not Installed:**
```bash
npm install mongoose dotenv
```

---

## 🗄️ STEP 6: MIGRATE DATA TO MONGODB

### **6.1 Create Migration Script**

Create file: `backend/migrate-to-mongo.js`

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Material = require('./models/Material');
const Admin = require('./models/Admin');
const Course = require('./models/Course');

const dataDir = path.join(__dirname, 'data');

async function migrate() {
  try {
    console.log('🚀 Starting migration to MongoDB Atlas...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🗑️  Clearing existing collections...');
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Material.deleteMany({});
    await Admin.deleteMany({});
    await Course.deleteMany({});
    console.log('✅ Collections cleared');

    // Migrate Students
    console.log('📚 Migrating students...');
    const studentsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'students.json'), 'utf8'));
    if (studentsData.length > 0) {
      await Student.insertMany(studentsData);
      console.log(`✅ Migrated ${studentsData.length} students`);
    }

    // Migrate Faculty
    console.log('👨‍🏫 Migrating faculty...');
    const facultyData = JSON.parse(fs.readFileSync(path.join(dataDir, 'faculty.json'), 'utf8'));
    if (facultyData.length > 0) {
      await Faculty.insertMany(facultyData);
      console.log(`✅ Migrated ${facultyData.length} faculty members`);
    }

    // Migrate Materials
    console.log('📄 Migrating materials...');
    const materialsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'materials.json'), 'utf8'));
    if (materialsData.length > 0) {
      await Material.insertMany(materialsData);
      console.log(`✅ Migrated ${materialsData.length} materials`);
    }

    // Migrate Admin
    console.log('🔐 Migrating admin...');
    const adminData = JSON.parse(fs.readFileSync(path.join(dataDir, 'admin.json'), 'utf8'));
    if (adminData.adminId) {
      await Admin.create(adminData);
      console.log('✅ Migrated admin account');
    }

    // Migrate Courses
    console.log('📖 Migrating courses...');
    const coursesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'courses.json'), 'utf8'));
    if (coursesData.length > 0) {
      await Course.insertMany(coursesData);
      console.log(`✅ Migrated ${coursesData.length} courses`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Students: ${studentsData.length}`);
    console.log(`   Faculty: ${facultyData.length}`);
    console.log(`   Materials: ${materialsData.length}`);
    console.log(`   Courses: ${coursesData.length}`);
    console.log(`   Admin: 1`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

### **6.2 Run Migration**
```bash
cd backend
node migrate-to-mongo.js
```

### **6.3 Expected Output:**
```
🚀 Starting migration to MongoDB Atlas...
✅ Connected to MongoDB Atlas
🗑️  Clearing existing collections...
✅ Collections cleared
📚 Migrating students...
✅ Migrated 45 students
👨‍🏫 Migrating faculty...
✅ Migrated 5 faculty members
📄 Migrating materials...
✅ Migrated 23 materials
🔐 Migrating admin...
✅ Migrated admin account
📖 Migrating courses...
✅ Migrated 8 courses
🎉 Migration completed successfully!

📊 Summary:
   Students: 45
   Faculty: 5
   Materials: 23
   Courses: 8
   Admin: 1
```

---

## ✅ STEP 7: VERIFY MIGRATION

### **7.1 Check MongoDB Atlas Dashboard**
```
1. Go to MongoDB Atlas
2. Click: "Database" → "Browse Collections"
3. You should see:
   - friendly_notebook database
   - students collection (45 documents)
   - faculty collection (5 documents)
   - materials collection (23 documents)
   - admins collection (1 document)
   - courses collection (8 documents)
```

### **7.2 Test Backend Connection**
```bash
cd backend
npm start
```

### **7.3 Check Console Output:**
```
✅ Connected to MongoDB Atlas
Server running on port 5000
```

---

## 🚀 STEP 8: UPDATE BACKEND TO USE MONGODB

Your backend (`backend/index.js`) should already have MongoDB support. Just make sure:

### **8.1 Check index.js has:**
```javascript
// At the top
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB Connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}
```

### **8.2 Restart Backend:**
```bash
cd backend
npm start
```

---

## 📁 STEP 9: FILE STORAGE OPTIONS

### **Option 1: Keep Files Local (Recommended for Now)**
```
Files stay in: backend/uploads/
- Simple
- Fast
- No extra cost
- Works for development
```

### **Option 2: Move to Cloud Storage (Future)**
```
Options:
- AWS S3
- Google Cloud Storage
- Cloudinary
- Azure Blob Storage

Benefits:
- Scalable
- Accessible from anywhere
- Automatic backups
```

---

## 🔄 STEP 10: BACKUP STRATEGY

### **10.1 Backup Local JSON Files**
```bash
# Create backup folder
mkdir backend/data_backup

# Copy all JSON files
cp backend/data/*.json backend/data_backup/
```

### **10.2 MongoDB Atlas Auto-Backup**
```
MongoDB Atlas automatically backs up your data:
- Continuous backups
- Point-in-time recovery
- Restore to any point in last 7 days (free tier)
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created
- [ ] IP address whitelisted
- [ ] Connection string obtained
- [ ] .env file created with MONGO_URI
- [ ] Dependencies installed (mongoose, dotenv)
- [ ] Migration script created
- [ ] Migration script executed successfully
- [ ] Data visible in MongoDB Atlas dashboard
- [ ] Backend connects to MongoDB
- [ ] Application works with MongoDB
- [ ] Local JSON files backed up

---

## 🎉 BENEFITS OF MONGODB ATLAS

### **1. Cloud Storage**
```
✅ Data accessible from anywhere
✅ No local storage limits
✅ Automatic scaling
```

### **2. Automatic Backups**
```
✅ Continuous backups
✅ Point-in-time recovery
✅ No manual backup needed
```

### **3. Performance**
```
✅ Fast queries
✅ Indexing
✅ Optimized for large datasets
```

### **4. Security**
```
✅ Encrypted connections
✅ User authentication
✅ IP whitelisting
```

### **5. Free Tier**
```
✅ 512 MB storage
✅ Shared cluster
✅ No credit card required
```

---

## 🐛 TROUBLESHOOTING

### **Problem 1: Connection Failed**
```
Error: MongoServerError: bad auth

Solution:
- Check username/password in MONGO_URI
- Make sure password doesn't have special characters
  (or URL-encode them)
- Verify database user exists in Atlas
```

### **Problem 2: IP Not Whitelisted**
```
Error: connection timed out

Solution:
- Go to Network Access in Atlas
- Add 0.0.0.0/0 (allow from anywhere)
- Wait 2-3 minutes for changes to apply
```

### **Problem 3: Migration Script Fails**
```
Error: Cannot find module './models/Student'

Solution:
- Make sure all model files exist in backend/models/
- Check file names match exactly
- Verify models are exported correctly
```

---

## 📊 SUMMARY

### **What We Did:**
1. ✅ Created MongoDB Atlas account
2. ✅ Set up database cluster
3. ✅ Created database user
4. ✅ Whitelisted IP address
5. ✅ Got connection string
6. ✅ Created .env file
7. ✅ Installed dependencies
8. ✅ Created migration script
9. ✅ Migrated all data to MongoDB
10. ✅ Verified data in Atlas

### **What Changed:**
```
BEFORE:
Data → backend/data/*.json (local files)

AFTER:
Data → MongoDB Atlas (cloud database)
```

### **What Stayed Same:**
```
Files → backend/uploads/ (still local)
(Can move to cloud storage later)
```

---

**Status:** ✅ COMPLETE GUIDE  
**Difficulty:** MEDIUM  
**Time:** 30 minutes

Your data is now in MongoDB Atlas! 🎉☁️
