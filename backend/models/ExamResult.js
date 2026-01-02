const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    studentId: {
        type: String, // Likely the student's unique ID/roll number
        required: true
    },
    studentName: String, // Cache name for easier display
    year: String,
    branch: String,
    section: String,
    score: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    isPassed: {
        type: Boolean,
        default: false
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        selectedOption: Number, // 0-3
        isCorrect: Boolean
    }],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for unique attempts (if we only allow one)
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ExamResult', examResultSchema);
