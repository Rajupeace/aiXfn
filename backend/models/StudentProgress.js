const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
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
  currentLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  easy: {
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    lastAttempt: Date,
    unlocked: { type: Boolean, default: true }
  },
  medium: {
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    lastAttempt: Date,
    unlocked: { type: Boolean, default: false }
  },
  hard: {
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    lastAttempt: Date,
    unlocked: { type: Boolean, default: false }
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  testHistory: [{
    testId: String,
    difficulty: String,
    score: Number,
    total: Number,
    percentage: Number,
    date: { type: Date, default: Date.now },
    questions: [{
      questionId: String,
      selectedAnswer: Number,
      isCorrect: Boolean
    }]
  }],
  dailyQuestions: [{
    date: { type: Date, default: Date.now },
    questionsAttempted: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for faster queries
studentProgressSchema.index({ studentId: 1, subject: 1 });
studentProgressSchema.index({ studentId: 1, course: 1 });

// Method to calculate overall progress
studentProgressSchema.methods.calculateProgress = function() {
  const total = this.easy.totalQuestions + this.medium.totalQuestions + this.hard.totalQuestions;
  const correct = this.easy.correctAnswers + this.medium.correctAnswers + this.hard.correctAnswers;
  return total > 0 ? Math.round((correct / total) * 100) : 0;
};

// Method to unlock next level
studentProgressSchema.methods.unlockNextLevel = function() {
  if (this.currentLevel === 'easy' && this.easy.correctAnswers >= 10 && this.easy.attempts >= 5) {
    this.medium.unlocked = true;
    this.currentLevel = 'medium';
  } else if (this.currentLevel === 'medium' && this.medium.correctAnswers >= 10 && this.medium.attempts >= 5) {
    this.hard.unlocked = true;
    this.currentLevel = 'hard';
  }
};

studentProgressSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('StudentProgress', studentProgressSchema);

