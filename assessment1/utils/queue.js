const Queue = require('bull');
const eventQueue = new Queue('eventQueue');
const { saveToDatabase } = require('../utils/database');

eventQueue.process(async (job) => {
  await saveToDatabase(job.data);
});

async function queueEvent(event) {
  await eventQueue.add(event);
}

module.exports = { queueEvent };
