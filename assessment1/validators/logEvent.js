const Joi = require('joi');

const logEventSchema = Joi.object({
  timestamp: Joi.date().iso().required(),
  event_type: Joi.string().valid('INFO', 'ERROR', 'DEBUG').required(),
  message: Joi.string().min(1).max(5000).required(),
  source: Joi.string().min(1).max(100).required(),
});

function validateLogEvent(req, res, next) {
  const { error } = logEventSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  next();
}

module.exports = { validateLogEvent };
