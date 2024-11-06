const mongoose = require('mongoose');

const logEventSchema = new mongoose.Schema({
    timestamp: Date,
    event_type: String,
    message: String,
    source: String,
});

const LogEvent = mongoose.model('LogEvent', logEventSchema);

module.exports = LogEvent;
