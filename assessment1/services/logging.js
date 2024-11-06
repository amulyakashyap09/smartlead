const { queueEvent } = require('../utils/queue');

async function logEvent(event) {
    const { timestamp, event_type, message, source } = event;

    if (!timestamp || !event_type || !message || !source) {
        throw new Error('Invalid event data');
    }

    await queueEvent(event);
}

module.exports = { logEvent };
