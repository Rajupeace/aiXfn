const express = require('express');
const router = express.Router();
const dbFile = require('../dbHelper');
const mongoose = require('mongoose');
const Material = require('../models/Material');
const Course = require('../models/Course');

// Get all students
router.get('/', (req, res) => {
  try {
    const students = dbFile('students').read();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get courses for a specific student
router.get('/:studentId/courses', (req, res) => {
  try {
    const { studentId } = req.params;
    const students = dbFile('students').read();
    const student = students.find(s => s.sid === studentId || s.id === studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const courses = dbFile('courses').read() || [];

    // Filter courses based on student's year, branch, and section
    const studentCourses = courses.filter(course => {
      return course.year === student.year &&
        course.branch === student.branch &&
        (!course.sections ||
          course.sections.length === 0 ||
          (Array.isArray(course.sections) && course.sections.includes(student.section)) ||
          course.sections === student.section);
    });

    res.json(studentCourses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course details with materials for a student
router.get('/:studentId/courses/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Verify student exists
    const students = dbFile('students').read();
    const student = students.find(s => s.sid === studentId || s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get course
    let course;
    if (mongoose.connection.readyState === 1) {
      course = await Course.findOne({
        $or: [{ _id: courseId }, { courseCode: courseId }],
        year: student.year,
        branch: student.branch
      });
    } else {
      const courses = dbFile('courses').read() || [];
      course = courses.find(c =>
        (c.id === courseId || c.courseCode === courseId) &&
        c.year === student.year &&
        c.branch === student.branch
      );
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found or access denied' });
    }

    // Get course materials
    let courseMaterials = [];
    if (mongoose.connection.readyState === 1) {
      // Read from MongoDB
      const materials = await Material.find({
        $or: [{ course: courseId }, { courseId: courseId }, { courseCode: courseId }]
      }).populate('uploadedBy', 'name email');

      courseMaterials = materials.filter(m => {
        const matchesYear = !m.year || m.year == student.year;
        const matchesSection = !m.section ||
          m.section === student.section ||
          (Array.isArray(m.section) && m.section.includes(student.section));
        return matchesYear && matchesSection;
      }).map(m => ({
        id: m._id,
        title: m.title,
        description: m.description,
        url: m.fileUrl,
        type: m.type,
        subject: m.subject,
        year: m.year,
        section: m.section,
        module: m.module,
        unit: m.unit,
        topic: m.topic,
        uploadedAt: m.createdAt,
        uploaderName: m.uploadedBy?.name || 'Unknown'
      }));
    } else {
      // Read from file-based
      const materials = dbFile('materials').read() || [];
      courseMaterials = materials.filter(m => {
        const matchesCourse = m.courseId === courseId || m.courseCode === courseId;
        const matchesYear = !m.year || m.year === student.year;
        const matchesBranch = !m.branch || m.branch === student.branch;
        const matchesSection = !m.section ||
          m.section === student.section ||
          (Array.isArray(m.section) && m.section.includes(student.section));

        return matchesCourse && matchesYear && matchesBranch && matchesSection;
      });
    }

    res.json({
      ...course,
      materials: courseMaterials
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});


// Update student interaction stats & progress
router.post('/:sid/track', async (req, res) => {
  try {
    const { sid } = req.params;
    const { type, level, increment } = req.body; // type: 'ai' | 'advanced' | 'progress'; level: 'basic'|'intermediate'|etc

    if (mongoose.connection.readyState === 1) {
      const Student = require('../models/Student');

      let updateOp = {};

      if (type === 'ai') {
        updateOp = { $inc: { 'interactionStats.aiUsageCount': 1 } };
      } else if (type === 'advanced' && !level) {
        updateOp = { $inc: { 'interactionStats.advancedCourseOpenCount': 1 } };
      } else if (type === 'progress' && level) {
        // Handle Progress Update
        // 1. Fetch current to check for unlock
        const student = await Student.findOne({ sid });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const key = `advancedProgress.${level}.progress`;
        const currentProg = student.advancedProgress?.[level]?.progress || 0;
        const newProg = Math.min(100, currentProg + (increment || 5)); // Cap at 100

        updateOp = { $set: { [key]: newProg } };

        // Unlock next level logic
        if (newProg >= 80) { // Unlock next level at 80%
          if (level === 'basic') updateOp.$set['advancedProgress.intermediate.unlocked'] = true;
          if (level === 'intermediate') updateOp.$set['advancedProgress.advanced.unlocked'] = true;
        }
      }

      if (Object.keys(updateOp).length > 0) {
        const updatedStudent = await Student.findOneAndUpdate(
          { sid },
          updateOp,
          { new: true }
        );
        return res.json({
          interactionStats: updatedStudent.interactionStats,
          advancedProgress: updatedStudent.advancedProgress
        });
      }

      return res.json({ message: 'No changes' });
    }

    res.status(503).json({ error: 'Database not available' });

  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

// Submit Test Result
router.post('/:sid/test-submit', async (req, res) => {
  try {
    const { sid } = req.params;
    const { subject, level, score, total } = req.body;

    if (mongoose.connection.readyState === 1) {
      const Student = require('../models/Student');
      const percentage = Math.round((score / total) * 100);
      const status = percentage >= 60 ? 'Pass' : 'Fail';

      const result = {
        testId: `test-${Date.now()}`,
        subject,
        level,
        score,
        total,
        percentage,
        status,
        date: new Date()
      };

      const student = await Student.findOneAndUpdate(
        { sid },
        { $push: { testResults: result } },
        { new: true }
      );

      if (!student) return res.status(404).json({ error: 'Student not found' });
      return res.json({ success: true, result, testResults: student.testResults });
    }
    res.status(503).json({ error: 'Database not available' });
  } catch (e) {
    console.error("Test submit error", e);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// Get student specific extended data (Attendance, Stats, Tests)
router.get('/:sid/data', async (req, res) => {
  try {
    const { sid } = req.params;

    // Mock Data Generator for missing fields
    const getMockSubjectAttendance = () => [
      { subjectName: 'Data Structures', subjectCode: 'CS102', attended: 20, total: 24, percentage: 83 },
      { subjectName: 'Operating Systems', subjectCode: 'CS104', attended: 18, total: 24, percentage: 75 },
      { subjectName: 'Database Management', subjectCode: 'CS105', attended: 22, total: 24, percentage: 91 },
      { subjectName: 'Algorithms', subjectCode: 'CS106', attended: 24, total: 24, percentage: 100 },
      { subjectName: 'Computer Networks', subjectCode: 'CS107', attended: 15, total: 24, percentage: 62 }
    ];

    if (mongoose.connection.readyState === 1) {
      const Student = require('../models/Student');
      let student = await Student.findOne({ sid }, 'attendance interactionStats advancedProgress testResults');

      if (!student) {
        // Return full mock
        return res.json({
          attendance: { overall: 85, semester: 90, subjectWise: getMockSubjectAttendance() },
          interactionStats: { aiUsageCount: 0, advancedCourseOpenCount: 0 },
          advancedProgress: {
            basic: { progress: 30, unlocked: true },
            intermediate: { progress: 0, unlocked: false },
            advanced: { progress: 0, unlocked: false }
          },
          testResults: []
        });
      }

      // Ensure structure exists if partial
      const resp = student.toObject();
      if (!resp.attendance) resp.attendance = {};
      if (!resp.attendance.subjectWise || resp.attendance.subjectWise.length === 0) {
        resp.attendance.subjectWise = getMockSubjectAttendance();
      }
      if (!resp.advancedProgress) {
        resp.advancedProgress = {
          basic: { progress: 0, unlocked: true },
          intermediate: { progress: 0, unlocked: false },
          advanced: { progress: 0, unlocked: false }
        };
      }

      res.json({
        attendance: resp.attendance,
        interactionStats: resp.interactionStats || { aiUsageCount: 0, advancedCourseOpenCount: 0 },
        advancedProgress: resp.advancedProgress,
        testResults: resp.testResults || []
      });
    } else {
      // Fallback mock
      res.json({
        attendance: { overall: 85, semester: 90, subjectWise: getMockSubjectAttendance() },
        interactionStats: { aiUsageCount: 0, advancedCourseOpenCount: 0 },
        advancedProgress: {
          basic: { progress: 30, unlocked: true },
          intermediate: { progress: 0, unlocked: false },
          advanced: { progress: 0, unlocked: false }
        },
        testResults: []
      });
    }
  } catch (error) {
    console.error('Fetch data error:', error);
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
});

module.exports = router;
