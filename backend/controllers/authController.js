const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const dbFile = require('../dbHelper');
const jwt = require('jsonwebtoken'); // Optional validation
// Models
const Admin = require('../models/Admin');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

// Helpers
const generateToken = () => uuidv4();

const adminDB = dbFile('admin', { adminId: 'ReddyFBN@1228', password: 'ReddyFBN', name: 'Administrator' });
const facultyDB = dbFile('faculty', []);
const studentsDB = dbFile('students', []);

exports.adminLogin = async (req, res) => {
    const { adminId, password } = req.body;
    try {
        // 1. Check MongoDB
        if (mongoose.connection.readyState === 1 && Admin) {
            const admin = await Admin.findOne({ adminId });
            if (admin && (admin.password === password)) { // In real app, use bcrypt
                const token = generateToken();
                admin.adminToken = token;
                await admin.save();
                return res.json({ token, role: 'admin', adminId: admin.adminId });
            }
        }

        // 2. Check File DB
        const adminData = adminDB.read();
        // File DB might be an array or object. Based on index.js, it seems to be an object for Admin? 
        // index.js line 48: const adminDB = dbFile('admin', { adminId: ... })
        if (adminData.adminId === adminId && adminData.password === password) {
            const token = generateToken();
            adminData.adminToken = token;
            adminDB.write(adminData);
            return res.json({ token, role: 'admin', adminId: adminData.adminId });
        }

        return res.status(401).json({ error: 'Invalid admin credentials' });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.facultyLogin = async (req, res) => {
    try {
        const { facultyId, password } = req.body;

        // Input Validation
        if (!facultyId || !password) {
            return res.status(400).json({ error: 'Faculty ID/Email and Password are required' });
        }

        // 1. MongoDB Check
        if (mongoose.connection.readyState === 1 && Faculty) {
            try {
                const faculty = await Faculty.findOne({ $or: [{ facultyId: facultyId }, { email: facultyId }] });
                if (faculty && faculty.password === password) {
                    const token = generateToken();
                    faculty.facultyToken = token;
                    await faculty.save();
                    return res.json({
                        token,
                        role: 'faculty',
                        facultyData: faculty
                    });
                }
            } catch (mongoErr) {
                console.warn('MongoDB Faculty Login Failed:', mongoErr.message);
                // Continue to File DB fallback
            }
        }

        // 2. File DB Check
        let facultyList = [];
        try {
            const raw = facultyDB.read();
            facultyList = Array.isArray(raw) ? raw : [];
        } catch (e) {
            console.error('File DB Read Error:', e);
            facultyList = [];
        }

        const faculty = facultyList.find(f => (f.facultyId === facultyId || f.email === facultyId) && f.password === password);

        if (faculty) {
            const token = generateToken();
            faculty.facultyToken = token;

            // Update token in file storage
            const idx = facultyList.findIndex(f => f.facultyId === faculty.facultyId);
            if (idx !== -1) {
                facultyList[idx] = faculty;
                facultyDB.write(facultyList);
            }

            return res.json({
                token,
                role: 'faculty',
                facultyData: faculty
            });
        }

        return res.status(401).json({ error: 'Invalid faculty credentials' });

    } catch (err) {
        console.error('Faculty login fatal error:', err);
        return res.status(500).json({ error: 'Internal Server Error during login' });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { adminId, password } = req.body;

        // Input Validation
        if (!adminId || !password) {
            return res.status(400).json({ error: 'Admin ID and Password are required' });
        }

        // 1. Check MongoDB
        if (mongoose.connection.readyState === 1 && Admin) {
            try {
                const admin = await Admin.findOne({ adminId });
                if (admin && (admin.password === password)) {
                    const token = generateToken();
                    admin.adminToken = token;
                    await admin.save();
                    return res.json({ token, role: 'admin', adminId: admin.adminId });
                }
            } catch (mongoErr) {
                console.warn('MongoDB Admin Login Failed:', mongoErr.message);
            }
        }

        // 2. Check File DB
        let adminData = null;
        try {
            adminData = adminDB.read();
        } catch (e) {
            console.error('File DB Read Error (Admin):', e);
            adminData = {}; // Default fallback
        }

        if (adminData && adminData.adminId === adminId && adminData.password === password) {
            const token = generateToken();
            adminData.adminToken = token;
            adminDB.write(adminData);
            return res.json({ token, role: 'admin', adminId: adminData.adminId });
        }

        return res.status(401).json({ error: 'Invalid admin credentials' });
    } catch (err) {
        console.error('Admin login fatal error:', err);
        res.status(500).json({ error: 'Internal Server Error during admin login' });
    }
};

exports.studentLogin = async (req, res) => {
    try {
        const { sid, email, password } = req.body;
        const loginId = sid || email;

        // Input Validation
        if (!loginId || !password) {
            return res.status(400).json({ error: 'Student ID/Email and Password are required' });
        }

        // 1. MongoDB
        if (mongoose.connection.readyState === 1 && Student) {
            try {
                const student = await Student.findOne({
                    $or: [{ sid: loginId }, { email: loginId }]
                });

                if (student && student.password === password) {
                    const token = generateToken();
                    student.studentToken = token;
                    await student.save();
                    return res.json({
                        token,
                        role: 'student',
                        studentData: student
                    });
                }
            } catch (mongoErr) {
                console.warn('MongoDB Student Login Failed:', mongoErr.message);
            }
        }

        // 2. File DB
        let students = [];
        try {
            const raw = studentsDB.read();
            students = Array.isArray(raw) ? raw : [];
        } catch (e) {
            console.error('File DB Read Error (Student):', e);
            students = [];
        }

        const student = students.find(s => (s.sid === loginId || s.email === loginId) && s.password === password);

        if (student) {
            const token = generateToken();
            student.studentToken = token;

            // Update token in file storage
            const idx = students.findIndex(s => s.sid === student.sid);
            if (idx !== -1) {
                students[idx] = student;
                studentsDB.write(students);
            }

            return res.json({
                token,
                role: 'student',
                studentData: student
            });
        }

        return res.status(401).json({ error: 'Invalid student credentials' });

    } catch (err) {
        console.error('Student login fatal error:', err);
        res.status(500).json({ error: 'Internal Server Error during student login' });
    }
};

exports.studentRegister = async (req, res) => {
    try {
        const data = req.body;
        // Validation
        if (!data.sid || !data.password || !data.studentName) {
            return res.status(400).json({ error: 'Missing required fields (IDs, Name, Password)' });
        }

        const token = generateToken();
        const newStudent = {
            ...data,
            id: data.sid,
            studentToken: token,
            role: 'student',
            createdAt: new Date()
        };

        let mongoSuccess = false;

        // 1. MongoDB
        if (mongoose.connection.readyState === 1 && Student) {
            try {
                const exists = await Student.findOne({ $or: [{ sid: data.sid }, { email: data.email }] });
                if (exists) return res.status(400).json({ error: 'Student already exists (MongoDB)' });

                await Student.create(newStudent);
                mongoSuccess = true;
            } catch (mongoErr) {
                console.warn('MongoDB Registration Error:', mongoErr.message);
                // Continue to File DB fallback, but be careful of sync issues
            }
        }

        // 2. File DB (Always save to file as backup/sync)
        let students = [];
        try {
            const raw = studentsDB.read();
            students = Array.isArray(raw) ? raw : [];
        } catch (e) {
            console.error('File DB Read Error (Register):', e);
            students = [];
        }

        if (students.find(s => s.sid === data.sid)) {
            // If mongo didn't catch it but file did, and we weren't just successful with Mongo
            if (!mongoSuccess) {
                return res.status(400).json({ error: 'Student already exists (Local)' });
            }
        } else {
            students.push(newStudent);
            studentsDB.write(students);
        }

        return res.json({
            message: 'Registration successful',
            token,
            studentData: newStudent
        });

    } catch (err) {
        console.error('Registration fatal error:', err);
        res.status(500).json({ error: 'Registration failed due to server error' });
    }
};

exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};
