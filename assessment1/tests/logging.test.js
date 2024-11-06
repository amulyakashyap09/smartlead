const { logEvent } = require('../services/loggingService');
const { queueEvent } = require('../utils/queue');

jest.mock('../utils/queue');

describe('Logging Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('logs a valid event', async () => {
        const event = {
            timestamp: new Date().toISOString(),
            event_type: 'INFO',
            message: 'Test log message',
            source: 'test-service',
        };

        queueEvent.mockResolvedValueOnce();

        await expect(logEvent(event)).resolves.not.toThrow();
        expect(queueEvent).toHaveBeenCalledWith(event);
    });

    test('throws error on invalid event', async () => {
        const invalidEvent = { event_type: 'INFO' };

        await expect(logEvent(invalidEvent)).rejects.toThrow('Invalid event data');
        expect(queueEvent).not.toHaveBeenCalled();
    });
});
