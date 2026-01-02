const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Question = require('../models/Question');
const { protect, admin, faculty } = require('../middleware/authMiddleware'); // Assuming these exports exist

// --- Faculty Routes ---

// Create a new Exam
router.post('/create', async (req, res) => { // protect logic later if needed
    try {
        const { title, subject, facultyId, year, branch, section, duration, totalMarks, questions, unit, topics } = req.body;

        // If questions are provided as objects (new questions), save them first
        let questionIds = [];
        if (questions && Array.isArray(questions) && questions.length > 0) {
            for (const q of questions) {
                if (typeof q === 'object' && !q._id) {
                    // It's a new question object
                    const newQ = new Question({
                        ...q,
                        subject, // inherited from exam
                        year,
                        branch,
                        createdBy: 'faculty' // or facultyId
                    });
                    const savedQ = await newQ.save();
                    questionIds.push(savedQ._id);
                } else if (q._id) {
                    questionIds.push(q._id);
                } else {
                    questionIds.push(q);
                }
            }
        }

        // Create the exam
        const newExam = new Exam({
            title,
            subject,
            facultyId,
            year,
            branch,
            section,
            duration,
            totalMarks,
            questions: questionIds,
            unit,
            topics,
            status: 'published', // Auto publish for now
            generatedLink: `/exam/${Date.now().toString(36)}` // Simple link stub
        });
        const savedExam = await newExam.save();
        res.status(201).json(savedExam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get exams created by a Faculty
router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const exams = await Exam.find({ facultyId: req.params.facultyId }).sort({ createdAt: -1 });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get results for a specific exam (Faculty View)
router.get('/results/exam/:examId', async (req, res) => {
    try {
        const results = await ExamResult.find({ examId: req.params.examId });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Student Routes ---

// Get available exams for a student
router.get('/student', async (req, res) => {
    try {
        const { year, branch, section } = req.query;
        // Find exams that match Year AND Branch AND (Section matches OR Section is 'All')
        const query = {
            status: 'published',
            year: year,
            branch: branch,
            $or: [{ section: section }, { section: 'All' }]
        };

        const exams = await Exam.find(query).sort({ createdAt: -1 });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Exam Details (Questions hidden or shown based on start logic?)
router.get('/:examId', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.examId).populate('questions');
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit Exam Result
router.post('/submit', async (req, res) => {
    try {
        const { examId, studentId, studentName, year, branch, section, answers, score, totalMarks } = req.body;

        // Check for existing attempt
        const existing = await ExamResult.findOne({ examId, studentId });
        if (existing) {
            return res.status(400).json({ message: 'You have already attempted this exam.' });
        }

        const result = new ExamResult({
            examId,
            studentId,
            studentName,
            year,
            branch,
            section,
            answers,
            score,
            totalMarks,
            isPassed: (score / totalMarks) >= 0.40 // 40% passing criteria example
        });

        const savedResult = await result.save();
        res.status(201).json(savedResult);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Admin Routes ---

// Get All Results / Stats Aggregated
router.get('/admin/stats', async (req, res) => {
    try {
        const { year, branch, section, subject } = req.query;

        let query = {};
        if (year) query.year = year;
        if (branch && branch !== 'All') query.branch = branch;
        if (section && section !== 'All') query.section = section;

        // If filtering by subject, we first need to find Exams that match that subject
        if (subject) {
            const exams = await Exam.find({ subject: subject }).select('_id');
            const examIds = exams.map(e => e._id);
            query.examId = { $in: examIds };
        }

        // Return full result list for the table
        // Populate exam details to get the subject name if not filtered
        const results = await ExamResult.find(query)
            .populate('examId', 'title subject month year')
            .sort({ submittedAt: -1 });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
