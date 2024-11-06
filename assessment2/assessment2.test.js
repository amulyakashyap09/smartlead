const Queue = require('bull');
const fetch = require('node-fetch');
const Redis = require('redis-mock');
const { retryWithBackoff, callExternalApi, processTask, addTaskToQueue } = require('./assessment2');

jest.mock('node-fetch');
jest.mock('bull');

describe('Task Processing System', () => {
  let redisClient;
  let shortTaskQueue;
  let longTaskQueue;

  beforeAll(() => {
    redisClient = Redis.createClient();
    redisClient.connect();
    shortTaskQueue = new Queue('shortTaskQueue');
    longTaskQueue = new Queue('longTaskQueue');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    redisClient.flushall();
  });

  afterAll(() => {
    redisClient.quit();
  });

  describe('retryWithBackoff', () => {
    it('should retry with exponential backoff and eventually succeed', async () => {
      const mockApiCall = jest.fn()
        .mockRejectedValueOnce(new Error('API error'))
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce('Success');
      
      const result = await retryWithBackoff(mockApiCall, 3);
      expect(result).toBe('Success');
      expect(mockApiCall).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries are exceeded', async () => {
      const mockApiCall = jest.fn().mockRejectedValue(new Error('API error'));
      await expect(retryWithBackoff(mockApiCall, 3)).rejects.toThrow('API error');
      expect(mockApiCall).toHaveBeenCalledTimes(3);
    });
  });

  describe('callExternalApi', () => {
    it('should call external API and return data on success', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: 'data' }),
      });

      const taskData = { id: 'test_task' };
      const result = await callExternalApi(taskData);
      expect(result).toEqual({ result: 'data' });
      expect(fetch).toHaveBeenCalledWith('https://api.example.com/process-task/test_task', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(taskData),
      }));
    });

    it('should throw error if API call fails', async () => {
      fetch.mockResolvedValueOnce({ ok: false });
      await expect(callExternalApi({ id: 'test_task' })).rejects.toThrow('API call failed');
    });
  });

  describe('processTask', () => {
    it('should process task successfully and set status to completed', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: 'data' }),
      });

      const job = { data: { id: 'test_task' } };
      await processTask(job, 'short');

      const status = await redisClient.get(`task_status_test_task`);
      expect(status).toBe('completed');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should skip processing if task is already completed', async () => {
      await redisClient.set(`task_status_test_task`, 'completed');
      const job = { data: { id: 'test_task' } };

      await processTask(job, 'short');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should timeout for long-running tasks', async () => {
      fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 6000, { ok: true }))); // Simulate delay

      const job = { data: { id: 'test_task' } };
      await expect(processTask(job, 'short')).rejects.toThrow('Task timed out');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should process long-running task without timeout', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: 'data' }),
      });

      const job = { data: { id: 'test_task_long' } };
      await processTask(job, 'long');

      const status = await redisClient.get(`task_status_test_task_long`);
      expect(status).toBe('completed');
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('addTaskToQueue', () => {
    it('should add task to short queue with priority', async () => {
      shortTaskQueue.add = jest.fn();
      const taskData = { id: 'short_task_1', info: 'Short task data' };

      await addTaskToQueue(taskData, 1, false);
      expect(shortTaskQueue.add).toHaveBeenCalledWith(taskData, { priority: 1 });
    });

    it('should add task to long queue with priority', async () => {
      longTaskQueue.add = jest.fn();
      const taskData = { id: 'long_task_1', info: 'Long task data' };

      await addTaskToQueue(taskData, 2, true);
      expect(longTaskQueue.add).toHaveBeenCalledWith(taskData, { priority: 2 });
    });
  });
});
