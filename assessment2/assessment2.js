const Queue = require('bull');
const fetch = require('node-fetch');
const Redis = require('redis');

// Redis client setup
const redisClient = Redis.createClient();
redisClient.connect();

// Task queues setup for short-running and long-running tasks
const shortTaskQueue = new Queue('shortTaskQueue', { redis: { host: '127.0.0.1', port: 6379 } });
const longTaskQueue = new Queue('longTaskQueue', { redis: { host: '127.0.0.1', port: 6379 } });

// Constants
const MAX_RETRIES = 5;
const BASE_BACKOFF_DELAY = 1000; // 1 second
const TASK_TIMEOUT = 5000; // 5 seconds for short tasks

// Helper function: Exponential backoff
async function retryWithBackoff(apiCall, maxRetries) {
    let delay = BASE_BACKOFF_DELAY;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            if (attempt === maxRetries - 1) throw error; // Final attempt, propagate the error
            console.log(`Attempt ${attempt + 1} failed, retrying in ${delay} ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
}

// External API Call Simulation using node-fetch
async function callExternalApi(taskData) {
    const apiUrl = `https://api.example.com/process-task/${taskData.id}`;
    const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify(taskData) });
    if (!response.ok) throw new Error('API call failed');
    return response.json();
}

// Worker processing function with timeout for short-running tasks
async function processTask(job, queueType) {
    const taskData = job.data;

    // Deduplication check - avoid reprocessing if already completed
    const taskStatus = await redisClient.get(`task_status_${taskData.id}`);
    if (taskStatus === 'completed') {
        console.log(`Task ${taskData.id} already completed. Skipping...`);
        return;
    }

    try {
        // Process the task with retries and backoff, within the timeout limit for short tasks
        const processTaskWithTimeout = queueType === 'short'
            ? Promise.race([
                retryWithBackoff(() => callExternalApi(taskData), MAX_RETRIES),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Task timed out')), TASK_TIMEOUT))
            ])
            : retryWithBackoff(() => callExternalApi(taskData), MAX_RETRIES);

        await processTaskWithTimeout;

        // Mark the task as completed
        await redisClient.set(`task_status_${taskData.id}`, 'completed');
        console.log(`Task ${taskData.id} completed successfully.`);
    } catch (error) {
        console.error(`Task ${taskData.id} failed: ${error.message}`);
        // Optionally, requeue or log failed tasks for manual intervention
    }
}

// Worker setup - process tasks from the short and long task queues
shortTaskQueue.process(async job => {
    console.log(`Processing short task ${job.data.id} with priority ${job.opts.priority}`);
    await processTask(job, 'short');
});

longTaskQueue.process(async job => {
    console.log(`Processing long task ${job.data.id}`);
    await processTask(job, 'long');
});

// Adding tasks to the appropriate queue
async function addTaskToQueue(taskData, priority = 1, isLongRunning = false) {
    const queue = isLongRunning ? longTaskQueue : shortTaskQueue;
    await queue.add(taskData, { priority });
    console.log(`Task ${taskData.id} added to ${isLongRunning ? 'long' : 'short'} queue with priority ${priority}.`);
}

// Example task submissions
addTaskToQueue({ id: 'short_task_1', info: 'Short task data' }, 1, false); // Short, high priority
addTaskToQueue({ id: 'long_task_1', info: 'Long task data' }, 1, true);    // Long-running
