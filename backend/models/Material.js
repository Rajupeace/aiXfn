const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true // Or false if Admin uploads
  },
  year: {
    type: String,
    required: true
  },
  section: {
    type: String,
    // required: true // Made optional as some uploads might be wider? No, user wants specific.
    default: 'All'
  },
  subject: {
    type: String,
    required: true
  },
  module: String,
  unit: String,
  topic: String,
  type: {
    type: String,
    enum: ['notes', 'assignment', 'question_paper', 'syllabus', 'other', 'videos', 'interview'],
    required: true
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

// Update the updatedAt field before saving
materialSchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Material', materialSchema);
