require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const multer = require('multer');
const connectDB = require('./config/db');

// Import Mongoose Models
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const materialController = require('./controllers/materialController');

const app = express();
app.use(cors());
app.use(express.json());
// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
let server;

const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbFile = (name, initial) => {
  const p = path.join(dataDir, name + '.json');
  if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify(initial, null, 2));
  return {
    read: () => {
      try { return JSON.parse(fs.readFileSync(p, 'utf8') || 'null') || initial; } catch (e) { return initial; }
    },
    write: (v) => { fs.writeFileSync(p, JSON.stringify(v, null, 2)); }
  };
};

const studentsDB = dbFile('students', []);
const facultyDB = dbFile('faculty', []);
const materialsDB = dbFile('materials', []);
const messagesDB = dbFile('messages', []);
const adminDB = dbFile('admin', { adminId: 'ReddyFBN@1228', password: 'ReddyFBN' });
const coursesDB = dbFile('courses', []);
const studentFacultyDB = dbFile('studentFaculty', []); // Store student-faculty relationships
const todosDB = dbFile('todos', []);

// --- TODO ROUTES ---
app.get('/api/todos', (req, res) => {
  const { role } = req.query;
  let all = todosDB.read();
  if (role && role !== 'admin') {
    all = all.filter(t => t.target === 'all' || t.target === role);
  }
  res.json(all);
});

app.post('/api/todos', (req, res) => {
  const { text, target, dueDate } = req.body;
  const all = todosDB.read();
  const item = {
    id: uuidv4(),
    text,
    target: target || 'admin',
    dueDate,
    completed: false,
    createdAt: new Date().toISOString()
  };
  all.push(item);
  todosDB.write(all);
  res.status(201).json(item);
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const all = todosDB.read();
  const idx = all.findIndex(t => t.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...req.body };
    todosDB.write(all);
    res.json(all[idx]);
  } else {
    res.status(404).json({ error: 'not found' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const all = todosDB.read();
  const next = all.filter(t => t.id !== id);
  todosDB.write(next);
  res.json({ ok: true });
});

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const chatRoutes = require('./routes/chat');

// Use teaching assignment routes
// app.use('/api/teaching-assignments', teachingAssignmentRoutes);
// app.use('/api/students', studentRoutes);
app.use('/api/chat', chatRoutes);

// Multer setup for file uploads (MongoDB) - Organized by role
// const storageMongo = multer.diskStorage({
//   destination: (req, file, cb) => {
//     try {
//       // Determine upload folder based on user role
//       let uploadFolder = uploadsDir;

//       // Check which token is present to determine role
//       const adminToken = req.headers['x-admin-token'];
//       const facultyToken = req.headers['x-faculty-token'];

//       if (adminToken) {
//         uploadFolder = path.join(uploadsDir, 'admin');
//       } else if (facultyToken) {
//         uploadFolder = path.join(uploadsDir, 'faculty');
//       }

//       // Create folder if it doesn't exist
//       if (!fs.existsSync(uploadFolder)) {
//         fs.mkdirSync(uploadFolder, { recursive: true });
//       }

//       cb(null, uploadFolder);
//     } catch (e) {
//       console.error('Upload destination error:', e);
//       cb(e, uploadsDir);
//     }
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
//     cb(null, uniqueSuffix + '-' + sanitizedName);
//   }
// });

// const uploadMongo = multer({
//   storage: storageMongo,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
//   fileFilter: (req, file, cb) => {
//     // Check Extension
//     const filetypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|text|jpg|jpeg|png|gif|mp4|avi|mov|zip|rar|csv|py|java|c|cpp|js|html|css|sql|json/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     // Check MimeType
//     // We allow standard mime types that contain our allowed extensions
//     // e.g. text/plain (contains 'text'), video/mp4 (contains 'mp4'), application/pdf (contains 'pdf')
//     const mimetype = filetypes.test(file.mimetype);

//     // Explicitly allow text/plain if extension is safe
//     const isText = file.mimetype === 'text/plain';

//     if ((mimetype && extname) || (isText && extname)) {
//       return cb(null, true);
//     } else {
//       console.warn(`[Upload Blocked] File: ${file.originalname}, Mime: ${file.mimetype}`);
//       cb(new Error('Invalid file type. Only documents, images, videos, and archives are allowed.'));
//     }
//   }
// });

// Middleware for Auth (Admin OR Faculty) - DB Agnostic - COMMENTED OUT FOR DEBUGGING
// requireAuthMongo function removed to isolate server stability issues

app.get('/api/materials', async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return materialController.getMaterials(req, res, next);
  } else {
    // Fallback to file-based storage
    const { year, section, subject, type, course, branch } = req.query;
    const all = materialsDB.read();
    let filtered = all;
    if (year && year !== 'All') filtered = filtered.filter(m => String(m.year) === String(year));
    if (section && section !== 'All') filtered = filtered.filter(m => String(m.section) === String(section));
    if (branch && branch !== 'All') filtered = filtered.filter(m => m.branch === branch || !m.branch);
    if (subject) filtered = filtered.filter(m => String(m.subject) === String(subject));
    if (type) filtered = filtered.filter(m => String(m.type) === String(type));
    if (course) filtered = filtered.filter(m => String(m.course) === String(course));
    return res.json(filtered);
  }
});
// app.get('/api/materials/:id', materialController.getMaterialById);

// Simple local multer upload middleware (stores files under backend/uploads)
const storageLocal = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (e) {
      cb(e, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const uploadLocal = multer({ storage: storageLocal, limits: { fileSize: 200 * 1024 * 1024 } });

// Helper to Handle File-Based Material Upload
const handleFileBasedUpload = (req, res) => {
  try {
    const { title, year, section, subject, type, course, branch, module, unit, topic, link, message, dueDate, semester } = req.body;

    // Basic Validation
    if (!title && !req.file && !link) {
      console.error('Upload Validation Failed: Missing Title/File/Link', req.body);
      return res.status(400).json({ message: 'Title, File, or Link is required' });
    }
    if (!subject || !type) {
      console.error('Upload Validation Failed: Missing Subject/Type', req.body);
      return res.status(400).json({ message: 'Subject and Type are required' });
    }

    const all = materialsDB.read();
    const id = uuidv4();

    // File info from uploadMongo middleware
    let fileUrl = null;
    let filename = null;
    let fileType = null;
    let fileSize = null;

    if (req.file && req.file.path) {
      // req.file.path is absolute, we need relative to uploads dir for URL
      // Uploads are in backend/uploads/admin or backend/uploads/faculty
      // We want URL to be /uploads/admin/filename
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const relPath = path.relative(uploadsDir, req.file.path);
      fileUrl = `${baseUrl}/uploads/${relPath}`.replace(/\\/g, '/');
      filename = req.file.filename;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
    } else if (link) {
      fileUrl = link;
    }

    const user = req.user || authFromHeaders(req);

    const item = {
      id,
      _id: id, // maintain interface
      title: title || (req.file ? req.file.originalname : 'Untitled'),
      description: req.body.description || '',
      year: year || 'All',
      section: section || 'All',
      semester: semester ? String(semester) : null,
      subject,
      type,
      course: course || null,
      branch: branch || null,
      module: module ? String(module) : null,
      unit: unit ? String(unit) : null,
      topic: topic || null,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      filename,
      fileUrl: fileUrl,
      url: fileUrl, // legacy support
      fileType,
      fileSize,
      originalName: req.file ? req.file.originalname : null,
      uploadedBy: user ? { name: user.name, role: user.role, id: user.id } : null,
      uploaderId: user ? user.id : null
    };

    // Type specific fields
    if (type === 'videos' && message) item.duration = message;
    if ((type === 'modelPapers' || type === 'previousQuestions') && dueDate) item.examYear = dueDate;

    all.push(item);
    materialsDB.write(all);
    res.status(201).json(item);
  } catch (err) {
    console.error('File-based upload error:', err);
    console.error(err.stack); // Log full stack trace
    res.status(500).json({ message: 'Failed to save material (File Mode)', error: err.message });
  }
};

app.post('/api/materials', /* requireAuthMongo, */ uploadLocal.single('file'), (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && typeof materialController !== 'undefined' && materialController.uploadMaterial) {
      req.user = req.user || authFromHeaders(req);
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed. Please log in again.' });
      }
      return materialController.uploadMaterial(req, res);
    }
    return handleFileBasedUpload(req, res);
  } catch (err) {
    console.error('Upload route error:', err);
    return res.status(500).json({ message: 'Upload failed', details: err.message });
  }
});

// Update existing material (file-based or Mongo fallback)
app.put('/api/materials/:id', /* requireAuthMongo, */ uploadLocal.single('file'), (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && typeof materialController !== 'undefined' && materialController.updateMaterial) {
      req.user = req.user || authFromHeaders(req);
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed.' });
      }
      return materialController.updateMaterial(req, res);
    }
    // For file-based storage, delegate to existing handler
    return handleFileBasedUpdate(req, res);
  } catch (err) {
    console.error('PUT /api/materials error:', err);
    return res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// Debug upload endpoint to inspect multipart parsing
app.post('/api/debug-upload', uploadLocal.single('file'), (req, res) => {
  try {
    const log = {
      timestamp: new Date().toISOString(),
      body: req.body || null,
      file: req.file || null
    };
    // append to debug log
    try { fs.appendFileSync(path.join(dataDir, 'upload_debug.log'), JSON.stringify(log) + '\n'); } catch (e) { }
    res.json({ ok: true, received: log });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// app.put('/api/materials/:id', requireAuthMongo, uploadMongo.single('file'), async (req, res, next) => {
//   if (mongoose.connection.readyState === 1) {
//     // Check if material exists in MongoDB
//     const Material = require('./models/Material');
//     const mongoMaterial = await Material.findById(req.params.id);
//     if (mongoMaterial) {
//       return materialController.updateMaterial(req, res, next);
//     } else {
//       // Fallback to file-based update
//       console.log('Material not found in MongoDB, trying file-based update');
//       return handleFileBasedUpdate(req, res);
//     }
//   } else {
//     return handleFileBasedUpdate(req, res);
//   }
// });

const handleFileBasedUpdate = (req, res) => {
  try {
    const { id } = req.params;
    const all = materialsDB.read();
    const idx = all.findIndex(m => m.id === id || m._id === id);

    if (idx === -1) return res.status(404).json({ message: 'Material not found' });

    // Resolve user (support header-based auth in file-mode)
    const user = req.user || authFromHeaders(req);
    const material = all[idx];
    if (!(user && (user.role === 'admin' || String(material.uploaderId) === String(user.id)))) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    const updatedItem = { ...material, ...updates };

    if (req.file) {
      // Remove previous file if it was stored under /uploads
      try {
        if (material && material.fileUrl && String(material.fileUrl).startsWith('/uploads')) {
          const relPrev = String(material.fileUrl).replace(/^\/uploads\//, '').replace(/\//g, path.sep);
          const pPrev = path.join(uploadsDir, relPrev);
          if (fs.existsSync(pPrev)) {
            try { fs.unlinkSync(pPrev); } catch (e) { console.warn('Failed to unlink previous file', pPrev, e); }
          }
        } else if (material && material.filename) {
          const p2 = path.join(uploadsDir, material.filename);
          if (fs.existsSync(p2)) {
            try { fs.unlinkSync(p2); } catch (e) { console.warn('Failed to unlink previous file', p2, e); }
          }
        }
      } catch (e) { console.warn('Error while cleaning previous file:', e); }

      // Update file info
      const relPath = path.relative(uploadsDir, req.file.path);
      updatedItem.fileUrl = `/uploads/${relPath}`.replace(/\\/g, '/');
      updatedItem.url = updatedItem.fileUrl;
      updatedItem.filename = req.file.filename;
      updatedItem.fileType = req.file.mimetype;
      updatedItem.fileSize = req.file.size;
    }

    all[idx] = updatedItem;
    materialsDB.write(all);
    res.json(updatedItem);
  } catch (err) {
    console.error('File-based update error:', err);
    res.status(500).json({ message: 'Failed to update material' });
  }
};

app.delete('/api/materials/:id', async (req, res, next) => {
  try {
    req.user = req.user || authFromHeaders(req);
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    if (mongoose.connection.readyState === 1 && typeof materialController !== 'undefined' && materialController.deleteMaterial) {
      return materialController.deleteMaterial(req, res, next);
    } else {
      // File-based delete
      try {
        const { id } = req.params;
        const all = materialsDB.read();
        const idx = all.findIndex(m => m.id === id || m._id === id);

        if (idx === -1) return res.status(404).json({ message: 'Material not found' });

        const material = all[idx];
        // Allow admin or owner
        if (String(material.uploaderId) !== String(req.user.id) && req.user.role !== 'admin') {
          return res.status(401).json({ message: 'Not authorized' });
        }

        const newAll = all.filter((_, i) => i !== idx);
        materialsDB.write(newAll);
        res.json({ message: 'Material removed' });
      } catch (err) {
        console.error('File-based delete error:', err);
        res.status(500).json({ message: 'Failed to delete material' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// API endpoint to list content_source files
app.get('/api/content-source', /* requireAuthMongo, */(req, res) => {
  try {
    const contentRoot = path.join(uploadsDir, 'content_source');
    if (!fs.existsSync(contentRoot)) {
      return res.json([]);
    }

    const subjects = fs.readdirSync(contentRoot, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const subjectPath = path.join(contentRoot, dirent.name);
        const types = fs.readdirSync(subjectPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(typeDirent => {
            const typePath = path.join(subjectPath, typeDirent.name);
            const chapters = fs.readdirSync(typePath, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())
              .map(chapterDirent => {
                const chapterPath = path.join(typePath, chapterDirent.name);
                const files = fs.readdirSync(chapterPath, { withFileTypes: true })
                  .filter(dirent => dirent.isFile())
                  .map(fileDirent => ({
                    name: fileDirent.name,
                    url: `/uploads/content_source/${dirent.name}/${typeDirent.name}/${chapterDirent.name}/${fileDirent.name}`,
                    size: fs.statSync(path.join(chapterPath, fileDirent.name)).size
                  }));
                return {
                  chapter: chapterDirent.name,
                  files: files
                };
              });
            return {
              type: typeDirent.name,
              chapters: chapters
            };
          });
        return {
          subject: dirent.name,
          types: types
        };
      });

    res.json(subjects);
  } catch (error) {
    console.error('Error listing content source:', error);
    res.status(500).json({ error: 'Failed to list content source files' });
  }
});

// simple admin-check middleware
function requireAdmin(req, res, next) {
  // Support both custom headers and standard Bearer token
  const bearer = req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
  const token = req.headers['x-admin-token'] || bearer;

  if (!token) {
    console.warn(`[Auth] Admin token missing. Received headers: ${JSON.stringify(req.headers)}`);
    return res.status(401).json({ error: 'Authentication required', details: 'Admin token (x-admin-token or Bearer) is missing.' });
  }

  const checkFileDB = () => {
    const admin = adminDB.read() || {};
    if (admin.adminToken && token === admin.adminToken) {
      req.user = { id: admin.adminId, role: 'admin', name: 'Administrator' };
      return next();
    }
    console.warn(`[Auth] Invalid admin token attempted`);
    return res.status(401).json({ error: 'Session expired', message: 'Please log out and log in again' });
  };

  // 1. Check MongoDB if connected
  if (mongoose.connection.readyState === 1 && Admin) {
    Admin.findOne({ adminToken: token })
      .then(adminDoc => {
        if (adminDoc) {
          req.user = { id: adminDoc.adminId, role: 'admin', name: adminDoc.name };
          return next();
        }
        return checkFileDB();
      })
      .catch(err => {
        console.error('Admin DB findOne error:', err);
        return checkFileDB();
      });
  } else {
    return checkFileDB();
  }
}
function requireFaculty(req, res, next) {
  const faculty = facultyDB.read() || [];
  const token = req.headers['x-faculty-token'];
  if (!token) return res.status(401).json({ error: 'faculty token required' });

  // Find faculty with matching token
  const facultyMember = faculty.find(f => f.facultyToken === token);
  if (!facultyMember) return res.status(401).json({ error: 'invalid faculty token' });

  req.facultyData = facultyMember; // Attach faculty data to request
  next();
}

// Helper: derive user from headers for file-based fallback (admin or faculty)
function authFromHeaders(req) {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken) {
      const admin = adminDB.read() || {};
      if (admin.adminToken && admin.adminToken === adminToken) {
        return { id: admin.adminId, role: 'admin', name: 'Administrator' };
      }
    }

    const facultyToken = req.headers['x-faculty-token'];
    if (facultyToken) {
      const faculties = facultyDB.read() || [];
      const f = faculties.find(x => x.facultyToken === facultyToken);
      if (f) return { id: f.facultyId, role: 'faculty', name: f.name };
    }
  } catch (e) {
    console.error('authFromHeaders error', e);
  }
  return null;
}

// admin auth endpoints
// admin auth endpoints
app.post('/api/admin/login', async (req, res) => {
  try {
    const { adminId, password } = req.body || {};
    if (!adminId || !password) return res.status(400).json({ error: 'missing credentials' });

    // MongoDB Check
    if (mongoose.connection.readyState === 1) {
      const admin = await Admin.findOne({ adminId });
      if (admin && admin.password === password) {
        const token = uuidv4();
        admin.adminToken = token;
        admin.tokenIssuedAt = new Date().toISOString();
        await admin.save();

        return res.json({
          ok: true,
          token,
          adminData: { adminId: admin.adminId, name: admin.name }
        });
      }
    }

    // Fallback: File-based (Legacy)
    const adminFile = adminDB.read() || {};
    if (adminFile.adminId === adminId && adminFile.password === password) {
      const token = uuidv4();
      const updatedAdmin = { ...adminFile, adminToken: token, tokenIssuedAt: new Date().toISOString() };
      adminDB.write(updatedAdmin);

      return res.json({
        ok: true,
        token,
        adminData: { adminId: adminFile.adminId }
      });
    }

    return res.status(401).json({ error: 'invalid admin credentials' });
  } catch (err) {
    console.error('Error in admin login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const admin = adminDB.read() || {};
  const updatedAdmin = { ...admin, adminToken: null, tokenIssuedAt: null };
  adminDB.write(updatedAdmin);
  return res.json({ ok: true });
});

// routes: students
// Student routes
app.use('/api/students', studentRoutes);

// Keep the existing /api/students endpoint for admin access
// app.get('/api/students', (req, res) => {
//   res.json(studentsDB.read());
// });

// Bulk upload route removed for now to avoid top-level awaits and simplify debugging.

app.post('/api/students', async (req, res) => {
  const { studentName, sid, email, year, section, branch, password } = req.body;
  if (!sid || !studentName) return res.status(400).json({ error: 'missing required fields' });

  // MongoDB Support
  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await Student.findOne({ sid });
      if (existing) return res.status(409).json({ error: 'sid exists' });
      const newStudent = await Student.create({ studentName, sid, email, year, section, branch, password });
      return res.status(201).json(newStudent);
    } catch (err) {
      console.error('Mongo Student Create Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  const arr = studentsDB.read();
  if (arr.find(s => s.sid === sid)) return res.status(409).json({ error: 'sid exists' });
  const item = { studentName, sid, email, year, section, branch, password };
  arr.push(item);
  studentsDB.write(arr);
  res.status(201).json(item);
});
app.put('/api/students/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // MongoDB Support
    if (mongoose.connection.readyState === 1) {
      // Try finding by _id first, then sid
      let updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true });
      if (!updatedStudent) {
        updatedStudent = await Student.findOneAndUpdate({ sid: id }, updates, { new: true });
      }

      if (updatedStudent) {
        return res.json({ success: true, message: 'Student updated successfully', data: updatedStudent });
      }
      // If not found in Mongo, fall through to file DB check (hybrid mode)
    }

    const students = studentsDB.read();

    // Find student by id or sid
    const studentIndex = students.findIndex(s => s.id === id || s.sid === id);

    if (studentIndex === -1) {
      return res.status(404).json({
        error: 'Student not found',
        message: `No student found with ID/SID: ${id}`
      });
    }

    // Preserve important fields that shouldn't be updated
    const updatedStudent = {
      ...students[studentIndex],
      ...updates,
      // Ensure these fields are not accidentally overwritten
      id: students[studentIndex].id,
      sid: students[studentIndex].sid,
      updatedAt: new Date().toISOString()
    };

    // Update the student in the array
    students[studentIndex] = updatedStudent;

    // Save to database
    studentsDB.write(students);

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update student. Please try again later.'
    });
  }
});
app.delete('/api/students/:sid', requireAdmin, async (req, res) => {
  const sid = req.params.sid;

  // MongoDB Support
  if (mongoose.connection.readyState === 1) {
    try {
      await Student.findOneAndDelete({ sid });
    } catch (err) {
      console.error('Mongo Student Delete Error:', err);
    }
  }

  const arr = studentsDB.read();
  const next = arr.filter(s => s.sid !== sid);
  studentsDB.write(next);

  // Clean up student-faculty relationships
  const relationships = studentFacultyDB.read().filter(r => r.studentId !== sid);
  studentFacultyDB.write(relationships);

  res.json({ ok: true });
});

// Student Self-Service Routes (No Admin Token Required for these specific user actions)
app.put('/api/students/profile/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const updates = req.body;

    // MongoDB Update
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findOneAndUpdate({ sid }, updates, { new: true });
      if (student) return res.json(student);
      // If not found in Mongo but DB is connected, it might only exist in file. Continue to fallback.
    }

    // Fallback: File-based
    const arr = studentsDB.read();
    const idx = arr.findIndex(s => s.sid === sid);
    if (idx === -1) return res.status(404).json({ error: 'student not found' });

    // Update fields
    arr[idx] = { ...arr[idx], ...updates };
    studentsDB.write(arr);
    res.json(arr[idx]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/students/change-password/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const { currentPassword, newPassword } = req.body;

    // MongoDB Update
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findOne({ sid });
      if (student) {
        if (currentPassword && student.password !== currentPassword) {
          return res.status(401).json({ error: 'Incorrect current password' });
        }
        student.password = newPassword;
        await student.save();
        return res.json({ success: true });
      }
    }

    // Fallback: File-based
    const arr = studentsDB.read();
    const idx = arr.findIndex(s => s.sid === sid);
    if (idx === -1) return res.status(404).json({ error: 'student not found' });

    // Verify current password (if not empty check provided)
    if (currentPassword && arr[idx].password !== currentPassword) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    arr[idx].password = newPassword;
    studentsDB.write(arr);
    res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const students = studentsDB.read();
  const exists = students.find(s => s.email === email);
  if (exists) {
    // Mock email sending
    console.log(`[Mock Email] Password reset link sent to ${email}`);
    res.json({ success: true, message: 'Reset link sent to your email.' });
  } else {
    res.status(404).json({ error: 'Email address not found.' });
  }
});

// Student-Faculty Relationship Management
app.post('/api/relationships', requireAdmin, (req, res) => {
  const { studentId, facultyId } = req.body;
  if (!studentId || !facultyId) {
    return res.status(400).json({ error: 'studentId and facultyId are required' });
  }

  const students = studentsDB.read();
  const faculties = facultyDB.read();

  // Verify student and faculty exist
  const student = students.find(s => s.sid === studentId);
  const faculty = faculties.find(f => f.facultyId === facultyId);

  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

  const relationships = studentFacultyDB.read();
  const existing = relationships.find(r =>
    r.studentId === studentId && r.facultyId === facultyId
  );

  if (existing) {
    return res.status(409).json({ error: 'Relationship already exists' });
  }

  const relationship = {
    id: uuidv4(),
    studentId,
    facultyId,
    createdAt: new Date().toISOString(),
    createdBy: 'admin' // Could be adminId if available
  };

  relationships.push(relationship);
  studentFacultyDB.write(relationships);

  res.status(201).json(relationship);
});

app.get('/api/students/:studentId/faculties', (req, res) => {
  const { studentId } = req.params;
  const relationships = studentFacultyDB.read();
  const faculties = facultyDB.read();

  const studentFaculties = relationships
    .filter(r => r.studentId === studentId)
    .map(r => {
      const faculty = faculties.find(f => f.facultyId === r.facultyId);
      return faculty ? { ...faculty, relationshipId: r.id } : null;
    })
    .filter(Boolean);

  res.json(studentFaculties);
});

app.get('/api/faculty/:facultyId/students', (req, res) => {
  const { facultyId } = req.params;
  const relationships = studentFacultyDB.read();
  const students = studentsDB.read();

  const facultyStudents = relationships
    .filter(r => r.facultyId === facultyId)
    .map(r => {
      const student = students.find(s => s.sid === r.studentId);
      return student ? { ...student, relationshipId: r.id } : null;
    })
    .filter(Boolean);

  res.json(facultyStudents);
});

app.delete('/api/relationships/:relationshipId', requireAdmin, (req, res) => {
  const { relationshipId } = req.params;
  const relationships = studentFacultyDB.read();
  const updated = relationships.filter(r => r.id !== relationshipId);

  if (updated.length === relationships.length) {
    return res.status(404).json({ error: 'Relationship not found' });
  }

  studentFacultyDB.write(updated);
  res.json({ ok: true });
});

// faculty routes
app.get('/api/faculty', (req, res) => res.json(facultyDB.read()));
app.post('/api/faculty', requireAdmin, (req, res) => {
  const { name, facultyId, email, password, assignments } = req.body;
  if (!facultyId || !name || !password) return res.status(400).json({ error: 'missing required fields: facultyId, name, password' });

  const arr = facultyDB.read();
  if (arr.find(f => f.facultyId === facultyId)) return res.status(409).json({ error: 'facultyId already exists' });

  // Ensure assignments is an array, default to empty array if not provided
  const assignmentsArray = Array.isArray(assignments) ? assignments : [];

  const item = {
    name,
    facultyId,
    email: email || '',
    password,
    assignments: assignmentsArray,
    createdAt: new Date().toISOString()
  };

  arr.push(item);
  facultyDB.write(arr);
  res.status(201).json(item);
});
app.put('/api/faculty/:fid', requireAdmin, (req, res) => {
  const fid = req.params.fid;
  const arr = facultyDB.read();
  const idx = arr.findIndex(f => f.facultyId === fid);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  arr[idx] = { ...arr[idx], ...req.body };
  facultyDB.write(arr);
  res.json(arr[idx]);
});

app.delete('/api/faculty/:fid', requireAdmin, (req, res) => {
  const fid = req.params.fid;
  const arr = facultyDB.read();
  const faculty = arr.find(f => f.facultyId === fid);
  if (!faculty) return res.status(404).json({ error: 'faculty not found' });

  // Remove faculty from data
  facultyDB.write(arr.filter(f => f.facultyId !== fid));

  // Clean up related data:
  // 1. Remove faculty's materials
  const materials = materialsDB.read();
  materialsDB.write(materials.filter(m => m.uploaderId !== fid));

  // 2. Remove faculty's messages
  const messages = messagesDB.read();
  messagesDB.write(messages.filter(m => m.facultyId !== fid));

  res.json({ ok: true });
});

// Admin Auth Endpoints
app.post('/api/admin/login', (req, res) => {
  const { adminId, password } = req.body || {};
  const admin = adminDB.read() || {};

  if (!adminId || !password) return res.status(400).json({ error: 'Missing credentials' });

  if (admin.adminId === adminId && admin.password === password) {
    const token = uuidv4();
    // Save token
    admin.adminToken = token;
    admin.tokenIssuedAt = new Date().toISOString();
    adminDB.write(admin);

    return res.json({
      ok: true,
      token,
      adminData: { name: 'Administrator', role: 'admin' }
    });
  }

  return res.status(401).json({ error: 'Invalid admin credentials' });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const admin = adminDB.read() || {};
  admin.adminToken = null;
  admin.tokenIssuedAt = null;
  adminDB.write(admin);
  res.json({ ok: true });
});

// faculty auth endpoints
app.post('/api/faculty/login', (req, res) => {
  const { facultyId, password } = req.body || {};
  const faculty = facultyDB.read() || [];
  if (!facultyId || !password) return res.status(400).json({ error: 'missing credentials' });

  const facultyMember = faculty.find(f => f.facultyId === facultyId && f.password === password);
  if (facultyMember) {
    const token = uuidv4();
    // Update faculty with token
    const updatedFaculty = faculty.map(f =>
      f.facultyId === facultyId ? { ...f, facultyToken: token, tokenIssuedAt: new Date().toISOString() } : f
    );
    facultyDB.write(updatedFaculty);

    return res.json({
      ok: true,
      token,
      facultyData: { name: facultyMember.name, facultyId: facultyMember.facultyId, assignments: facultyMember.assignments }
    });
  }
  return res.status(401).json({ error: 'invalid credentials' });
});

app.post('/api/faculty/logout', requireFaculty, (req, res) => {
  const faculty = facultyDB.read() || [];
  const updatedFaculty = faculty.map(f =>
    f.facultyId === req.facultyData.facultyId ? { ...f, facultyToken: null, tokenIssuedAt: null } : f
  );
  facultyDB.write(updatedFaculty);
  return res.json({ ok: true });
});

// File-based material routes (commented out to use MongoDB)
/*
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Build safe folder path based on provided metadata: subject/module/unit/topic
      const subject = (req.body.subject || 'misc').toString().replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_');
      const module = (req.body.module || '').toString().replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_');
      const unit = (req.body.unit || '').toString().replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_');
      const topic = (req.body.topic || '').toString().replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_');

      // Compose relative path under uploadsDir
      let relPath = subject || 'misc';
      if (module) relPath = path.join(relPath, module);
      if (unit) relPath = path.join(relPath, unit);
      if (topic) relPath = path.join(relPath, topic);

      const dest = path.join(uploadsDir, relPath);
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (e) {
      cb(e, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });
*/

/*
app.get('/api/materials', (req, res) => {
  const { year, section, subject, type, course, branch } = req.query;
  const all = materialsDB.read();
  let filtered = all;
  if (year && year !== 'All') filtered = filtered.filter(m => String(m.year) === String(year));
  if (section && section !== 'All') filtered = filtered.filter(m => String(m.section) === String(section));
  if (branch && branch !== 'All') filtered = filtered.filter(m => m.branch === branch || !m.branch);
  if (subject) filtered = filtered.filter(m => String(m.subject) === String(subject));
  if (type) filtered = filtered.filter(m => String(m.type) === String(type));
  if (course) filtered = filtered.filter(m => String(m.course) === String(course));
  res.json(filtered);
});

app.post('/api/materials', upload.single('file'), (req, res) => {
  // ... existing code ...
});
*/

/*
app.get('/api/materials', (req, res) => {
  const { year, section, subject, type, course, branch } = req.query;
  const all = materialsDB.read();
  let filtered = all;
  if (year && year !== 'All') filtered = filtered.filter(m => String(m.year) === String(year));
  if (section && section !== 'All') filtered = filtered.filter(m => String(m.section) === String(section));
  if (branch && branch !== 'All') filtered = filtered.filter(m => m.branch === branch || !m.branch);
  if (subject) filtered = filtered.filter(m => String(m.subject) === String(subject));
  if (type) filtered = filtered.filter(m => String(m.type) === String(type));
  if (course) filtered = filtered.filter(m => String(m.course) === String(course));
  res.json(filtered);
});

app.post('/api/materials', upload.single('file'), (req, res) => {
  const { year, section, subject, type, title, link, dueDate, message, module, unit, course, branch } = req.body;
  if (!subject || !type) return res.status(400).json({ error: 'missing required fields: subject, type' });
  if (subject !== 'Advance Courses' && (!year || !section)) return res.status(400).json({ error: 'missing year or section for non-advance courses' });

  // Check if request is from admin or faculty
  const admin = adminDB.read() || {};
  const faculty = facultyDB.read() || [];
  const adminToken = req.headers['x-admin-token'];
  const facultyToken = req.headers['x-faculty-token'];

  let authorized = false;
  let uploaderType = null;
  let uploaderData = null;

  if (adminToken && admin.adminToken === adminToken) {
    authorized = true;
    uploaderType = 'admin';
  } else if (facultyToken) {
    const facultyMember = faculty.find(f => f.facultyToken === facultyToken);
    if (facultyMember) {
      // Check if faculty is assigned to this subject
      const isAssigned = facultyMember.assignments?.some(assignment =>
        assignment.subject === subject &&
        String(assignment.year) === String(year) &&
        (assignment.sections || []).includes(section)
      );

      if (isAssigned) {
        authorized = true;
        uploaderType = 'faculty';
        uploaderData = facultyMember;
      } else {
        // Log assignment check for debugging
        console.log('Faculty authorization check:', {
          facultyId: facultyMember.facultyId,
          requested: { subject, year, section },
          assignments: facultyMember.assignments
        });
        return res.status(403).json({
          error: 'Faculty not authorized for this subject/section combination',
          details: {
            facultyId: facultyMember.facultyId,
            requestedSubject: subject,
            requestedYear: year,
            requestedSection: section,
            facultyAssignments: facultyMember.assignments
          }
        });
      }
    }
  }

  if (!authorized) {
    return res.status(403).json({ error: 'unauthorized to upload for this subject/section' });
  }

  const all = materialsDB.read();
  const id = uuidv4();
  // Determine url path relative to /uploads
  let fileUrl = null;
  let filename = null;
  if (req.file) {
    // Use the file destination (relative to uploadsDir) to build the public URL
    filename = req.file.filename;
    const destRel = path.relative(uploadsDir, req.file.destination || uploadsDir).replace(/\\/g, '/');
    fileUrl = `/uploads/${destRel}/${req.file.filename}`.replace(/\/+/g, '/');
  } else if (link) {
    fileUrl = link;
  }

  const item = {
    id,
    title: title || (req.file ? req.file.originalname : ''),
    year: year || 'All',
    section: section || 'All',
    subject,
    type,
    course: course || null,
    branch: branch || null,
    module: module ? String(module) : null,
    unit: unit ? String(unit) : null,
    topic: req.body.topic || null,
    uploadedAt: new Date().toISOString(),
    filename: filename,
    url: fileUrl,
    originalName: req.file ? req.file.originalname : null,
    uploadedBy: uploaderType,
    uploaderId: uploaderData ? uploaderData.facultyId : null,
    uploaderName: uploaderData ? uploaderData.name : 'Admin'
  };

  // Add type-specific fields
  if (type === 'videos') {
    if (message) item.duration = message; // Store duration in message field
  } else if (type === 'modelPapers' || type === 'previousQuestions') {
    if (dueDate) item.examYear = dueDate; // Store exam year in dueDate field
    if (message) item.examType = message; // Store exam type in message field
  }

  all.push(item);
  materialsDB.write(all);
  res.status(201).json(item);
});

// faculty upload history (for faculty themselves)
app.get('/api/faculty/uploads', requireFaculty, (req, res) => {
  const all = materialsDB.read();
  const mine = all.filter(m => m.uploaderId === req.facultyData.facultyId);
  res.json(mine);
});

// admin view of a faculty's uploads
app.get('/api/faculty/:fid/uploads', requireAdmin, (req, res) => {
  const fid = req.params.fid;
  const all = materialsDB.read();
  const userUploads = all.filter(m => m.uploaderId === fid);
  res.json(userUploads);
});

// DELETE material (file-mode fallback). Admins can delete any; faculty can delete own uploads.
app.delete('/api/materials/:id', (req, res) => {
  try {
    console.log('[DELETE] headers:', { admin: req.headers['x-admin-token'] ? 'present' : 'missing', faculty: req.headers['x-faculty-token'] ? 'present' : 'missing' });
    console.log('[DELETE] params:', req.params);
    // If Mongo is connected and controller exists, defer to it
    if (mongoose.connection.readyState === 1 && typeof materialController !== 'undefined' && materialController.deleteMaterial) {
      return materialController.deleteMaterial(req, res);
    }

    const id = req.params.id;
    const all = materialsDB.read();
    const idx = all.findIndex(m => m.id === id || m._id === id);
    if (idx === -1) return res.status(404).json({ error: 'Material not found' });

    const material = all[idx];

    // Resolve user from request (support header tokens in file-mode)
    const user = req.user || authFromHeaders(req);
    if (!(user && (user.role === 'admin' || String(material.uploaderId) === String(user.id)))) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Remove file if present under uploads
    try {
      if (material && material.fileUrl && String(material.fileUrl).startsWith('/uploads')) {
        const rel = String(material.fileUrl).replace(/^\/uploads\//, '').replace(/\//g, path.sep);
        const p = path.join(uploadsDir, rel);
        if (fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch (e) { console.warn('Failed to unlink file', p, e); }
        }
      } else if (material && material.filename) {
        const p2 = path.join(uploadsDir, material.filename);
        if (fs.existsSync(p2)) {
          try { fs.unlinkSync(p2); } catch (e) { console.warn('Failed to unlink file', p2, e); }
        }
      }
    } catch (e) { console.warn('Error while deleting material file:', e); }

    const next = all.filter((_, i) => i !== idx);
    materialsDB.write(next);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete material error:', err);
    return res.status(500).json({ error: 'Failed to delete material' });
  }
});
*/

// messages
app.get('/api/messages', (req, res) => res.json(messagesDB.read()));
app.post('/api/messages', requireAdmin, (req, res) => {
  const { message, target } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  const all = messagesDB.read();
  const item = { id: uuidv4(), message, target: target || 'all', createdAt: new Date().toISOString() };
  all.unshift(item);
  messagesDB.write(all);
  res.status(201).json(item);
});
app.delete('/api/messages/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const all = messagesDB.read();
  messagesDB.write(all.filter(m => m.id !== id));
  res.json({ ok: true });
});

app.post('/api/announcements', requireAdmin, (req, res) => {
  const { message, target, year, section, subject } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  const all = messagesDB.read();
  const item = {
    id: uuidv4(),
    message,
    target: target || 'all',
    type: 'announcements',
    year: year || null,
    section: section || null,
    subject: subject || null,
    createdAt: new Date().toISOString()
  };
  all.unshift(item);
  messagesDB.write(all);
  res.status(201).json(item);
});

// courses/subjects routes
// courses/subjects routes (MongoDB)
app.get('/test', (req, res) => res.json({ ok: true }));
app.get('/api/courses', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const courses = await Course.find().sort({ createdAt: -1 });
      // Map to frontend expected format
      const mapped = courses.map(c => ({
        id: c._id,
        name: c.courseName,
        code: c.courseCode,
        year: c.year,
        semester: c.semester,
        branch: c.department,
        description: c.description
      }));
      return res.json(mapped);
    } else {
      res.json(coursesDB.read());
    }
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Content Source Helper
const contentSourceDir = path.join(uploadsDir, 'content_source');

// Recursive function to scan content source
const scanContentSource = (dir) => {
  if (!fs.existsSync(dir)) return [];

  const subjects = fs.readdirSync(dir).filter(f => {
    try { return fs.statSync(path.join(dir, f)).isDirectory(); } catch (e) { return false; }
  });

  return subjects.map(subject => {
    const subjectPath = path.join(dir, subject);
    let types = [];
    try {
      types = fs.readdirSync(subjectPath).filter(f => {
        try { return fs.statSync(path.join(subjectPath, f)).isDirectory(); } catch (e) { return false; }
      });
    } catch (e) { return { subject, types: [] }; }

    const mappedTypes = types.map(type => {
      const typePath = path.join(subjectPath, type);
      let chapters = [];
      try {
        chapters = fs.readdirSync(typePath).filter(f => {
          try { return fs.statSync(path.join(typePath, f)).isDirectory(); } catch (e) { return false; }
        });
      } catch (e) { return { type, chapters: [] }; }

      const mappedChapters = chapters.map(chapter => {
        const chapterPath = path.join(typePath, chapter);
        let files = [];
        try {
          files = fs.readdirSync(chapterPath).filter(f => {
            try { return !fs.statSync(path.join(chapterPath, f)).isDirectory(); } catch (e) { return false; }
          });
        } catch (e) { return { chapter, files: [] }; }

        // Sort files naturally (Chapter 1, Chapter 2, etc.) if possible, or just alpha
        return {
          chapter: chapter,
          files: files.map(f => {
            const fPath = path.join(chapterPath, f);
            const size = fs.existsSync(fPath) ? fs.statSync(fPath).size : 0;
            // Construct URL relative to server root
            // We need to encodeURI components to handle spaces/special chars
            const url = `/uploads/content_source/${encodeURIComponent(subject)}/${encodeURIComponent(type)}/${encodeURIComponent(chapter)}/${encodeURIComponent(f)}`;
            return { name: f, size, url };
          })
        };
      });

      // Also check for files directly in the Type folder (not in chapters) - though structure says chapters
      // But user might put files directly.

      return {
        type: type,
        chapters: mappedChapters.sort((a, b) => a.chapter.localeCompare(b.chapter, undefined, { numeric: true }))
      };
    });

    return {
      subject: subject,
      types: mappedTypes
    };
  });
};

app.get('/api/content-source', (req, res) => {
  try {
    const data = scanContentSource(contentSourceDir);
    res.json(data);
  } catch (err) {
    console.error('Error scanning content source:', err);
    res.status(500).json({ error: 'Failed to scan content source' });
  }
});

app.post('/api/courses', requireAdmin, async (req, res) => {
  try {
    const { name, code, year, semester, branch, description, credits } = req.body;

    // Validate required fields
    if (!name || !code || !year) {
      console.log('Failed to create course: Missing fields', req.body);
      return res.status(400).json({ error: 'Missing required fields: name, code, and year are required' });
    }

    if (mongoose.connection.readyState === 1) {
      // Check for existing course
      const existing = await Course.findOne({ courseCode: code });
      if (existing) {
        return res.status(409).json({ error: 'Course code already exists' });
      }

      const newCourse = new Course({
        courseName: name,
        courseCode: code,
        year: String(year),
        semester: String(semester || '1'),
        department: branch || 'Common',
        credits: credits || 3, // Default to 3 credits
        description: description || ''
      });

      await newCourse.save();
      console.log('✅ Course created successfully in MongoDB:', code);

      return res.status(201).json({
        id: newCourse._id,
        name: newCourse.courseName,
        code: newCourse.courseCode,
        year: newCourse.year,
        semester: newCourse.semester,
        branch: newCourse.department,
        description: newCourse.description,
        credits: newCourse.credits
      });
    } else {
      // File-based fallback
      const arr = coursesDB.read();
      if (arr.find(c => c.code === code)) {
        return res.status(409).json({ error: 'Course code already exists' });
      }
      const item = {
        id: uuidv4(),
        name,
        code,
        year,
        semester: semester || '1',
        branch: branch || 'Common',
        description: description || '',
        credits: credits || 3,
        createdAt: new Date().toISOString()
      };
      arr.push(item);
      coursesDB.write(arr);
      console.log('✅ Course created successfully in File DB:', code);
      res.status(201).json(item);
    }
  } catch (err) {
    console.error('❌ Error creating course:', err);
    if (err.name === 'ValidationError') {
      const validationMsgs = Object.keys(err.errors).map(k => err.errors[k].message);
      console.error('Mongoose Validation Details:', validationMsgs);
      return res.status(400).json({
        error: `Validation failed: ${validationMsgs.join(', ')}`,
        details: validationMsgs
      });
    }
    res.status(500).json({
      error: `Failed to create course: ${err.message || 'Unknown server error'}`,
      details: err.message || 'Unknown server error'
    });
  }
});

app.put('/api/courses/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, year, semester, branch, description } = req.body;

    if (mongoose.connection.readyState === 1) {
      const updateData = {};
      if (name) updateData.courseName = name;
      if (code) updateData.courseCode = code;
      if (year) updateData.year = String(year);
      if (semester) updateData.semester = String(semester);
      if (branch) updateData.department = branch;
      if (description) updateData.description = description;

      const updated = await Course.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ error: 'Course not found' });

      return res.json({
        id: updated._id,
        name: updated.courseName,
        code: updated.courseCode,
        year: updated.year,
        semester: updated.semester,
        branch: updated.department,
        description: updated.description
      });
    } else {
      const arr = coursesDB.read();
      const idx = arr.findIndex(c => c.id === id);
      if (idx === -1) return res.status(404).json({ error: 'course not found' });
      arr[idx] = { ...arr[idx], ...req.body };
      coursesDB.write(arr);
      res.json(arr[idx]);
    }
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

app.delete('/api/courses/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await Course.findByIdAndDelete(id);
      return res.json({ ok: true });
    } else {
      const arr = coursesDB.read();
      coursesDB.write(arr.filter(c => c.id !== id));
      res.json({ ok: true });
    }
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// subjects routes (alias for courses)
app.get('/api/subjects', (req, res) => {
  try {
    res.json(coursesDB.read());
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});
app.post('/api/subjects', requireAdmin, (req, res) => {
  const { name, code, year, semester, branch, sections, description } = req.body;
  if (!name || !code || !year) return res.status(400).json({ error: 'missing required fields' });
  const arr = coursesDB.read();
  if (arr.find(s => s.code === code)) return res.status(409).json({ error: 'subject code exists' });
  const item = { id: uuidv4(), name, code, year, semester, branch, sections: sections || [], description, createdAt: new Date().toISOString() };
  arr.push(item);
  coursesDB.write(arr);
  res.status(201).json(item);
});
app.put('/api/subjects/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const arr = coursesDB.read();
  const idx = arr.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'subject not found' });
  arr[idx] = { ...arr[idx], ...req.body };
  coursesDB.write(arr);
  res.json(arr[idx]);
});
app.delete('/api/subjects/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const arr = coursesDB.read();
  coursesDB.write(arr.filter(s => s.id !== id));
  res.json({ ok: true });
});

// root route
app.get('/', (req, res) => {
  res.json({
    message: 'Friendly College Management System API',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      faculty: '/api/faculty',
      materials: '/api/materials',
      messages: '/api/messages',
      announcements: '/api/announcements',
      courses: '/api/courses',
      subjects: '/api/subjects',
      admin: '/api/admin',
      chat: '/api/chat'
    },
    documentation: 'This is the API server. Frontend is served separately on port 3000.'
  });
});

// health check route
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// Initialize and start server
const initializeApp = async () => {
  // Connect to MongoDB
  await connectDB();

  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`🌍 Access the API at http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') console.error(`Port ${PORT} already in use`);
    // Don't exit the process here to allow debugging and recovery
    // process.exit(1);
  });
};

if (require.main === module) {
  initializeApp().catch((err) => {
    console.error('Failed to initialize app:', err);
    // Keep process alive for debugging
  });
}

module.exports = app; // For testing


// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  // Do not exit to allow inspection; in production consider restarting the process manager
  // process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  console.error(err.stack);
  // Close server & exit process
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
