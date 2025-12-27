const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Message text is required']
    },
    target: {
        type: String,
        enum: ['all', 'students', 'faculty'],
        default: 'all'
    },
    type: {
        type: String, // 'announcement', 'notification', 'material'
        default: 'notification'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);
