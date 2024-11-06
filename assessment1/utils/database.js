const mongoose = require('mongoose');
const LogEvent = require('../models/logEvent');

mongoose.connect('mongodb://localhost:27017/logging', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function saveToDatabase(event) {
    try {
        const logEvent = new LogEvent(event);
        await logEvent.save();
    } catch (error) {
        console.error('Database error:', error);
    }
}

module.exports = { saveToDatabase };
