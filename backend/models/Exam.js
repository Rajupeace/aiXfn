const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    subject: {
        type: String,
        required: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    year: {
        type: String,
        required: true
    },
    branch: {
        type: String, // e.g., 'CSE', 'ECE', or 'All'
        required: true
    },
    section: {
        type: String, // e.g., 'A', 'B', 'All'
        default: 'All'
    },
    unit: String,
    topics: [String],
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    duration: {
        type: Number, // In minutes
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingMarks: {
        type: Number,
        default: 0
    },
    startTime: Date,
    endTime: Date,
    status: {
        type: String,
        enum: ['draft', 'published', 'completed'],
        default: 'draft'
    },
    generatedLink: String, // Unique link for the exam
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exam', examSchema);
