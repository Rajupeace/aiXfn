const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number, // Index of correct option (0-3)
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    default: 'easy'
  },
  subject: {
    type: String,
    required: true
  },
  subjectCode: String,
  course: {
    type: String, // For advanced courses
    default: null
  },
  year: String,
  branch: {
    type: String,
    default: 'All'
  },
  semester: String,
  module: String,
  unit: String,
  topic: String,
  tags: [String],
  points: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  correctAttempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

questionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
questionSchema.index({ subject: 1, difficulty: 1, isActive: 1 });
questionSchema.index({ course: 1, difficulty: 1, isActive: 1 });

module.exports = mongoose.model('Question', questionSchema);

