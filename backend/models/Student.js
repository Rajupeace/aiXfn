const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  profileImage: String,
  avatar: String,
  studentToken: String,
  tokenIssuedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  attendance: {
    overall: { type: Number, default: 0 },
    semester: { type: Number, default: 0 },
    history: [{
      date: Date,
      status: String, // 'Present', 'Absent'
      subject: String
    }],
    subjectWise: [{
      subjectName: String,
      subjectCode: String,
      attended: Number,
      total: Number,
      percentage: Number
    }]
  },
  interactionStats: {
    aiUsageCount: { type: Number, default: 0 },
    advancedCourseOpenCount: { type: Number, default: 0 }
  },
  advancedProgress: {
    basic: { progress: { type: Number, default: 0 }, unlocked: { type: Boolean, default: true } },
    intermediate: { progress: { type: Number, default: 0 }, unlocked: { type: Boolean, default: false } },
    advanced: { progress: { type: Number, default: 0 }, unlocked: { type: Boolean, default: false } }
  },
  testResults: [{
    testId: String,
    subject: String,
    level: String, // 'Basic', 'Intermediate', 'Advanced', or 'Semester'
    score: Number,
    total: Number,
    percentage: Number,
    status: String, // 'Pass', 'Fail'
    date: { type: Date, default: Date.now }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
studentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Student', studentSchema);
