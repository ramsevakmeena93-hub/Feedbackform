const ActivityLog = require('../models/ActivityLog');

async function log(hodId, type, message, metadata = {}, status = 'info') {
  try {
    await ActivityLog.create({ hodId, type, message, metadata, status });
  } catch (err) {
    console.error('[Logger] Failed to save log:', err.message);
  }
}

module.exports = { log };
