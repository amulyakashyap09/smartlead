const express = require('express');
const { logEvent } = require('./services/logging');
const { validateLogEvent } = require('./validators/logEvent');
const app = express();
app.use(express.json());

app.post('/log-event', validateLogEvent, async (req, res) => {
    try {
        await logEvent(req.body);
        res.status(200).json({ message: 'Log event received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process log event' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
